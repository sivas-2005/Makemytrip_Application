package com.siva.siva.services;

import com.siva.siva.models.*;
import com.siva.siva.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RecommendationFeedbackRepository feedbackRepository;

    public static class Recommendation {
        private String targetType;
        private String targetId;
        private String name;
        private String subtitle;
        private double price;
        private Double rating;
        private String reason;

        public String getTargetType() { return targetType; }
        public void setTargetType(String targetType) { this.targetType = targetType; }

        public String getTargetId() { return targetId; }
        public void setTargetId(String targetId) { this.targetId = targetId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getSubtitle() { return subtitle; }
        public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public void recordFeedback(String userId, String targetType, String targetId, String feedback) {
        RecommendationFeedback fb = new RecommendationFeedback();
        fb.setUserId(userId);
        fb.setTargetType(targetType);
        fb.setTargetId(targetId);
        fb.setFeedback(feedback);
        fb.setCreatedAt(LocalDateTime.now().toString());
        feedbackRepository.save(fb);
    }

    public List<Recommendation> getRecommendations(String userId) {
        Users user = userRepository.findById(userId).orElse(null);
        List<Flight> allFlights = flightRepository.findAll();
        List<Hotel> allHotels = hotelRepository.findAll();

        Set<String> bookedFlightIds = new HashSet<>();
        Set<String> bookedHotelIds = new HashSet<>();
        Map<String, Integer> cityFrequency = new HashMap<>();

        if (user != null && user.getBookings() != null) {
            for (Users.Booking booking : user.getBookings()) {
                if ("Cancelled".equals(booking.getStatus())) continue;
                if ("Flight".equals(booking.getType())) {
                    bookedFlightIds.add(booking.getBookingId());
                    allFlights.stream()
                            .filter(f -> f.getId().equals(booking.getBookingId()))
                            .findFirst()
                            .ifPresent(f -> cityFrequency.merge(f.getTo(), 1, Integer::sum));
                } else if ("Hotel".equals(booking.getType())) {
                    bookedHotelIds.add(booking.getBookingId());
                    allHotels.stream()
                            .filter(h -> h.getId().equals(booking.getBookingId()))
                            .findFirst()
                            .ifPresent(h -> cityFrequency.merge(h.getLocation(), 1, Integer::sum));
                }
            }
        }

        Set<String> dismissed = feedbackRepository.findByUserId(userId).stream()
                .filter(fb -> "irrelevant".equals(fb.getFeedback()))
                .map(RecommendationFeedback::getTargetId)
                .collect(Collectors.toSet());

        // Average rating per target from reviews.
        Map<String, Double> avgRatingByTarget = reviewRepository.findAll().stream()
                .collect(Collectors.groupingBy(Review::getTargetId,
                        Collectors.averagingInt(Review::getRating)));

        List<Recommendation> results = new ArrayList<>();

        String favoriteCity = cityFrequency.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        // 1) Same-city picks based on travel history.
        if (favoriteCity != null) {
            for (Flight f : allFlights) {
                if (results.size() >= 3) break;
                if (bookedFlightIds.contains(f.getId()) || dismissed.contains(f.getId())) continue;
                if (favoriteCity.equalsIgnoreCase(f.getTo())) {
                    results.add(buildRecommendation(
                            "Flight", f.getId(), f.getFlightName(), f.getFrom() + " → " + f.getTo(),
                            f.getPrice(), avgRatingByTarget.get(f.getId()),
                            "You've booked flights to " + f.getTo() + " before"));
                }
            }
            for (Hotel h : allHotels) {
                if (results.size() >= 5) break;
                if (bookedHotelIds.contains(h.getId()) || dismissed.contains(h.getId())) continue;
                if (favoriteCity.equalsIgnoreCase(h.getLocation())) {
                    results.add(buildRecommendation(
                            "Hotel", h.getId(), h.gethotelName(), h.getLocation(),
                            h.getPricePerNight(), avgRatingByTarget.get(h.getId()),
                            "Popular in " + h.getLocation() + ", a place you've visited"));
                }
            }
        }

        // 2) Highly rated picks not yet booked.
        List<Map.Entry<String, Double>> topRated = avgRatingByTarget.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toList());

        for (Map.Entry<String, Double> entry : topRated) {
            if (results.size() >= 6) break;
            String targetId = entry.getKey();
            double rating = entry.getValue();
            if (dismissed.contains(targetId)) continue;
            if (results.stream().anyMatch(r -> r.getTargetId().equals(targetId))) continue;

            Optional<Flight> flightMatch = allFlights.stream().filter(f -> f.getId().equals(targetId)).findFirst();
            if (flightMatch.isPresent() && !bookedFlightIds.contains(targetId)) {
                Flight f = flightMatch.get();
                results.add(buildRecommendation(
                        "Flight", f.getId(), f.getFlightName(), f.getFrom() + " → " + f.getTo(),
                        f.getPrice(), rating,
                        String.format("Highly rated by other travellers (%.1f★)", rating)));
                continue;
            }
            Optional<Hotel> hotelMatch = allHotels.stream().filter(h -> h.getId().equals(targetId)).findFirst();
            if (hotelMatch.isPresent() && !bookedHotelIds.contains(targetId)) {
                Hotel h = hotelMatch.get();
                results.add(buildRecommendation(
                        "Hotel", h.getId(), h.gethotelName(), h.getLocation(),
                        h.getPricePerNight(), rating,
                        String.format("Highly rated by other travellers (%.1f★)", rating)));
            }
        }

        // 3) Fallback: trending picks so the section is never empty.
        if (results.isEmpty()) {
            for (Flight f : allFlights) {
                if (results.size() >= 3) break;
                if (bookedFlightIds.contains(f.getId()) || dismissed.contains(f.getId())) continue;
                results.add(buildRecommendation(
                        "Flight", f.getId(), f.getFlightName(), f.getFrom() + " → " + f.getTo(),
                        f.getPrice(), avgRatingByTarget.get(f.getId()),
                        "Trending pick to get you started"));
            }
            for (Hotel h : allHotels) {
                if (results.size() >= 6) break;
                if (bookedHotelIds.contains(h.getId()) || dismissed.contains(h.getId())) continue;
                results.add(buildRecommendation(
                        "Hotel", h.getId(), h.gethotelName(), h.getLocation(),
                        h.getPricePerNight(), avgRatingByTarget.get(h.getId()),
                        "Popular with travellers right now"));
            }
        }

        return results;
    }

    private Recommendation buildRecommendation(String type, String id, String name, String subtitle,
                                                 double price, Double rating, String reason) {
        Recommendation r = new Recommendation();
        r.setTargetType(type);
        r.setTargetId(id);
        r.setName(name);
        r.setSubtitle(subtitle);
        r.setPrice(price);
        r.setRating(rating);
        r.setReason(reason);
        return r;
    }
}
