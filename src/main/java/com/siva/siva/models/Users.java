package com.siva.siva.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.ArrayList;
@Document(collection = "users")
public class Users {
    @Id
    private String _id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;
    private List<Booking> bookings = new ArrayList<>();;
    private String preferredSeatZone; // "Standard" or "Premium"
    private String preferredRoomType; // "Standard", "Deluxe", "Suite"

    public String getPreferredSeatZone() { return preferredSeatZone; }
    public void setPreferredSeatZone(String preferredSeatZone) { this.preferredSeatZone = preferredSeatZone; }

    public String getPreferredRoomType() { return preferredRoomType; }
    public void setPreferredRoomType(String preferredRoomType) { this.preferredRoomType = preferredRoomType; }


    public String getFirstName() {return firstName;}
    public String getId() {
        return _id;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public String getPhoneNumber() {
        return phoneNumber;
    }
    public String getPassword() {return password;}
    public String getEmail() {return email;}
    public String getRole() {return role;}
    public void setPassword(String password) {this.password = password;}
    public void setRole(String role) {this.role = role;}
    public List<Booking> getBookings(){return bookings;}
    public void setBookings(List<Booking> bookings){this.bookings=bookings;}


    public static class Booking{
        private String id;
        private String type;
        private String bookingId;
        private String date;
        private int quantity;
        private double totalPrice;
        private String status = "Confirmed";
        private String bookedAt;
        private String cancellationReason;
        private String cancelledAt;
        private int refundPercentage;
        private double refundAmount;
        private String refundStatus;
        private List<String> seats = new ArrayList<>();
        private String roomType;

        public List<String> getSeats() { return seats; }
        public void setSeats(List<String> seats) { this.seats = seats; }

        public String getRoomType() { return roomType; }
        public void setRoomType(String roomType) { this.roomType = roomType; }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getBookedAt() { return bookedAt; }
        public void setBookedAt(String bookedAt) { this.bookedAt = bookedAt; }

        public String getCancellationReason() { return cancellationReason; }
        public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

        public String getCancelledAt() { return cancelledAt; }
        public void setCancelledAt(String cancelledAt) { this.cancelledAt = cancelledAt; }

        public int getRefundPercentage() { return refundPercentage; }
        public void setRefundPercentage(int refundPercentage) { this.refundPercentage = refundPercentage; }

        public double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }

        public String getRefundStatus() { return refundStatus; }
        public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getBookingId() {
            return bookingId;
        }

        public void setBookingId(String bookingId) {
            this.bookingId = bookingId;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public double getTotalPrice() {
            return totalPrice;
        }

        public void setTotalPrice(double totalPrice) {
            this.totalPrice = totalPrice;
        }
    }
}