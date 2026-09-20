package com.siva.siva.controllers;

import com.siva.siva.models.FlightStatus;
import com.siva.siva.services.FlightStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/flight-status")
@CrossOrigin(origins = "*")
public class FlightStatusController {
    @Autowired
    private FlightStatusService flightStatusService;

    @GetMapping("/{flightId}")
    public FlightStatus getStatus(@PathVariable String flightId) {
        return flightStatusService.getOrCreateStatus(flightId);
    }

    @GetMapping("/batch")
    public List<FlightStatus> getStatuses(@RequestParam String ids) {
        List<String> flightIds = Arrays.asList(ids.split(","));
        return flightStatusService.getStatuses(flightIds);
    }
}
