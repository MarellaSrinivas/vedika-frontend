
import api from "./api";

export const getAdminPayments = async () => {
    const response = await api.get("/admin/payments");
    return response.data;
};

export const getAdminPaymentById = async (id) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
};
