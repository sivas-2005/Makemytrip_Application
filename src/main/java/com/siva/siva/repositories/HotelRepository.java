package com.siva.siva.repositories;
import com.siva.siva.models.Hotel;

import org.springframework.data.mongodb.repository.MongoRepository;
public interface HotelRepository extends MongoRepository<Hotel,String>{
}