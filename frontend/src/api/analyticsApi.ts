import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_ACADEMIC_API,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const dashboardStats = () =>
    api.get("/analytics/dashboard");

export const assignmentAnalytics = () =>
    api.get("/analytics/assignments");

export const subjectPerformance = () =>
    api.get("/analytics/subjects");
