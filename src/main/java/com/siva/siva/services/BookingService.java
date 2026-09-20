package com.siva.siva.services;
import com.siva.siva.models.Users;
import com.siva.siva.models.Users.Booking;
import com.siva.siva.models.Flight;
import com.siva.siva.models.Hotel;
import com.siva.siva.repositories.UserRepository;
import com.siva.siva.repositories.FlightRepository;
import com.siva.siva.repositories.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    // Refund policy: the sooner you cancel after booking, the higher the refund.
    // <=24 hours since booking -> 50% refund
    // <=72 hours since booking -> 25% refund
    // beyond that -> non-refundable (0%)
    private int calculateRefundPercentage(String bookedAtStr) {
        try {
            LocalDateTime bookedAt = LocalDateTime.parse(bookedAtStr);
            long hoursSinceBooking = Duration.between(bookedAt, LocalDateTime.now()).toHours();
            if (hoursSinceBooking <= 24) return 50;
            if (hoursSinceBooking <= 72) return 25;
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }

    public Booking bookFlight(String userId,String flightId,int seats,double price,List<String> selectedSeats){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Flight> flightOptional =flightRepository.findById(flightId);
        if(usersOptional.isPresent() && flightOptional.isPresent()){
            Users user=usersOptional.get();
            Flight flight=flightOptional.get();
            if(flight.getAvailableSeats() >= seats){
                if(selectedSeats != null && !selectedSeats.isEmpty()){
                    for(String seatLabel : selectedSeats){
                        if(flight.getBookedSeats().contains(seatLabel)){
                            throw new RuntimeException("Seat " + seatLabel + " is already booked");
                        }
                    }
                    flight.getBookedSeats().addAll(selectedSeats);
                }
                flight.setAvailableSeats(flight.getAvailableSeats()- seats);
                flightRepository.save(flight);

                Booking booking=new Booking();
                booking.setId(UUID.randomUUID().toString());
                booking.setType("Flight");
                booking.setBookingId(flightId);
                booking.setDate(LocalDate.now().toString());
                booking.setBookedAt(LocalDateTime.now().toString());
                booking.setStatus("Confirmed");
                booking.setQuantity(seats);
                booking.setTotalPrice(price);
                booking.setSeats(selectedSeats != null ? selectedSeats : new java.util.ArrayList<>());
                user.getBookings().add(booking);

                boolean anyPremium = selectedSeats != null && selectedSeats.stream()
                        .anyMatch(s -> isPremiumSeat(s));
                user.setPreferredSeatZone(anyPremium ? "Premium" : "Standard");

                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }

    // Rows 1-2 (labels starting with "1" or "2") are premium.
    private boolean isPremiumSeat(String seatLabel){
        if(seatLabel == null || seatLabel.isEmpty()) return false;
        String rowPart = seatLabel.replaceAll("[^0-9]", "");
        try {
            int row = Integer.parseInt(rowPart);
            return row <= 2;
        } catch (NumberFormatException e){
            return false;
        }
    }

    public Booking bookhotel(String userId,String hotelId,int rooms,double price,String roomType){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if(usersOptional.isPresent() && hotelOptional.isPresent()){
            Users user=usersOptional.get();
            Hotel hotel=hotelOptional.get();
            if(hotel.getAvailableRooms() >= rooms){
                hotel.setAvailableRooms(hotel.getAvailableRooms()- rooms);
                hotelRepository.save(hotel);

                Booking booking=new Booking();
                booking.setId(UUID.randomUUID().toString());
                booking.setType("Hotel");
                booking.setBookingId(hotelId);
                booking.setDate(LocalDate.now().toString());
                booking.setBookedAt(LocalDateTime.now().toString());
                booking.setStatus("Confirmed");
                booking.setQuantity(rooms);
                booking.setTotalPrice(price);
                booking.setRoomType(roomType != null ? roomType : "Standard");
                user.getBookings().add(booking);
                user.setPreferredRoomType(roomType != null ? roomType : "Standard");
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough rooms available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }

    public Booking cancelBooking(String userId, String reservationId, String reason){
        Optional<Users> usersOptional = userRepository.findById(userId);
        if(usersOptional.isEmpty()){
            throw new RuntimeException("User not found");
        }
        Users user = usersOptional.get();
        Booking target = null;
        for(Booking b : user.getBookings()){
            if(reservationId.equals(b.getId())){
                target = b;
                break;
            }
        }
        if(target == null){
            throw new RuntimeException("Booking not found");
        }
        if("Cancelled".equals(target.getStatus())){
            throw new RuntimeException("Booking is already cancelled");
        }

        int refundPercentage = calculateRefundPercentage(target.getBookedAt());
        double refundAmount = target.getTotalPrice() * refundPercentage / 100.0;

        target.setStatus("Cancelled");
        target.setCancellationReason(reason);
        target.setRefundPercentage(refundPercentage);
        target.setRefundAmount(refundAmount);
        target.setRefundStatus("Pending");
        target.setCancelledAt(LocalDateTime.now().toString());

        // Restore inventory
        final int restoredQuantity = target.getQuantity();
        final List<String> seatsToRelease = target.getSeats();
        if("Flight".equals(target.getType())){
            flightRepository.findById(target.getBookingId()).ifPresent(flight -> {
                flight.setAvailableSeats(flight.getAvailableSeats() + restoredQuantity);
                if(seatsToRelease != null && !seatsToRelease.isEmpty()){
                    flight.getBookedSeats().removeAll(seatsToRelease);
                }
                flightRepository.save(flight);
            });
        } else if("Hotel".equals(target.getType())){
            hotelRepository.findById(target.getBookingId()).ifPresent(hotel -> {
                hotel.setAvailableRooms(hotel.getAvailableRooms() + restoredQuantity);
                hotelRepository.save(hotel);
            });
        }

        userRepository.save(user);
        return target;
    }

    // Simulates a real refund pipeline: Pending -> Processing -> Completed over time.
    @Scheduled(fixedRate = 15000)
    public void progressRefunds(){
        List<Users> users = userRepository.findAll();
        for(Users user : users){
            boolean changed = false;
            for(Booking b : user.getBookings()){
                if("Cancelled".equals(b.getStatus()) && b.getCancelledAt() != null){
                    try {
                        LocalDateTime cancelledAt = LocalDateTime.parse(b.getCancelledAt());
                        long secondsSince = Duration.between(cancelledAt, LocalDateTime.now()).getSeconds();
                        if("Pending".equals(b.getRefundStatus()) && secondsSince >= 20){
                            b.setRefundStatus("Processing");
                            changed = true;
                        } else if("Processing".equals(b.getRefundStatus()) && secondsSince >= 60){
                            b.setRefundStatus("Completed");
                            changed = true;
                        }
                    } catch (Exception ignored) {}
                }
            }
            if(changed){
                userRepository.save(user);
            }
        }
    }

}