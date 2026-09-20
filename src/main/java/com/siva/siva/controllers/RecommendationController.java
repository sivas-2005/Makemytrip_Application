package com.siva.siva.controllers;

import com.siva.siva.services.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {
    @Autowired
    private RecommendationService recommendationService;

    @GetMapping
    public List<RecommendationService.Recommendation> getRecommendations(@RequestParam String userId) {
        return recommendationService.getRecommendations(userId);
    }

    @PostMapping("/feedback")
    public void submitFeedback(@RequestBody Map<String, String> body) {
        recommendationService.recordFeedback(
                body.get("userId"), body.get("targetType"), body.get("targetId"), body.get("feedback"));
    }
}
