
import api from "./api";

export const getAdminFarmhouseAddons = async (farmhouseId) => {
    const response = await api.get(
        `/admin/farmhouses/${farmhouseId}/addons`
    );
    return response.data?.data || response.data || [];
};

export const createAdminFarmhouseAddon = async (farmhouseId, payload) => {
    const response = await api.post(
        `/admin/farmhouses/${farmhouseId}/addons`,
        payload
    );
    return response.data?.data || response.data;
};

export const updateAdminFarmhouseAddon = async (
    farmhouseId,
    addonId,
    payload
) => {
    const response = await api.put(
        `/admin/farmhouses/${farmhouseId}/addons/${addonId}`,
        payload
    );
    return response.data?.data || response.data;
};

export const deleteAdminFarmhouseAddon = async (farmhouseId, addonId) => {
    const response = await api.delete(
        `/admin/farmhouses/${farmhouseId}/addons/${addonId}`
    );
    return response.data;
};
