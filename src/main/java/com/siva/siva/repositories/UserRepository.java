package com.siva.siva.repositories;
import com.siva.siva.models.Users;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<Users,String>{
    Users findByEmail(String email);
}