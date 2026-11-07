
import api from "./api";

export const sendOtp = async (phone, purpose) => {
  const response = await api.post("/auth/otp/send", {
    phone,
    purpose,
  });

  return response.data;
};

export const verifyOtp = async (details) => {
  const response = await api.post("/auth/otp/verify", details);

  return response.data;
};
