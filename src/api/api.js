
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_TOKEN_KEY = "thevedika_token";
const REFRESH_TOKEN_KEY = "thevedika_refresh_token";
const USER_KEY = "thevedika_user";

let refreshPromise = null;

const isPublicAuthRequest = (url = "") => {
  return (
    url.includes("/auth/otp/send") ||
    url.includes("/auth/otp/verify") ||
    url.includes("/auth/token/refresh")
  );
};

// Attach token and set Content-Type based on request data.
api.interceptors.request.use(
  (config) => {
    if (!isPublicAuthRequest(config.url)) {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      delete config.headers?.Authorization;
    }

    // IMPORTANT: Let Axios/browser set multipart boundary for FormData.
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers = config.headers || {};
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else if (config.data !== undefined && config.data !== null) {
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh access token.
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("Refresh token not found.");
  }

  const response = await refreshApi.post("/auth/token/refresh", {
    refreshToken,
  });

  const data = response.data?.data || response.data;

  const newAccessToken = data.accessToken || data.token;
  const newRefreshToken = data.refreshToken;

  if (!newAccessToken || !newRefreshToken) {
    throw new Error("Invalid refresh response from server.");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return newAccessToken;
};

// Clear authentication.
const clearAuthentication = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

// Retry failed requests after refreshing token.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshRequest = isPublicAuthRequest(originalRequest.url);

    if (
      (status !== 401 && status !== 403) ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthentication();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
