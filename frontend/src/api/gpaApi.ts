import axios from "axios";

// Dedicated GPA Service axios instance
const gpaAxios = axios.create({
  baseURL: import.meta.env.VITE_GPA_API,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token to every request
gpaAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const currentGPA = () =>
  gpaAxios.get("/current");

export const gpaTrend = () =>
  gpaAxios.get("/trend");

export const calculateGPA = (data: any) =>
  gpaAxios.post("/calculate", data);

export const getHistory = () =>
  gpaAxios.get("/history");

export const predictGPA = (data: any) =>
  gpaAxios.post("/predict", data);
