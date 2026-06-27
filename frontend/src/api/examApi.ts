import axios from "axios";
import { Exam } from "../types";

// Dedicated axios instance for academic microservice
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
export interface ApiExam {
    id:            number;
    title:         string;
    examType:      "MID" | "FINAL" | "QUIZ" | "PRACTICAL" | "VIVA";
    examDate:      string;    // ISO datetime
    startTime:     string;    // "09:00"
    duration:      number;    // minutes
    venue:         string | null;
    totalMarks:    number;
    obtainedMarks: number | null;
    grade:         string | null;
    feedback:      string | null;
    notes:         string | null;
    weight:        number;
    status:        "UPCOMING" | "COMPLETED" | "CANCELLED";
    subjectId:     number;
    userId:        number;
    createdAt:     string;
    updatedAt:     string;
    subject?: {
        id:    number;
        code:  string;
        name:  string;
        color: string;
        semester?: { id: number; name: string };
    };
}

// ── Enum mappings ──────────────────────────────────────────────────────────────

/** Backend UPCOMING/COMPLETED/CANCELLED → frontend Upcoming/Completed */
export function toFrontendExamStatus(s: ApiExam["status"]): Exam["status"] {
    if (s === "COMPLETED") return "Completed";
    return "Upcoming"; // CANCELLED also shows as Upcoming (won't match Completed filter)
}

/** Frontend Upcoming/Completed → backend UPCOMING/COMPLETED */
export function toBackendExamStatus(s: Exam["status"]): ApiExam["status"] {
    return s === "Completed" ? "COMPLETED" : "UPCOMING";
}

// ── Map backend → frontend Exam type ──────────────────────────────────────────
export function toFrontendExam(e: ApiExam): Exam {
    // Reconstruct the frontend dateTime from examDate + startTime
    // e.g. examDate = "2026-09-12T00:00:00.000Z", startTime = "09:00"
    // → dateTime = "2026-09-12T09:00"
    const dateOnly = e.examDate.substring(0, 10); // YYYY-MM-DD
    const dateTime = `${dateOnly}T${e.startTime}`;

    return {
        id:        String(e.id),
        subjectId: String(e.subjectId),
        title:     e.title,
        dateTime,
        room:      e.venue    ?? undefined,
        weight:    e.weight   ?? 0,
        score:     e.obtainedMarks !== null ? e.obtainedMarks : undefined,
        maxScore:  e.totalMarks ?? 100,
        notes:     e.notes    ?? undefined,
        status:    toFrontendExamStatus(e.status),
        // Extra round-trip metadata
        _apiId:         e.id,
        _examType:      e.examType,
        _duration:      e.duration,
        _grade:         e.grade,
        _feedback:      e.feedback,
        _backendStatus: e.status,
    } as Exam & Record<string, unknown>;
}

// ── DTO types ──────────────────────────────────────────────────────────────────
export interface CreateExamDto {
    title:          string;
    subjectId:      number;
    examDate:       string;    // ISO date
    examType:       ApiExam["examType"];
    totalMarks:     number;
    startTime?:     string;
    duration?:      number;
    venue?:         string;
    weight?:        number;
    status?:        ApiExam["status"];
    obtainedMarks?: number | null;
    grade?:         string;
    feedback?:      string;
    notes?:         string;
}

export type UpdateExamDto = Partial<CreateExamDto>;

// ── API functions ──────────────────────────────────────────────────────────────
export const apiGetExams    = (subjectId?: number, status?: string) =>
    academicApi.get<ApiExam[]>("/exams", {
        params: { ...(subjectId ? { subjectId } : {}), ...(status ? { status } : {}) }
    });

export const apiGetExamById = (id: number) =>
    academicApi.get<ApiExam>(`/exams/${id}`);

export const apiCreateExam  = (data: CreateExamDto) =>
    academicApi.post<ApiExam>("/exams", data);

export const apiUpdateExam  = (id: number, data: UpdateExamDto) =>
    academicApi.put<ApiExam>(`/exams/${id}`, data);

export const apiDeleteExam  = (id: number) =>
    academicApi.delete<{ message: string }>(`/exams/${id}`);

export default academicApi;
