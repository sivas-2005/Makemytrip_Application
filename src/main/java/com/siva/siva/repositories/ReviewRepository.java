package com.siva.siva.repositories;

import com.siva.siva.models.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByTargetTypeAndTargetId(String targetType, String targetId);
    List<Review> findByFlaggedTrue();
}
