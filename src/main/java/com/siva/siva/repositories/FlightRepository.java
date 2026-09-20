package com.siva.siva.repositories;
import com.siva.siva.models.Flight;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface FlightRepository  extends MongoRepository<Flight,String>{
}