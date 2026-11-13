import api from "./api";

export const getOwnerDashboard = async () => {
    const response = await api.get("/owner/dashboard");
    return response.data;
};

export const getOwnerBookings = async () => {
    const response = await api.get("/owner/dashboard/bookings");
    return response.data;
};

export const getOwnerPayments = async () => {
    const response = await api.get("/owner/dashboard/payments");
    return response.data;
};

export const getMyFarmhouses = async () => {
    const response = await api.get("/owner/farmhouses");
    return response.data;
};

export const createOwnerFarmhouse = async (data) => {
    const response = await api.post("/owner/farmhouses", data);
    return response.data;
};

export const updateOwnerFarmhouse = async (id, data) => {
    const response = await api.put(`/owner/farmhouses/${id}`, data);
    return response.data;
};

export const activateOwnerFarmhouse = async (id) => {
    const response = await api.put(`/owner/farmhouses/${id}/activate`);
    return response.data;
};

export const deactivateOwnerFarmhouse = async (id) => {
    const response = await api.put(`/owner/farmhouses/${id}/deactivate`);
    return response.data;
};


export const getOwnerFarmhouseCalendar = async (farmhouseId) => {
    const response = await api.get(
        `/owner/farmhouses/${farmhouseId}/calendar`
    );
    return response.data;
};

export const setOwnerSpecialPrice = async (
    farmhouseId,
    priceDate,
    price
) => {
    const response = await api.put(
        `/owner/farmhouses/${farmhouseId}/calendar/price`,
        { priceDate, price }
    );
    return response.data;
};

export const removeOwnerSpecialPrice = async (
    farmhouseId,
    date
) => {
    const response = await api.delete(
        `/owner/farmhouses/${farmhouseId}/calendar/price`,
        { params: { date } }
    );
    return response.data;
};

export const setOwnerFarmhouseAvailability = async (
    farmhouseId,
    date,
    available
) => {
    const response = await api.put(
        `/owner/farmhouses/${farmhouseId}/calendar/availability`,
        { date, available }
    );
    return response.data;
};



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

 

export const getOwnerFarmhouseAmenities = async (farmhouseId) => {
    const response = await api.get(
        `/owner/farmhouses/${farmhouseId}/amenities`
    );
    return response.data;
};

export const updateOwnerFarmhouseAmenities = async (
    farmhouseId,
    amenityIds
) => {
    const response = await api.put(
        `/owner/farmhouses/${farmhouseId}/amenities`,
        { amenityIds }
    );
    return response.data;
};


export const updateOwnerFarmhouseImage = async (
    farmhouseId,
    imageId,
    data
) => {
    const response = await api.put(
        `/owner/farmhouses/${farmhouseId}/images/${imageId}`,
        data
    );
    return response.data;
};

export const deleteOwnerFarmhouseImage = async (
    farmhouseId,
    imageId
) => {
    const response = await api.delete(
        `/owner/farmhouses/${farmhouseId}/images/${imageId}`
    );
    return response.data;
};
 

export const uploadOwnerFarmhouseImage = async (
    farmhouseId,
    file,
    displayOrder = 0,
    coverImage = false
) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("displayOrder", String(displayOrder));
    formData.append("coverImage", String(coverImage));

    const response = await api.post(
        `/owner/farmhouses/${farmhouseId}/images/upload`,
        formData
    );

    return response.data;
};

 