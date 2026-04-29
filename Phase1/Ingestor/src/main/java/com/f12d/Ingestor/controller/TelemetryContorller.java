package com.f12d.Ingestor.controller;


import com.f12d.Ingestor.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/telemetry")
@RequiredArgsConstructor
public class TelemetryContorller {
    private final TelemetryService telemetryService;

    @GetMapping("/fetch")
    public void fetchTelemetryData() {
        telemetryService.fetchTelemetryData();
    }
}
