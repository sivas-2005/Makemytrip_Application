package com.siva.siva.repositories;

import com.siva.siva.models.PriceFreeze;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PriceFreezeRepository extends MongoRepository<PriceFreeze, String> {
    Optional<PriceFreeze> findByUserIdAndTargetTypeAndTargetId(String userId, String targetType, String targetId);
}
