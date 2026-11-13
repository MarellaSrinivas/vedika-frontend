import api from "./api";

export const getAdminFarmhouses = async () => {
    const response = await api.get("/admin/farmhouses");
    return response.data;
};

export const getAdminFarmhouseById = async (id) => {
    const response = await api.get(`/admin/farmhouses/${id}`);
    return response.data;
};

export const createAdminFarmhouse = async (data) => {
    const response = await api.post("/admin/farmhouses", data);
    return response.data;
};

export const updateAdminFarmhouse = async (id, data) => {
    const response = await api.put(`/admin/farmhouses/${id}`, data);
    return response.data;
};

export const activateAdminFarmhouse = async (id) => {
    const response = await api.put(`/admin/farmhouses/${id}/activate`);
    return response.data;
};

export const deactivateAdminFarmhouse = async (id) => {
    const response = await api.put(`/admin/farmhouses/${id}/deactivate`);
    return response.data;
};

export const assignFarmhouseOwner = async (id, ownerId) => {
    const response = await api.put(
        `/admin/farmhouses/${id}/assign-owner/${ownerId}`
    );
    return response.data;
};


// Admin calendar management

export const getAdminFarmhouseCalendar = async (farmhouseId) => {
    const response = await api.get(
        `/farmhouses/${farmhouseId}/calendar`
    );
    return response.data;
};

export const setAdminSpecialPrice = async (farmhouseId, priceDate, price) => {
    const response = await api.put(
        `/admin/farmhouses/${farmhouseId}/calendar/price`,
        { priceDate, price }
    );
    return response.data;
};

export const removeAdminSpecialPrice = async (farmhouseId, date) => {
    const response = await api.delete(
        `/admin/farmhouses/${farmhouseId}/calendar/price`,
        { params: { date } }
    );
    return response.data;
};

export const setAdminFarmhouseAvailability = async (
    farmhouseId,
    date,
    available
) => {
    const response = await api.put(
        `/admin/farmhouses/${farmhouseId}/calendar/availability`,
        { date, available }
    );
    return response.data;
};

 


export const uploadAdminFarmhouseImage = async (
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
    `/admin/farmhouses/${farmhouseId}/images`,
    formData
  );

  return response.data;
};




export const getAdminFarmhouseAmenities = async (farmhouseId) => {
    const response = await api.get(
        `/admin/farmhouses/${farmhouseId}/amenities`
    );

    return response.data?.data || response.data || [];
};

export const updateAdminFarmhouseAmenities = async (
    farmhouseId,
    amenityIds
) => {
    const response = await api.put(
        `/admin/farmhouses/${farmhouseId}/amenities`,
        { amenityIds }
    );

    return response.data?.data || response.data || [];
};



export const getAdminFarmhouseAddons = async (farmhouseId) => {
    const response = await api.get(
        `/admin/farmhouses/${farmhouseId}/addons`
    );
    return response.data;
};

export const createAdminFarmhouseAddon = async (farmhouseId, data) => {
    const response = await api.post(
        `/admin/farmhouses/${farmhouseId}/addons`,
        data
    );
    return response.data;
};

export const updateAdminFarmhouseAddon = async (
    farmhouseId,
    addonId,
    data
) => {
    const response = await api.put(
        `/admin/farmhouses/${farmhouseId}/addons/${addonId}`,
        data
    );
    return response.data;
};

export const deleteAdminFarmhouseAddon = async (
    farmhouseId,
    addonId
) => {
    const response = await api.delete(
        `/admin/farmhouses/${farmhouseId}/addons/${addonId}`
    );
    return response.data;
};