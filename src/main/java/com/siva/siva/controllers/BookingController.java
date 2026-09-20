package com.siva.siva.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.siva.siva.models.Users;
import com.siva.siva.services.BookingService;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping("/flight")
    public Users.Booking bookFlight(
            @RequestParam String userId,
            @RequestParam String flightId,
            @RequestParam int seats,
            @RequestParam double price,
            @RequestParam(required = false) String selectedSeats){
        List<String> seatList = (selectedSeats != null && !selectedSeats.isEmpty())
                ? Arrays.asList(selectedSeats.split(","))
                : null;
        return bookingService.bookFlight(userId,flightId,seats,price,seatList);
    }
    @PostMapping("/hotel")
    public Users.Booking bookhotel (
            @RequestParam String userId,
            @RequestParam String hotelId,
            @RequestParam int rooms,
            @RequestParam double price,
            @RequestParam(required = false, defaultValue = "Standard") String roomType){
        return bookingService.bookhotel(userId,hotelId,rooms,price,roomType);
    }

    @PostMapping("/cancel")
    public Users.Booking cancelBooking(@RequestParam String userId,@RequestParam String reservationId,@RequestParam String reason){
        return bookingService.cancelBooking(userId, reservationId, reason);
    }
}
