package com.siva.siva.services;

import com.siva.siva.models.Flight;
import com.siva.siva.models.FlightStatus;
import com.siva.siva.repositories.FlightRepository;
import com.siva.siva.repositories.FlightStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class FlightStatusService {
    @Autowired
    private FlightStatusRepository flightStatusRepository;

    @Autowired
    private FlightRepository flightRepository;

    private final Random random = new Random();

    private static final String[] DELAY_REASONS = {
            "Air traffic congestion",
            "Adverse weather conditions",
            "Aircraft technical inspection",
            "Crew scheduling delay",
            "Late arrival of incoming aircraft"
    };

    public FlightStatus getOrCreateStatus(String flightId) {
        Optional<FlightStatus> existing = flightStatusRepository.findByFlightId(flightId);
        if (existing.isPresent()) {
            return existing.get();
        }
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        FlightStatus status = new FlightStatus();
        status.setFlightId(flightId);
        status.setStatus("On Time");
        status.setDelayMinutes(0);
        status.setRevisedDeparture(flight.getDepartureTime());
        status.setRevisedArrival(flight.getArrivalTime());
        status.setUpdatedAt(LocalDateTime.now().toString());
        return flightStatusRepository.save(status);
    }

    public List<FlightStatus> getStatuses(List<String> flightIds) {
        return flightIds.stream().map(this::getOrCreateStatus).toList();
    }

    private void recordHistory(FlightStatus status) {
        FlightStatus.StatusEvent event = new FlightStatus.StatusEvent();
        event.setStatus(status.getStatus());
        event.setDelayMinutes(status.getDelayMinutes());
        event.setReason(status.getReason());
        event.setTimestamp(LocalDateTime.now().toString());
        status.getHistory().add(event);
    }

    private LocalDateTime tryParse(String value) {
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException e) {
            return LocalDateTime.now();
        }
    }

    // Simulates a live flight-tracking feed: statuses drift forward over time.
    @Scheduled(fixedRate = 15000)
    public void progressFlightStatuses() {
        List<FlightStatus> all = flightStatusRepository.findAll();
        for (FlightStatus status : all) {
            boolean changed = false;
            String current = status.getStatus();

            if ("On Time".equals(current)) {
                double roll = random.nextDouble();
                if (roll < 0.2) {
                    int delay = 15 + random.nextInt(105);
                    status.setStatus("Delayed");
                    status.setDelayMinutes(delay);
                    status.setReason(DELAY_REASONS[random.nextInt(DELAY_REASONS.length)]);
                    LocalDateTime dep = tryParse(status.getRevisedDeparture()).plusMinutes(delay);
                    LocalDateTime arr = tryParse(status.getRevisedArrival()).plusMinutes(delay);
                    status.setRevisedDeparture(dep.toString());
                    status.setRevisedArrival(arr.toString());
                    changed = true;
                } else if (roll < 0.35) {
                    status.setStatus("Boarding");
                    changed = true;
                }
            } else if ("Delayed".equals(current)) {
                double roll = random.nextDouble();
                if (roll < 0.15) {
                    int extra = 10 + random.nextInt(30);
                    status.setDelayMinutes(status.getDelayMinutes() + extra);
                    status.setReason(DELAY_REASONS[random.nextInt(DELAY_REASONS.length)]);
                    LocalDateTime dep = tryParse(status.getRevisedDeparture()).plusMinutes(extra);
                    LocalDateTime arr = tryParse(status.getRevisedArrival()).plusMinutes(extra);
                    status.setRevisedDeparture(dep.toString());
                    status.setRevisedArrival(arr.toString());
                    changed = true;
                } else if (roll < 0.45) {
                    status.setStatus("Boarding");
                    changed = true;
                }
            } else if ("Boarding".equals(current)) {
                if (random.nextDouble() < 0.5) {
                    status.setStatus("Departed");
                    changed = true;
                }
            } else if ("Departed".equals(current)) {
                if (random.nextDouble() < 0.4) {
                    status.setStatus("Landed");
                    changed = true;
                }
            }

            if (changed) {
                status.setUpdatedAt(LocalDateTime.now().toString());
                recordHistory(status);
                flightStatusRepository.save(status);
            }
        }
    }
}
