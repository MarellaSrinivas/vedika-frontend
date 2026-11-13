
import api from "./api";

export const getAllOwners = async () => {
    const response = await api.get("/admin/owners");
    return response.data;
};

export const getPendingOwners = async () => {
    const response = await api.get("/admin/owners/pending");
    return response.data;
};

export const approveOwner = async (ownerId) => {
    const response = await api.put(`/admin/owners/${ownerId}/approve`);
    return response.data;
};

export const rejectOwner = async (ownerId) => {
    const response = await api.put(`/admin/owners/${ownerId}/reject`);
    return response.data;
};
