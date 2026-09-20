package com.siva.siva.controllers;

import com.siva.siva.models.PriceFreeze;
import com.siva.siva.models.PriceInfo;
import com.siva.siva.services.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/pricing")
@CrossOrigin(origins = "*")
public class PricingController {
    @Autowired
    private PricingService pricingService;

    @GetMapping("/{targetType}/{targetId}")
    public Map<String, Object> getPricing(
            @PathVariable String targetType,
            @PathVariable String targetId,
            @RequestParam(required = false) String userId) {
        PriceInfo info = pricingService.getOrCreate(targetType, targetId);
        PriceFreeze freeze = userId != null
                ? pricingService.getActiveFreeze(userId, targetType, targetId)
                : null;
        double effectivePrice = pricingService.getEffectivePrice(userId, targetType, targetId);

        Map<String, Object> response = new HashMap<>();
        response.put("basePrice", info.getBasePrice());
        response.put("currentPrice", info.getCurrentPrice());
        response.put("effectivePrice", effectivePrice);
        response.put("demandLevel", info.getDemandLevel());
        response.put("history", info.getHistory());
        response.put("freeze", freeze);
        return response;
    }

    @PostMapping("/{targetType}/{targetId}/freeze")
    public PriceFreeze freeze(
            @PathVariable String targetType,
            @PathVariable String targetId,
            @RequestParam String userId) {
        return pricingService.freezePrice(userId, targetType, targetId);
    }
}
