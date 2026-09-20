package com.siva.siva.repositories;

import com.siva.siva.models.PriceInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PriceInfoRepository extends MongoRepository<PriceInfo, String> {
    Optional<PriceInfo> findByTargetTypeAndTargetId(String targetType, String targetId);
}
