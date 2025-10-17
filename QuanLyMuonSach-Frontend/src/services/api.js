// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASEURL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // nếu BE dùng cookie cho refresh token
});

// thêm token vào header mỗi request
// nếu BE dùng Bearer token
api.interceptors.request.use(
  (config) => {
    try {
      //dùng để lấy user từ localStorage
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user && user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// basic response interceptor to catch 401, optionally attempt refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // if 401 we could try refresh flow here (call /auth/refresh) — depends on BE
    // For now just forward error
    return Promise.reject(err);
  }
);

export default api;
