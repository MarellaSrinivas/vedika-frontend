
import api from "./api";

export const getAmenities = async () => {
    const response = await api.get("/amenities");
    return response.data?.data || response.data || [];
};
