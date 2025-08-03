import { CustomError } from "@/types/custom-error.type";
import axios from "axios";

// Make sure we're using the correct URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://project-management-system-n6ce.onrender.com/api";

const options = {
  baseURL,
  withCredentials: true, // ✅ This is correct
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const API = axios.create(options);

API.interceptors.request.use(
  (config) => {
    console.log('Making request to:', (config.baseURL || '') + (config.url || ''));
    console.log('With credentials:', config.withCredentials);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { data, status } = error.response || {};

    if (data === "Unauthorized" && status === 401) {
      window.location.href = "/";
    }

    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };

    return Promise.reject(customError);
  }
);

export default API;