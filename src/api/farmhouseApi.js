
import api from "./api";

export const getFarmhouses = async () => {
  const response = await api.get("/farmhouses");

  // Support APIs returning either an array or a wrapped response.
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

export const getFarmhouseById = async (id) => {
  const response = await api.get(`/farmhouses/${id}`);
  return response.data;
};

export const getFarmhouseImages = async (id) => {
  const response = await api.get(`/farmhouses/${id}/images`);
  return response.data;
};

export const getFeaturedFarmhouses = async () => {
const response = await api.get("/farmhouses");
return response.data;
};
 

export const getFarmhouseAmenities = async (farmhouseId) => {
  const response = await api.get(
    `/farmhouses/${farmhouseId}/amenities`
  );

  return response.data;
};