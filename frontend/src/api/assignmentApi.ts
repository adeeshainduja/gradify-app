import axios from "axios";
import { Assignment, AssignmentStatus } from "../types";

// Dedicated axios instance pointing at the academic microservice
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
export interface ApiAssignment {
    id:          number;
    title:       string;
    description: string | null;
    dueDate:     string;
    priority:    "LOW" | "MEDIUM" | "HIGH";
    status:      "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE";
    progress:    number;
    marks:       number | null;
    maxMarks:    number;
    weight:      number;
    isGroup:     boolean;
    subjectId:   number;
    userId:      number;
    createdAt:   string;
    updatedAt:   string;
    subject?: {
        id:   number;
        code: string;
        name: string;
        color: string;
        semester?: {
            id:   number;
            name: string;
        };
    };
}

// ── Enum mappings: backend DB values ↔ frontend UI values ─────────────────────

/** Backend PENDING/SUBMITTED/GRADED/OVERDUE → frontend Pending/Submitted/Graded */
export function toFrontendStatus(s: ApiAssignment["status"]): AssignmentStatus {
    switch (s) {
        case "SUBMITTED": return "Submitted";
        case "GRADED":    return "Graded";
        case "OVERDUE":   return "Pending"; // Show overdue as pending in UI (badge logic handles display)
        default:          return "Pending";
    }
}

/** Frontend Pending/Submitted/Graded → backend PENDING/SUBMITTED/GRADED */
export function toBackendStatus(s: AssignmentStatus): ApiAssignment["status"] {
    switch (s) {
        case "Submitted": return "SUBMITTED";
        case "Graded":    return "GRADED";
        default:          return "PENDING";
    }
}

/** Frontend Low/Medium/High → backend LOW/MEDIUM/HIGH */
export function toBackendPriority(p: string): ApiAssignment["priority"] {
    switch (p?.toLowerCase()) {
        case "high":   return "HIGH";
        case "low":    return "LOW";
        default:       return "MEDIUM";
    }
}

/** Backend LOW/MEDIUM/HIGH → frontend Low/Medium/High */
export function toFrontendPriority(p: ApiAssignment["priority"]): "Low" | "Medium" | "High" {
    switch (p) {
        case "HIGH": return "High";
        case "LOW":  return "Low";
        default:     return "Medium";
    }
}

// ── Map backend → frontend Assignment type ────────────────────────────────────
export function toFrontendAssignment(a: ApiAssignment): Assignment {
    return {
        id:          String(a.id),
        subjectId:   String(a.subjectId),
        title:       a.title,
        dueDate:     a.dueDate.substring(0, 10), // ISO date string YYYY-MM-DD
        status:      toFrontendStatus(a.status),
        score:       a.marks    ?? undefined,
        maxScore:    a.maxMarks ?? 100,
        weight:      a.weight   ?? 0,
        description: a.description ?? undefined,
        priority:    toFrontendPriority(a.priority),
        // Extra fields for round-tripping
        _apiId:       a.id,
        _apiSubjectId: a.subjectId,
        _backendStatus: a.status,  // keep full backend status (OVERDUE) for display
    } as Assignment & Record<string, unknown>;
}

// ── DTO types ──────────────────────────────────────────────────────────────────
export interface CreateAssignmentDto {
    title:        string;
    subjectId:    number;
    dueDate:      string;
    priority:     ApiAssignment["priority"];
    status?:      ApiAssignment["status"];
    description?: string;
    progress?:    number;
    marks?:       number | null;
    maxMarks?:    number;
    weight?:      number;
    isGroup?:     boolean;
}

export type UpdateAssignmentDto = Partial<CreateAssignmentDto>;

// ── API functions ──────────────────────────────────────────────────────────────
export const apiGetAssignments    = (subjectId?: number, status?: string) =>
    academicApi.get<ApiAssignment[]>("/assignments", {
        params: { ...(subjectId ? { subjectId } : {}), ...(status ? { status } : {}) }
    });

export const apiGetAssignmentById = (id: number) =>
    academicApi.get<ApiAssignment>(`/assignments/${id}`);

export const apiCreateAssignment  = (data: CreateAssignmentDto) =>
    academicApi.post<ApiAssignment>("/assignments", data);

export const apiUpdateAssignment  = (id: number, data: UpdateAssignmentDto) =>
    academicApi.put<ApiAssignment>(`/assignments/${id}`, data);

export const apiDeleteAssignment  = (id: number) =>
    academicApi.delete<{ message: string }>(`/assignments/${id}`);

export default academicApi;
