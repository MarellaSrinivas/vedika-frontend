import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const createRazorpayOrder = async (bookingId, paymentOption) => {
  const response = await api.post("/payments/razorpay/order", {
    bookingId,
    paymentOption,
  });

  return response.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const response = await api.post(
    "/payments/razorpay/verify",
    paymentData
  );

  return response.data;
};

export const getBookingByReference = async (reference) => {
  const response = await api.get(
    `/bookings/reference/${encodeURIComponent(reference)}`
  );

  return response.data;
};