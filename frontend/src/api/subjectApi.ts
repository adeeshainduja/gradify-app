import axios from "axios";
import { Subject, GradeType } from "../types";

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
export interface ApiSubject {
    id:             number;
    code:           string;
    name:           string;
    credits:        number;
    lecturer:       string | null;
    professorEmail: string | null;
    description:    string | null;
    currentGrade:   string | null;
    progress:       number;
    status:         "ACTIVE" | "COMPLETED" | "DROPPED";
    color:          string;
    room:           string | null;
    schedule:       string | null;
    targetGrade:    string;
    semesterId:     number;
    userId:         number;
    createdAt:      string;
    updatedAt:      string;
    semester?: {
        id:           number;
        name:         string;
        academicYear: string;
        startDate:    string;
        endDate:      string;
        status:       string;
    };
}

// ── Map backend → frontend Subject type ────────────────────────────────────────
export function toFrontendSubject(s: ApiSubject): Subject {
    return {
        id:             String(s.id),
        semesterId:     String(s.semesterId),
        name:           s.name,
        code:           s.code,
        credits:        s.credits,
        grade:          (s.currentGrade || "IP") as GradeType,
        targetGrade:    (s.targetGrade || "A") as GradeType,
        professorName:  s.lecturer || undefined,
        professorEmail: s.professorEmail || undefined,
        color:          s.color || "blue",
        room:           s.room || undefined,
        schedule:       s.schedule || undefined,
        // Keep actual DB model ID for mutation ease
        _apiId:         s.id,
        _apiSemesterId: s.semesterId,
    } as Subject & Record<string, unknown>;
}

// ── API DTOs ───────────────────────────────────────────────────────────────────
export interface CreateSubjectDto {
    code:            string;
    name:            string;
    credits:         number;
    semesterId:      number;
    status:          "ACTIVE" | "COMPLETED" | "DROPPED";
    progress?:       number;
    color?:          string;
    room?:           string;
    schedule?:       string;
    targetGrade?:    string;
    professorEmail?: string;
    professorName?:  string;
    grade?:          string;
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>;

// ── API functions ──────────────────────────────────────────────────────────────
export const apiGetSubjects    = (semesterId?: number)              => 
    academicApi.get<ApiSubject[]>("/subjects", semesterId ? { params: { semesterId } } : undefined);
export const apiGetSubjectById = (id: number)                       => academicApi.get<ApiSubject>(`/subjects/${id}`);
export const apiCreateSubject  = (data: CreateSubjectDto)           => academicApi.post<ApiSubject>("/subjects", data);
export const apiUpdateSubject  = (id: number, data: UpdateSubjectDto) => academicApi.put<ApiSubject>(`/subjects/${id}`, data);
export const apiDeleteSubject  = (id: number)                       => academicApi.delete<{ message: string }>(`/subjects/${id}`);

export default academicApi;
