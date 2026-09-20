package com.siva.siva.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.siva.siva.models.Users;
import com.siva.siva.models.Flight;
import com.siva.siva.models.Hotel;
import com.siva.siva.models.Review;
import com.siva.siva.repositories.UserRepository;
import com.siva.siva.repositories.FlightRepository;
import com.siva.siva.repositories.HotelRepository;
import com.siva.siva.services.ReviewService;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/review/flagged")
    public List<Review> getFlaggedReviews(){
        return reviewService.getFlaggedReviews();
    }

    @DeleteMapping("/review/{reviewId}")
    public void deleteReview(@PathVariable String reviewId){
        reviewService.deleteReview(reviewId);
    }

    @PostMapping("/review/{reviewId}/dismiss")
    public Review dismissFlag(@PathVariable String reviewId){
        return reviewService.dismissFlag(reviewId);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getallusers(){
        List<Users> users=userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    @PostMapping("/flight")
    public Flight addflight(@RequestBody Flight flight){
        if(flight.getTotalSeats() <= 0){
            flight.setTotalSeats(flight.getAvailableSeats());
        }
        return flightRepository.save(flight);
    }

    @PostMapping("/hotel")
    public Hotel addhotel(@RequestBody Hotel hotel){
        return hotelRepository.save(hotel);
    }
    @PutMapping("flight/{id}")
    public ResponseEntity<Flight> editflight(@PathVariable String id, @RequestBody Flight updatedFlight){
        Optional<Flight> flightOptional=flightRepository.findById(id);
        if(flightOptional.isPresent()){
            Flight flight = flightOptional.get();
            flight.setFlightName(updatedFlight.getFlightName());
            flight.setFrom(updatedFlight.getFrom());
            flight.setTo(updatedFlight.getTo());
            flight.setDepartureTime(updatedFlight.getDepartureTime());
            flight.setArrivalTime(updatedFlight.getArrivalTime());
            flight.setPrice(updatedFlight.getPrice());
            flight.setAvailableSeats(updatedFlight.getAvailableSeats());
            flightRepository.save(flight);
            return  ResponseEntity.ok(flight);
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("hotel/{id}")
    public ResponseEntity<Hotel> editHotel (@PathVariable String id, @RequestBody Hotel updatedHotel){
        Optional<Hotel> hotelOptional=hotelRepository.findById(id);
        if(hotelOptional.isPresent()){
            Hotel hotel = hotelOptional.get();
            hotel.sethotelName(updatedHotel.gethotelName());
            hotel.setLocation(updatedHotel.getLocation());
            hotel.setAvailableRooms(updatedHotel.getAvailableRooms());
            hotel.setPricePerNight(updatedHotel.getPricePerNight());
            hotel.setamenities((updatedHotel.getamenities()));
            hotelRepository.save(hotel);
            return ResponseEntity.ok(hotel);
            }
        return ResponseEntity.notFound().build();
    }

}