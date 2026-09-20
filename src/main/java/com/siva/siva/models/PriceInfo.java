package com.siva.siva.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "price_info")
public class PriceInfo {
    @Id
    private String id;
    private String targetType; // "Flight" or "Hotel"
    private String targetId;
    private double basePrice;
    private double currentPrice;
    private String demandLevel; // "Low", "Medium", "High", "Peak"
    private String updatedAt;
    private List<PricePoint> history = new ArrayList<>();

    public static class PricePoint {
        private double price;
        private String reason;
        private String timestamp;

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public String getDemandLevel() { return demandLevel; }
    public void setDemandLevel(String demandLevel) { this.demandLevel = demandLevel; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public List<PricePoint> getHistory() { return history; }
    public void setHistory(List<PricePoint> history) { this.history = history; }
}
