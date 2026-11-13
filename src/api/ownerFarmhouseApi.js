import api from "./api";


export const getOwnerFarmhouseAddons = async (farmhouseId) => {
    const response = await api.get(
        `/owner/farmhouses/${farmhouseId}/addons`
    );
    return response.data;
};

export const createOwnerFarmhouseAddon = async (farmhouseId, data) => {
    const response = await api.post(
        `/owner/farmhouses/${farmhouseId}/addons`,
        data
    );
    return response.data;
};

export const updateOwnerFarmhouseAddon = async (
    farmhouseId,
    addonId,
    data
) => {
    const response = await api.put(
        `/owner/farmhouses/${farmhouseId}/addons/${addonId}`,
        data
    );
    return response.data;
};

export const deleteOwnerFarmhouseAddon = async (
    farmhouseId,
    addonId
) => {
    const response = await api.delete(
        `/owner/farmhouses/${farmhouseId}/addons/${addonId}`
    );
    return response.data;
};