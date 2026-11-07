
import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT only to requests that need authentication.
api.interceptors.request.use((config) => {
    const isOtpRequest =
        config.url?.includes("/auth/otp/send") ||
        config.url?.includes("/auth/otp/verify");

    if (!isOtpRequest) {
        const token = localStorage.getItem("thevedika_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

export default api;
