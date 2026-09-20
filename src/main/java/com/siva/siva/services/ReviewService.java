package com.siva.siva.services;

import com.siva.siva.models.Review;
import com.siva.siva.repositories.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    public Review addReview(Review review) {
        review.setCreatedAt(LocalDateTime.now().toString());
        review.setFlagged(false);
        review.setHelpfulCount(0);
        if (review.getRating() < 1) review.setRating(1);
        if (review.getRating() > 5) review.setRating(5);
        return reviewRepository.save(review);
    }

    public List<Review> getReviews(String targetType, String targetId, String sort) {
        List<Review> reviews = reviewRepository.findByTargetTypeAndTargetId(targetType, targetId);
        if (sort == null) sort = "newest";
        switch (sort) {
            case "highest":
                reviews.sort(Comparator.comparingInt(Review::getRating).reversed());
                break;
            case "helpful":
                reviews.sort(Comparator.comparingInt(Review::getHelpfulCount).reversed());
                break;
            case "newest":
            default:
                reviews.sort((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                });
        }
        return reviews;
    }

    public Review addReply(String reviewId, String userId, String userName, String text) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        Review.Reply reply = new Review.Reply();
        reply.setUserId(userId);
        reply.setUserName(userName);
        reply.setText(text);
        reply.setCreatedAt(LocalDateTime.now().toString());
        review.getReplies().add(reply);
        return reviewRepository.save(review);
    }

    public Review markHelpful(String reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getHelpfulBy().contains(userId)) {
            review.getHelpfulBy().add(userId);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
            reviewRepository.save(review);
        }
        return review;
    }

    public Review flagReview(String reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setFlagged(true);
        review.setFlagReason(reason);
        return reviewRepository.save(review);
    }

    public List<Review> getFlaggedReviews() {
        return reviewRepository.findByFlaggedTrue();
    }

    public void deleteReview(String reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    public Review dismissFlag(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setFlagged(false);
        review.setFlagReason(null);
        return reviewRepository.save(review);
    }
}
