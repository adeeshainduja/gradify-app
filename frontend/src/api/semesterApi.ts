import axios from "axios";
import { Semester } from "../types";

// Dedicated axios instance for the academic microservice
const academicApi = axios.create({
    baseURL: import.meta.env.VITE_ACADEMIC_API,
    headers: { "Content-Type": "application/json" }
});

academicApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Raw shape returned by the backend ──────────────────────────────────────────
export interface ApiSemester {
    id: number;
    name: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
    userId: number;
    createdAt: string;
    updatedAt: string;
}

// ── Map backend → frontend Semester type ───────────────────────────────────────
export function toFrontendSemester(s: ApiSemester): Semester {
    return {
        id:        String(s.id),
        name:      s.name,
        year:      parseInt(s.academicYear, 10) || new Date(s.startDate).getFullYear(),
        isCurrent: s.status === "ACTIVE",
        // Carry extra fields for round-tripping
        _apiId:     s.id,
        _startDate: s.startDate,
        _endDate:   s.endDate,
        _status:    s.status,
    } as Semester & Record<string, unknown>;
}

// ── API DTOs ───────────────────────────────────────────────────────────────────
export interface CreateSemesterDto {
    name:         string;
    academicYear: string;
    startDate:    string;
    endDate:      string;
    status:       "ACTIVE" | "COMPLETED" | "ARCHIVED";
}
export type UpdateSemesterDto = Partial<CreateSemesterDto>;

// ── API functions ──────────────────────────────────────────────────────────────
export const apiGetSemesters    = ()                                => academicApi.get<ApiSemester[]>("/semesters");
export const apiGetSemesterById = (id: number)                     => academicApi.get<ApiSemester>(`/semesters/${id}`);
export const apiCreateSemester  = (data: CreateSemesterDto)        => academicApi.post<ApiSemester>("/semesters", data);
export const apiUpdateSemester  = (id: number, data: UpdateSemesterDto) => academicApi.put<ApiSemester>(`/semesters/${id}`, data);
export const apiDeleteSemester  = (id: number)                     => academicApi.delete<{ message: string }>(`/semesters/${id}`);

export default academicApi;
