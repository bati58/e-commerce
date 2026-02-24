import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

let authToken = null;

instance.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

const setToken = (token) => {
  authToken = token;
};

export default {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  delete: instance.delete,
  setToken,
};

