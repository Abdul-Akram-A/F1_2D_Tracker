package com.f12d.Ingestor.service;

import com.f12d.Ingestor.interfaces.TelemetryServiceI;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class TelemetryService implements TelemetryServiceI {

    private final WebClient webClient;
    private final SimpMessagingTemplate messagingTemplate;

    private LocalDateTime fromTime = LocalDateTime.parse("2026-03-15T07:00:00");
    private LocalDateTime toTime   = LocalDateTime.parse("2026-03-15T07:00:02");

    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    private int emptyResponseCount = 0;
    private boolean raceFinished = false;
    private static final int EMPTY_THRESHOLD = 5;

    // 🔥 Store LAST valid data
    private List<Map<String, Object>> lastValidResponse = null;

    public TelemetryService(WebClient webClient, SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.webClient = webClient;
    }

    @Override
    @Scheduled(fixedRate = 2000)
    public void fetchTelemetryData() {

        if (raceFinished) {
            return;
        }

        String from = fromTime.format(formatter);
        String to   = toTime.format(formatter);

        String uri = String.format(
                "https://api.openf1.org/v1/location?session_key=%s&date>=%s&date<=%s",
                11245, from, to
        );

        System.out.println("📡 Calling: " + uri);

        try {
            List<Map<String, Object>> response = webClient.get()
                    .uri(uri)
                    .retrieve()
                    .onStatus(
                            status -> status.value() == 404,
                            clientResponse -> {
                                // 👇 Convert 404 into empty response
                                return clientResponse.bodyToMono(String.class)
                                        .flatMap(body -> {
                                            return Mono.empty(); // no exception
                                        });
                            }
                    )
                    .bodyToMono(List.class)
                    .block();

            if (response != null && !response.isEmpty()) {

                messagingTemplate.convertAndSend("/topic/telemetry", response);

                emptyResponseCount = 0;

                lastValidResponse = response;

                System.out.println("✅ Data received: " + response.size());
                System.out.println(response.getFirst());

            } else {

                emptyResponseCount++;
                System.out.println("⚠️ No data... Count: " + emptyResponseCount);

                if (emptyResponseCount >= EMPTY_THRESHOLD) {
                    raceFinished = true;

                    System.out.println("\n🏁 FINAL DATA (Last Available):");

                    if (lastValidResponse != null) {
                        lastValidResponse.forEach(System.out::println);
                    } else {
                        System.out.println("No valid data captured.");
                    }

                    return;
                }
            }
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
        }

        fromTime = toTime;
        toTime   = toTime.plusSeconds(2);
    }
}