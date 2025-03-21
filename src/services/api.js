import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8080/api",
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post("http://127.0.0.1:8080/api/auth/refresh/", { refresh: refreshToken });

        localStorage.setItem("token", response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
