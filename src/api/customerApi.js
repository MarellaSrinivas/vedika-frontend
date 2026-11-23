
import api from "./api";

// Get logged-in customer's profile
export const getMyProfile = async () => {
  const response = await api.get("/customers/me");
  return response.data;
};

// Update logged-in customer's profile
export const updateMyProfile = async (profileData) => {
  const response = await api.put("/customers/me", profileData);
  return response.data;
};

// Deactivate logged-in customer's account
export const deleteMyAccount = async () => {
  const response = await api.delete("/customers/me");
  return response.data;
};
