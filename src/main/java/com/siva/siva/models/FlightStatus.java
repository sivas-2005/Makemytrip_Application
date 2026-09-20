package com.siva.siva.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "flight_status")
public class FlightStatus {
    @Id
    private String id;
    private String flightId;
    private String status; // "On Time", "Delayed", "Boarding", "Departed", "Landed"
    private int delayMinutes;
    private String reason;
    private String revisedDeparture;
    private String revisedArrival;
    private String updatedAt;
    private List<StatusEvent> history = new ArrayList<>();

    public static class StatusEvent {
        private String status;
        private int delayMinutes;
        private String reason;
        private String timestamp;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getDelayMinutes() { return delayMinutes; }
        public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRevisedDeparture() { return revisedDeparture; }
    public void setRevisedDeparture(String revisedDeparture) { this.revisedDeparture = revisedDeparture; }

    public String getRevisedArrival() { return revisedArrival; }
    public void setRevisedArrival(String revisedArrival) { this.revisedArrival = revisedArrival; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public List<StatusEvent> getHistory() { return history; }
    public void setHistory(List<StatusEvent> history) { this.history = history; }
}
