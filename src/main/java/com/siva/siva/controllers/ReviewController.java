package com.siva.siva.controllers;

import com.siva.siva.models.Review;
import com.siva.siva.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/review")
@CrossOrigin(origins = "*")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping("/add")
    public Review addReview(@RequestBody Review review) {
        return reviewService.addReview(review);
    }

    @GetMapping("/{targetType}/{targetId}")
    public List<Review> getReviews(
            @PathVariable String targetType,
            @PathVariable String targetId,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        return reviewService.getReviews(targetType, targetId, sort);
    }

    @PostMapping("/{reviewId}/reply")
    public Review addReply(@PathVariable String reviewId, @RequestBody Map<String, String> body) {
        return reviewService.addReply(reviewId, body.get("userId"), body.get("userName"), body.get("text"));
    }

    @PostMapping("/{reviewId}/helpful")
    public Review markHelpful(@PathVariable String reviewId, @RequestParam String userId) {
        return reviewService.markHelpful(reviewId, userId);
    }

    @PostMapping("/{reviewId}/flag")
    public Review flagReview(@PathVariable String reviewId, @RequestBody Map<String, String> body) {
        return reviewService.flagReview(reviewId, body.get("reason"));
    }
}
