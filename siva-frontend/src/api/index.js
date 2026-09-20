import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

export const login = async (email, password) => {
  try {
    const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`;
    const res = await axios.post(url);
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  password
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/signup`, {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    const data = res.data;
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (userId, reservationId, reason) => {
  try {
    const url = `${BACKEND_URL}/booking/cancel?userId=${userId}&reservationId=${reservationId}&reason=${encodeURIComponent(
      reason
    )}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getuserbyemail = async (email) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/user/email?email=${email}`);
    const data = res.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const editprofile = async (
  id,
  firstName,
  lastName,
  email,
  phoneNumber
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/edit?id=${id}`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    const data = res.data;
    return data;
  } catch (error) {}
};
export const getflight = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(data);
  }
};

export const addflight = async (
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/flight`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const editflight = async (
  id,
  flightName,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  availableSeats
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/flight/${id}`, {
      flightName,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const gethotel = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/hotel`);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(data);
  }
};

export const addhotel = async (
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/hotel`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const edithotel = async (
  id,
  hotelName,
  location,
  pricePerNight,
  availableRooms,
  amenities
) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/hotel/${id}`, {
      hotelName,
      location,
      pricePerNight,
      availableRooms,
      amenities,
    });
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handleflightbooking = async (
  userId,
  flightId,
  seats,
  price,
  selectedSeats = []
) => {
  try {
    const seatsParam =
      selectedSeats && selectedSeats.length > 0
        ? `&selectedSeats=${selectedSeats.join(",")}`
        : "";
    const url = `${BACKEND_URL}/booking/flight?userId=${userId}&flightId=${flightId}&seats=${seats}&price=${price}${seatsParam}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const handlehotelbooking = async (
  userId,
  hotelId,
  rooms,
  price,
  roomType = "Standard"
) => {
  try {
    const url = `${BACKEND_URL}/booking/hotel?userId=${userId}&hotelId=${hotelId}&rooms=${rooms}&price=${price}&roomType=${roomType}`;
    const res = await axios.post(url);
    const data = res.data;
    return data;
  } catch (error) {
    console.log(error);
  }
};

// ---- Reviews & Ratings ----

export const addReview = async (review) => {
  try {
    const url = `${BACKEND_URL}/review/add`;
    const res = await axios.post(url, review);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getReviews = async (targetType, targetId, sort = "newest") => {
  try {
    const url = `${BACKEND_URL}/review/${targetType}/${targetId}?sort=${sort}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const replyToReview = async (reviewId, userId, userName, text) => {
  try {
    const url = `${BACKEND_URL}/review/${reviewId}/reply`;
    const res = await axios.post(url, { userId, userName, text });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const markReviewHelpful = async (reviewId, userId) => {
  try {
    const url = `${BACKEND_URL}/review/${reviewId}/helpful?userId=${userId}`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const flagReview = async (reviewId, reason) => {
  try {
    const url = `${BACKEND_URL}/review/${reviewId}/flag`;
    const res = await axios.post(url, { reason });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getFlaggedReviews = async () => {
  try {
    const url = `${BACKEND_URL}/admin/review/flagged`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const url = `${BACKEND_URL}/admin/review/${reviewId}`;
    const res = await axios.delete(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const dismissReviewFlag = async (reviewId) => {
  try {
    const url = `${BACKEND_URL}/admin/review/${reviewId}/dismiss`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// ---- Live Flight Status ----

export const getFlightStatus = async (flightId) => {
  try {
    const url = `${BACKEND_URL}/flight-status/${flightId}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getFlightStatusBatch = async (flightIds) => {
  try {
    const url = `${BACKEND_URL}/flight-status/batch?ids=${flightIds.join(",")}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// ---- Dynamic Pricing ----

export const getPricing = async (targetType, targetId, userId) => {
  try {
    const userParam = userId ? `?userId=${userId}` : "";
    const url = `${BACKEND_URL}/pricing/${targetType}/${targetId}${userParam}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const freezePrice = async (targetType, targetId, userId) => {
  try {
    const url = `${BACKEND_URL}/pricing/${targetType}/${targetId}/freeze?userId=${userId}`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// ---- Personalized Recommendations ----

export const getRecommendations = async (userId) => {
  try {
    const url = `${BACKEND_URL}/recommendations?userId=${userId}`;
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const sendRecommendationFeedback = async (userId, targetType, targetId, feedback) => {
  try {
    const url = `${BACKEND_URL}/recommendations/feedback`;
    const res = await axios.post(url, { userId, targetType, targetId, feedback });
    return res.data;
  } catch (error) {
    throw error;
  }
};
