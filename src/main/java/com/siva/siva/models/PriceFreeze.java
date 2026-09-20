package com.siva.siva.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "price_freezes")
public class PriceFreeze {
    @Id
    private String id;
    private String userId;
    private String targetType;
    private String targetId;
    private double frozenPrice;
    private String frozenAt;
    private String expiresAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public double getFrozenPrice() { return frozenPrice; }
    public void setFrozenPrice(double frozenPrice) { this.frozenPrice = frozenPrice; }

    public String getFrozenAt() { return frozenAt; }
    public void setFrozenAt(String frozenAt) { this.frozenAt = frozenAt; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}
