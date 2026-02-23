import axios from "axios";
import { server } from "../server";

// Global axios config
const instance = axios.create({
  baseURL: server,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ensure fresh responses: add cache-control headers and a cache-busting param for GET
instance.interceptors.request.use((config) => {
  // Add headers to disable caching
  config.headers = {
    ...(config.headers || {}),
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };

  // Add simple cache-busting query param for GET requests
  if (config.method && config.method.toLowerCase() === "get") {
    const ts = Date.now();
    if (!config.params) config.params = {};
    // Use a safe param name that is ignored by the server
    config.params._t = ts;
  }

  return config;
});

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prevent undefined errors
    if (!error.response) {
      return Promise.reject({ message: "Network error or server unreachable" });
    }
    // Handle 401, CORS, etc.
    if (error.response.status === 401) {
      // Optionally redirect to login or show toast
    }
    return Promise.reject(error.response.data || { message: "Unknown error" });
  }
);

// Helper safe request wrapper that prevents crashes and returns a consistent shape
const safeRequest = async (fn) => {
  try {
    const res = await fn();
    return { data: res?.data ?? null, error: null, status: res?.status };
  } catch (err) {
    // Normalize error
    const normalized = err?.response?.data || { message: err?.message || "Unknown error" };
    return { data: null, error: normalized, status: err?.response?.status };
  }
};

const api = {
  instance,
  get: (url, config) => safeRequest(() => instance.get(url, config)),
  post: (url, data, config) => safeRequest(() => instance.post(url, data, config)),
  put: (url, data, config) => safeRequest(() => instance.put(url, data, config)),
  delete: (url, config) => safeRequest(() => instance.delete(url, config)),
};

export default api;
