/**
 * Types & Helper Functions for Gradify Academic Management
 */

export interface Semester {
  id: string;
  name: string;
  isCurrent: boolean;
  year: number;
}

export type GradeType = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | 'IP';

export interface Subject {
  id: string;
  semesterId: string;
  name: string;
  code: string;
  credits: number;
  grade: GradeType;
  targetGrade: GradeType;
  professorName?: string;
  professorEmail?: string;
  color: string; // Tailwind class background/border color preset
  room?: string;
  schedule?: string;
}

export type AssignmentStatus = 'Pending' | 'Submitted' | 'Graded';

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  score?: number; // actual score
  maxScore: number; // possible score
  weight: number; // percentage of total grade, e.g., 15 for 15%
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  dateTime: string;
  room?: string;
  weight: number; // percentage of course grade
  score?: number;
  maxScore: number;
  notes?: string;
  status: 'Upcoming' | 'Completed';
}

export interface UserProfile {
  name: string;
  major: string;
  university: string;
  targetGpa: number;
  gpaScale: 4.0 | 5.0;
  avatarUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

// Convert Letter Grade to GPA points (4.0 scale)
export function gradeToPoints(grade: any): number {
  if (!grade) return 0.0;
  switch (grade) {
    case 'A+': return 4.0;
    case 'A': return 4.0;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'C-': return 1.7;
    case 'D+': return 1.3;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return 0.0;
  }
}

// Convert Points to 5.0 scale if requested
export function scalePoints(points: number, scale: any): number {
  const pts = typeof points === 'number' && !isNaN(points) ? points : 0;
  const scl = scale === 5.0 ? 5.0 : 4.0;
  if (scl === 5.0) {
    return (pts / 4.0) * 5.0;
  }
  return pts;
}

// Safe date and time locale-string formatters to guarantee no RangeError crashes
export function formatDateSafe(
  dateValue: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
  locale = 'en-US'
): string {
  if (!dateValue) return 'N/A';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return d.toLocaleDateString(locale, options);
  } catch {
    return 'N/A';
  }
}

export function formatDateTimeSafe(
  dateValue: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  locale = 'en-US'
): string {
  if (!dateValue) return 'N/A';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return d.toLocaleString(locale, options);
  } catch {
    return 'N/A';
  }
}

export function formatLocaleStringSafe(
  dateValue: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeStyle: 'short' },
  locale = 'en-US'
): string {
  if (!dateValue) return 'N/A';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return 'N/A';
  try {
    return d.toLocaleString(locale, options);
  } catch {
    return 'N/A';
  }
}

// List of available letter grades
export const AVAILABLE_GRADES: GradeType[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'IP'];

// Initial profile data
export const INITIAL_PROFILE: UserProfile = {
  name: 'John Doe',
  major: 'B.S. in Computer Science',
  university: 'Stanford University',
  targetGpa: 3.8,
  gpaScale: 4.0,
};

// Colors catalog for subjects
export const SUBJECT_COLORS = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', hex: '#3b82f6' },
  { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10b981' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#6366f1' },
  { name: 'Rose', value: 'rose', bg: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', hex: '#f43f5e' },
  { name: 'Amber', value: 'amber', bg: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', hex: '#f59e0b' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', hex: '#a855f7' },
  { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', hex: '#06b6d4' },
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', name: 'Fall 2025', isCurrent: false, year: 2025 },
  { id: 'sem-2', name: 'Spring 2026', isCurrent: false, year: 2026 },
  { id: 'sem-3', name: 'Summer 2026', isCurrent: true, year: 2026 },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // Fall 2025
  { id: 'sub-1', semesterId: 'sem-1', name: 'Introduction to Computer Science', code: 'CS101', credits: 4, grade: 'A', targetGrade: 'A', professorName: 'Dr. Alan Turing', professorEmail: 'turing@stanford.edu', color: 'blue', schedule: 'Mon/Wed 10:00 AM', room: 'Gates Hall Room 104' },
  { id: 'sub-2', semesterId: 'sem-1', name: 'Calculus I', code: 'MATH121', credits: 4, grade: 'A-', targetGrade: 'A', professorName: 'Prof. Isaac Newton', professorEmail: 'newton@stanford.edu', color: 'emerald', schedule: 'Tue/Thu 1:30 PM', room: 'Sloan Hall 302' },
  { id: 'sub-3', semesterId: 'sem-1', name: 'Physics I', code: 'PHYS101', credits: 3, grade: 'B+', targetGrade: 'A-', professorName: 'Dr. Marie Curie', professorEmail: 'curie@stanford.edu', color: 'indigo', schedule: 'Mon/Wed 3:00 PM', room: 'Physics Lab 1' },
  { id: 'sub-4', semesterId: 'sem-1', name: 'Technical Writing', code: 'ENG110', credits: 3, grade: 'A', targetGrade: 'A', professorName: 'Prof. George Orwell', professorEmail: 'orwell@stanford.edu', color: 'pink', schedule: 'Fri 9:00 AM', room: 'Meyer Library 205' },

  // Spring 2026
  { id: 'sub-5', semesterId: 'sem-2', name: 'Data Structures and Algorithms', code: 'CS102', credits: 4, grade: 'A', targetGrade: 'A', professorName: 'Dr. Donald Knuth', professorEmail: 'knuth@stanford.edu', color: 'blue', schedule: 'Mon/Wed 11:30 AM', room: 'Gates Hall Aud' },
  { id: 'sub-6', semesterId: 'sem-2', name: 'Calculus II', code: 'MATH122', credits: 4, grade: 'B', targetGrade: 'B+', professorName: 'Prof. Gottfried Leibniz', professorEmail: 'leibniz@stanford.edu', color: 'emerald', schedule: 'Tue/Thu 3:00 PM', room: 'Sloan Hall 310' },
  { id: 'sub-7', semesterId: 'sem-2', name: 'Physics II', code: 'PHYS102', credits: 3, grade: 'A-', targetGrade: 'A-', professorName: 'Dr. Nikola Tesla', professorEmail: 'tesla@stanford.edu', color: 'indigo', schedule: 'Tue/Thu 9:00 AM', room: 'Physics Lab 2' },
  { id: 'sub-8', semesterId: 'sem-2', name: 'Discrete Mathematics', code: 'CS210', credits: 3, grade: 'A', targetGrade: 'A', professorName: 'Prof. Ada Lovelace', professorEmail: 'lovelace@stanford.edu', color: 'amber', schedule: 'Wed/Fri 1:30 PM', room: 'Gates Hall Room 120' },

  // Summer 2026 (Current)
  { id: 'sub-9', semesterId: 'sem-3', name: 'Computer Systems & Architecture', code: 'CS240', credits: 4, grade: 'IP', targetGrade: 'A', professorName: 'Dr. Grace Hopper', professorEmail: 'hopper@stanford.edu', color: 'blue', schedule: 'Mon/Wed 10:00 AM', room: 'Gates Hall Room 202' },
  { id: 'sub-10', semesterId: 'sem-3', name: 'Introduction to Probability & Statistics', code: 'STAT200', credits: 3, grade: 'IP', targetGrade: 'A-', professorName: 'Prof. Karl Pearson', professorEmail: 'pearson@stanford.edu', color: 'emerald', schedule: 'Tue/Thu 11:30 AM', room: 'Sequoria Hall 101' },
  { id: 'sub-11', semesterId: 'sem-3', name: 'Web Applications Development', code: 'CS250', credits: 3, grade: 'IP', targetGrade: 'A', professorName: 'Dr. Tim Berners-Lee', professorEmail: 'tbl@stanford.edu', color: 'cyan', schedule: 'Mon/Wed 4:00 PM', room: 'Gates Hall Lab C' },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  // CS240 Labs
  { id: 'a-1', subjectId: 'sub-9', title: 'Lab 1: C Programming & Pointers', dueDate: '2026-06-15', status: 'Graded', score: 95, maxScore: 100, weight: 5, description: 'Learn basic memory references, dynamic allocations, and pointer arithmetic in C.', priority: 'Medium' },
  { id: 'a-2', subjectId: 'sub-9', title: 'Lab 2: Binary Bomb Assembly', dueDate: '2026-06-30', status: 'Submitted', maxScore: 100, weight: 10, description: 'Decompile and reverse-engineer a compiled binary target using gdb to defuse standard stages.', priority: 'High' },
  { id: 'a-3', subjectId: 'sub-9', title: 'Lab 3: Buffer Overflow Attack', dueDate: '2026-07-15', status: 'Pending', maxScore: 100, weight: 10, description: 'Demonstrate memory exploits using code injections on non-protected executable stacks.', priority: 'High' },

  // STAT200 Homework
  { id: 'a-4', subjectId: 'sub-10', title: 'Homework 1: Descriptive Stats & Bayes', dueDate: '2026-06-12', status: 'Graded', score: 48, maxScore: 50, weight: 4, description: 'Exercises from textbook Section 1 and 2 on conditional probabilities and counting.', priority: 'Low' },
  { id: 'a-5', subjectId: 'sub-10', title: 'Homework 2: Discrete Distributions', dueDate: '2026-06-25', status: 'Pending', maxScore: 50, weight: 4, description: 'Binomial, Poisson, and Hypergeometric random variables calculations.', priority: 'Medium' },
  { id: 'a-6', subjectId: 'sub-10', title: 'Homework 3: Continuous Variables', dueDate: '2026-07-08', status: 'Pending', maxScore: 50, weight: 4, description: 'Normal distribution, Z-scores, and exponential density distributions calculations.', priority: 'Medium' },

  // CS250 Assignments
  { id: 'a-7', subjectId: 'sub-11', title: 'Project 1: Semantic HTML & Tailwind Portfolio', dueDate: '2026-06-10', status: 'Graded', score: 100, maxScore: 100, weight: 10, description: 'Build a fully responsive academic portfolio using modern styling guidelines and accessibility setups.', priority: 'Medium' },
  { id: 'a-8', subjectId: 'sub-11', title: 'Project 2: React Interactive Finance Dashboard', dueDate: '2026-07-02', status: 'Pending', maxScore: 100, weight: 15, description: 'Develop a highly robust client-side state tracker using dynamic charts and standard localStorage.', priority: 'High' },
];

export const INITIAL_EXAMS: Exam[] = [
  { id: 'e-1', subjectId: 'sub-9', title: 'Midterm Exam (CS240)', dateTime: '2026-07-05T10:00:00', room: 'Hewlett Aud', weight: 30, maxScore: 100, status: 'Upcoming', notes: 'Chapters 1-4. Focus on ISA, assembly translation, registers, and memory caching.' },
  { id: 'e-2', subjectId: 'sub-10', title: 'Midterm (STAT200)', dateTime: '2026-07-07T11:30:00', room: 'Sequoia Hall 101', weight: 25, maxScore: 100, status: 'Upcoming', notes: 'Probability theory, combination equations, Bayes law, Chebyshev inequality.' },
  { id: 'e-3', subjectId: 'sub-11', title: 'Web App Pitch & API Audit', dateTime: '2026-06-20T16:00:00', room: 'Gates 104', weight: 15, maxScore: 50, score: 48, status: 'Completed', notes: 'Present architecture plans and pass initial lint checklist.' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'Exam Coming Up', message: 'CS240 Midterm is in 12 days. Check study modules and checklist.', type: 'info', date: '2026-06-23T10:00:00', read: false },
  { id: 'n-2', title: 'Assignment Due In 2 Days', message: 'Homework 2: Discrete Distributions is due soon for STAT200.', type: 'warning', date: '2026-06-23T08:00:00', read: false },
  { id: 'n-3', title: 'Grade Published', message: 'Project 1: Semantic HTML & Tailwind Portfolio has been graded: 100/100.', type: 'success', date: '2026-06-11T15:30:00', read: true },
];
