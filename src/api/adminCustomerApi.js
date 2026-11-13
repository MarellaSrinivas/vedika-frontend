
import api from "./api";

export const getAdminCustomers = async () => {
    const response = await api.get("/admin/customers");
    return response.data;
};

export const getAdminCustomerById = async (id) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
};

export const activateAdminCustomer = async (id) => {
    const response = await api.put(`/admin/customers/${id}/activate`);
    return response.data;
};

export const deactivateAdminCustomer = async (id) => {
    const response = await api.put(`/admin/customers/${id}/deactivate`);
    return response.data;
};