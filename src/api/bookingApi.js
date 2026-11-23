
import api from "./api";

// Create a booking for a specific farmhouse.
export const createBooking = async (farmhouseId, bookingData) => {
  const response = await api.post(
    `/bookings/farmhouses/${farmhouseId}`,
    bookingData
  );

  return response.data;
};

// Fetch bookings belonging to the logged-in customer.
export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

// Fetch one booking using its reference.
export const getBookingByReference = async (reference) => {
  const response = await api.get(
    `/bookings/${encodeURIComponent(reference)}`
  );

  return response.data;
};

// Razorpay order creation.
export const createRazorpayOrder = async (bookingId, paymentOption) => {
  const response = await api.post("/payments/razorpay/order", {
    bookingId,
    paymentOption,
  });

  return response.data;
};

// Razorpay payment verification.
export const verifyRazorpayPayment = async (paymentData) => {
  const response = await api.post(
    "/payments/razorpay/verify",
    paymentData
  );

  return response.data;
};
