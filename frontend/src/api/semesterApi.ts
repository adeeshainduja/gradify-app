import axios from "axios";

// Dedicated axios instance for the academic microservice
const academicApi = axios.create({
    baseURL: import.meta.env.VITE_ACADEMIC_API,
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT token automatically on every request
academicApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type SemesterStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Semester {
    id:           number;
    name:         string;
    academicYear: string;
    startDate:    string;
    endDate:      string;
    status:       SemesterStatus;
    userId:       number;
    createdAt:    string;
    updatedAt:    string;
}

export interface CreateSemesterDto {
    name:         string;
    academicYear: string;
    startDate:    string;   // ISO 8601 e.g. "2026-01-01"
    endDate:      string;
    status:       SemesterStatus;
}

export type UpdateSemesterDto = Partial<CreateSemesterDto>;

// ─── API Functions ─────────────────────────────────────────────────────────────

/** Get all semesters for the logged-in user */
export const getSemesters = () =>
    academicApi.get<Semester[]>("/semesters");

/** Get a single semester by ID */
export const getSemesterById = (id: number) =>
    academicApi.get<Semester>(`/semesters/${id}`);

/** Create a new semester */
export const createSemester = (data: CreateSemesterDto) =>
    academicApi.post<Semester>("/semesters", data);

/** Update an existing semester (partial update) */
export const updateSemester = (id: number, data: UpdateSemesterDto) =>
    academicApi.put<Semester>(`/semesters/${id}`, data);

/** Delete a semester */
export const deleteSemester = (id: number) =>
    academicApi.delete<{ message: string }>(`/semesters/${id}`);

export default academicApi;
