package com.siva.siva.repositories;

import com.siva.siva.models.RecommendationFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RecommendationFeedbackRepository extends MongoRepository<RecommendationFeedback, String> {
    List<RecommendationFeedback> findByUserId(String userId);
}
