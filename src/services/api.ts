import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
