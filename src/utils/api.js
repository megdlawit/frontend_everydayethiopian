import axios from "axios";

// Minimal axios instance for production on Render
const instance = axios.create({
  baseURL: "https://backend-everydayethiopian.onrender.com/api/v2",
  withCredentials: true,
  // No custom headers here to avoid CORS preflight issues
});

// Re-export convenience methods that return the raw axios promise
const get = (url, config) => instance.get(url, config);
const post = (url, data, config) => instance.post(url, data, config);
const put = (url, data, config) => instance.put(url, data, config);
const del = (url, config) => instance.delete(url, config);

export default instance;
export { get, post, put, del };
