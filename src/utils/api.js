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

export default instance;
