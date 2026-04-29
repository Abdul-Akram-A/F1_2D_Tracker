package com.f12d.Ingestor.service;

import com.f12d.Ingestor.interfaces.TelemetryServiceI;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;


@Service
public class TelemetryService implements TelemetryServiceI {

    private final WebClient webClient;

    private LocalDateTime fromTime = LocalDateTime.parse("2026-03-15T07:09:58");
    private LocalDateTime toTime   = LocalDateTime.parse("2026-03-15T07:10:00");

    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public TelemetryService(WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    @Scheduled(fixedRate = 2000) // every 2 seconds
    public void fetchTelemetryData() {

        String from = fromTime.format(formatter);
        String to   = toTime.format(formatter);

        String uri = String.format(
                "https://api.openf1.org/v1/location?session_key=%s&date>=%s&date<=%s",
                11245, from, to
        );

        System.out.println("Calling: " + uri); // debug

        List<Map<String, Object>> response = webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(List.class)
                .block();

        if (response != null && !response.isEmpty()) {
            response.forEach(System.out::println);
        } else {
            System.out.println("No data for range: " + from + " -> " + to);
        }

        // move window
        fromTime = fromTime.plusSeconds(2);
        toTime   = toTime.plusSeconds(2);
    }
}