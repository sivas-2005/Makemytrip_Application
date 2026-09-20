package com.siva.siva.services;

import com.siva.siva.models.Flight;
import com.siva.siva.models.Hotel;
import com.siva.siva.models.PriceFreeze;
import com.siva.siva.models.PriceInfo;
import com.siva.siva.repositories.FlightRepository;
import com.siva.siva.repositories.HotelRepository;
import com.siva.siva.repositories.PriceFreezeRepository;
import com.siva.siva.repositories.PriceInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class PricingService {
    @Autowired
    private PriceInfoRepository priceInfoRepository;

    @Autowired
    private PriceFreezeRepository priceFreezeRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    private final Random random = new Random();
    private static final int FREEZE_MINUTES = 3;
    private static final int MAX_HISTORY_POINTS = 24;

    private double getBasePrice(String targetType, String targetId) {
        if ("Flight".equals(targetType)) {
            Flight flight = flightRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Flight not found"));
            return flight.getPrice();
        } else {
            Hotel hotel = hotelRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            return hotel.getPricePerNight();
        }
    }

    private String demandLevelFor(double currentPrice, double basePrice) {
        double ratio = currentPrice / basePrice;
        if (ratio < 0.9) return "Low";
        if (ratio < 1.1) return "Medium";
        if (ratio < 1.35) return "High";
        return "Peak";
    }

    public PriceInfo getOrCreate(String targetType, String targetId) {
        Optional<PriceInfo> existing = priceInfoRepository.findByTargetTypeAndTargetId(targetType, targetId);
        if (existing.isPresent()) return existing.get();

        double basePrice = getBasePrice(targetType, targetId);
        PriceInfo info = new PriceInfo();
        info.setTargetType(targetType);
        info.setTargetId(targetId);
        info.setBasePrice(basePrice);
        info.setCurrentPrice(basePrice);
        info.setDemandLevel(demandLevelFor(basePrice, basePrice));
        info.setUpdatedAt(LocalDateTime.now().toString());
        addHistoryPoint(info, basePrice, "Listed price");
        return priceInfoRepository.save(info);
    }

    private void addHistoryPoint(PriceInfo info, double price, String reason) {
        PriceInfo.PricePoint point = new PriceInfo.PricePoint();
        point.setPrice(price);
        point.setReason(reason);
        point.setTimestamp(LocalDateTime.now().toString());
        info.getHistory().add(point);
        while (info.getHistory().size() > MAX_HISTORY_POINTS) {
            info.getHistory().remove(0);
        }
    }

    public PriceFreeze freezePrice(String userId, String targetType, String targetId) {
        PriceInfo info = getOrCreate(targetType, targetId);
        PriceFreeze freeze = priceFreezeRepository
                .findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId)
                .orElseGet(PriceFreeze::new);
        freeze.setUserId(userId);
        freeze.setTargetType(targetType);
        freeze.setTargetId(targetId);
        freeze.setFrozenPrice(info.getCurrentPrice());
        freeze.setFrozenAt(LocalDateTime.now().toString());
        freeze.setExpiresAt(LocalDateTime.now().plusMinutes(FREEZE_MINUTES).toString());
        return priceFreezeRepository.save(freeze);
    }

    public PriceFreeze getActiveFreeze(String userId, String targetType, String targetId) {
        Optional<PriceFreeze> freezeOpt = priceFreezeRepository
                .findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
        if (freezeOpt.isEmpty()) return null;
        PriceFreeze freeze = freezeOpt.get();
        try {
            if (LocalDateTime.parse(freeze.getExpiresAt()).isAfter(LocalDateTime.now())) {
                return freeze;
            }
        } catch (Exception ignored) {}
        return null;
    }

    public double getEffectivePrice(String userId, String targetType, String targetId) {
        if (userId != null) {
            PriceFreeze freeze = getActiveFreeze(userId, targetType, targetId);
            if (freeze != null) return freeze.getFrozenPrice();
        }
        return getOrCreate(targetType, targetId).getCurrentPrice();
    }

    // Simulates demand-driven pricing: price drifts based on simulated demand every tick.
    @Scheduled(fixedRate = 20000)
    public void adjustPrices() {
        List<PriceInfo> all = priceInfoRepository.findAll();
        for (PriceInfo info : all) {
            double roll = random.nextDouble();
            double changePercent;
            String reason;

            if (roll < 0.1) {
                changePercent = 0.15 + random.nextDouble() * 0.10; // +15% to +25%
                reason = "Peak demand surge";
            } else if (roll < 0.4) {
                changePercent = 0.02 + random.nextDouble() * 0.06; // +2% to +8%
                reason = "Demand rising";
            } else if (roll < 0.7) {
                changePercent = -(0.02 + random.nextDouble() * 0.06); // -2% to -8%
                reason = "Demand easing";
            } else {
                continue; // no change this tick
            }

            double newPrice = info.getCurrentPrice() * (1 + changePercent);
            double floor = info.getBasePrice() * 0.7;
            double ceiling = info.getBasePrice() * 1.6;
            newPrice = Math.max(floor, Math.min(ceiling, newPrice));
            newPrice = Math.round(newPrice);

            info.setCurrentPrice(newPrice);
            info.setDemandLevel(demandLevelFor(newPrice, info.getBasePrice()));
            info.setUpdatedAt(LocalDateTime.now().toString());
            addHistoryPoint(info, newPrice, reason);
            priceInfoRepository.save(info);
        }
    }
}
