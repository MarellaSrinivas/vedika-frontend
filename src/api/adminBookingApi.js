
import api from "./api";

export const getAdminBookings = async () => {
    const response = await api.get("/admin/bookings");
    return response.data;
};

export const getAdminBookingById = async (id) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
};

export const cancelAdminBooking = async (id) => {
    const response = await api.put(`/admin/bookings/${id}/cancel`);
    return response.data;
};

export const completeAdminBooking = async (id) => {
    const response = await api.put(`/admin/bookings/${id}/complete`);
    return response.data;
};
