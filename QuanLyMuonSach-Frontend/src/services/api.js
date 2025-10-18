import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASEURL || "http://localhost:5000/api",
  withCredentials: true, // nếu BE dùng cookie cho refresh token
});

// =================== REQUEST INTERCEPTOR ===================
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.accessToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }

    // Nếu body là FormData, xóa Content-Type để browser tự set
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else {
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    // Debug: in ra URL và token
    console.log("[Request] URL:", config.url);
    console.log("[Request] Headers:", config.headers);

    return config;
  },
  (err) => Promise.reject(err)
);

// =================== RESPONSE INTERCEPTOR ===================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((error) => Promise.reject(error));
      }

      isRefreshing = true;
      try {
        const response = await axios.post(
          `${api.defaults.baseURL.replace(/\/api$/, "")}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.accessToken;
        if (!newAccessToken) throw new Error("No refresh token returned");

        // Lưu token mới
        const raw = localStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : {};
        user.accessToken = newAccessToken;
        localStorage.setItem("user", JSON.stringify(user));

        api.defaults.headers.common.Authorization = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = "Bearer " + newAccessToken;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("user");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
