import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle,
  GraduationCap,
  Percent,
  CalendarCheck,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Calculator,
  RotateCcw,
  Sliders,
  Award,
  BookOpen,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  Flame,
  FileSpreadsheet,
  Download,
  AlertCircle,
  TrendingDown,
  Activity,
  UserCheck
} from 'lucide-react';
import { Semester, AcademicGoal } from '../types';

interface AnalyticsViewProps {
  semesters: Semester[];
  goals: AcademicGoal[];
  onAddGoal: (title: string, current: number, target: number, subtitle: string) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalProgress: (id: string, current: number) => void;
  setActiveTab?: (tab: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  semesters,
  goals,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalProgress,
  setActiveTab
}) => {
  // Navigation & View Toggles
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [emptyStateActive, setEmptyStateActive] = useState<boolean>(false);
  const [showGoalForm, setShowGoalForm] = useState<boolean>(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Dynamic success notice tracking (toast popups)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // New goal form states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSubtitle, setNewGoalSubtitle] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState(65);
  const [newGoalTarget, setNewGoalTarget] = useState(100);

  // GPA Predictor Module states
  const [assignmentAvg, setAssignmentAvg] = useState<number>(88);
  const [quizAvg, setQuizAvg] = useState<number>(85);
  const [midExamAvg, setMidExamAvg] = useState<number>(90);
  const [expectedFinalScore, setExpectedFinalScore] = useState<number>(92);
  const [calculatorActive, setCalculatorActive] = useState<boolean>(false);

  // Hover indicator for trajectory points
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  // Static Academic Year Categories based on sample data
  const academicYears = ["all", "2021", "2022", "2023", "2024"];

  // Filter semesters on selections
  const filteredSemesters = semesters.filter(s => {
    const matchesYear = selectedAcademicYear === 'all' || s.academicYear === selectedAcademicYear;
    const matchesSem = selectedSemester === 'all' || s.id === selectedSemester;
    return matchesYear && matchesSem;
  });

  // Calculate base GPA metrics using the datasets
  const activeCompletedSemesters = semesters.filter(s => s.status === 'completed' && s.sgpa > 0);
  
  // Custom baseline calculations
  const totalCompletedSgpas = activeCompletedSemesters.reduce((sum, s) => sum + s.sgpa, 0);
  const baselineCgpa = activeCompletedSemesters.length > 0 
    ? parseFloat((totalCompletedSgpas / activeCompletedSemesters.length).toFixed(2))
    : 3.68;

  const currentTermGpa = semesters.find(s => s.id === 'sem-5')?.sgpa || 3.72;
  const creditsEarned = semesters.reduce((sum, s) => sum + (s.creditsEarned || 0), 0) || 78;
  const totalTargetCredits = 120;

  // Predict Class Predictor String matches
  const getDegreeClassification = (gpa: number) => {
    if (gpa >= 3.70) return "First Class Honours";
    if (gpa >= 3.30) return "Second Class (Upper Division)";
    if (gpa >= 3.00) return "Second Class (Lower Division)";
    return "Pass Division";
  };

  // GPA Predictor Simulation Math
  // Weighting structure: Assignments 20%, Quizzes 10%, Mid Exam 30%, Final Exam 40%
  const calculatePredictedResult = () => {
    const score = (assignmentAvg * 0.20) + (quizAvg * 0.10) + (midExamAvg * 0.30) + (expectedFinalScore * 0.40);
    
    let grade = "C";
    let gpa = 2.0;
    let confidence = 85;
    let outlook = "Satisfactory";
    let color = "text-amber-500 bg-amber-50";

    if (score >= 93) {
      grade = "A";
      gpa = 4.0;
      confidence = 94;
      outlook = "Outstanding";
      color = "text-emerald-700 bg-emerald-50";
    } else if (score >= 90) {
      grade = "A-";
      gpa = 3.68;
      confidence = 92;
      outlook = "Excellent";
      color = "text-blue-700 bg-blue-50";
    } else if (score >= 85) {
      grade = "B+";
      gpa = 3.33;
      confidence = 89;
      outlook = "Very Good";
      color = "text-indigo-700 bg-indigo-50";
    } else if (score >= 80) {
      grade = "B";
      gpa = 3.0;
      confidence = 86;
      outlook = "Good";
      color = "text-slate-700 bg-slate-50";
    } else if (score >= 70) {
      grade = "C";
      gpa = 2.0;
      confidence = 80;
      outlook = "Satisfactory";
      color = "text-amber-600 bg-amber-50";
    } else {
      grade = "F";
      gpa = 0.0;
      confidence = 75;
      outlook = "Needs Immediate Attention";
      color = "text-rose-600 bg-rose-50";
    }

    return { 
      score: Math.round(score), 
      grade, 
      gpa: gpa.toFixed(2), 
      confidence, 
      outlook,
      color,
      points: gpa
    };
  };

  const prediction = calculatePredictedResult();

  // Dynamic Grade Distribution stats from static array & generated simulation
  const gradeDistribution = [
    { grade: "A Grades", count: 8, percentage: 44, color: "bg-indigo-600", stroke: "#4f46e5" },
    { grade: "B Grades", count: 7, percentage: 39, color: "bg-blue-500", stroke: "#3b82f6" },
    { grade: "C Grades", count: 2, percentage: 11, color: "bg-purple-500", stroke: "#a855f7" },
    { grade: "D Grades", count: 1, percentage: 6, color: "bg-amber-400", stroke: "#fbbf24" },
    { grade: "F Grades", count: 0, percentage: 0, color: "bg-slate-350", stroke: "#cbd5e1" },
  ];

  // Subjects performance ratings
  const subjectPerformance = [
    { name: "Software Engineering", gpa: 3.7, grade: "B+", score: 88, rating: "Very Good", color: "bg-blue-500" },
    { name: "Database Systems", gpa: 4.0, grade: "A", score: 93, rating: "Outstanding", color: "bg-indigo-600" },
    { name: "Machine Learning", gpa: 3.7, grade: "A-", score: 91, rating: "Excellent", color: "bg-purple-600" },
    { name: "Computer Networks", gpa: 3.0, grade: "B", score: 84, rating: "Average", color: "bg-amber-500" },
    { name: "Web Engineering", gpa: 4.0, grade: "A", score: 95, rating: "Outstanding", color: "bg-pink-500" },
    { name: "Software Architecture", gpa: 3.7, grade: "A-", score: 90, rating: "Excellent", color: "bg-teal-500" },
  ];

  // Standard preset goals to display
  const standardGoals = [
    { title: "Achieve Cumulative GPA 3.80+", subtitle: "Overall grade cumulative benchmark milestone", progress: 92, target: 100, probability: "High (89%)", status: "In Progress", color: "indigo" },
    { title: "Maintain Dean's List Standing", subtitle: "Requires SGPA >= 3.65 every consecutive semester", progress: 100, target: 100, probability: "Verified", status: "Achieved", color: "emerald" },
    { title: "Complete Degree coursework with honor", subtitle: "Earn 120 credits for immediate graduation", progress: 65, target: 100, probability: "On Track (94%)", status: "In Progress", color: "indigo" },
  ];

  // Actions trigger: mock transcript generator details
  const transcriptTimeline = [
    { 
      sem: "Semester 1", gpa: "3.65", credits: "15", 
      courses: [
        { code: "CSE-101", name: "Introduction to Prototyping", grade: "A-", gpa: "3.7" },
        { code: "CSE-102", name: "Discrete Structures Math", grade: "A", gpa: "4.0" },
        { code: "MAT-110", name: "Calculus Matrix Functions", grade: "B+", gpa: "3.3" },
        { code: "LIT-115", name: "Technical Rhetoric & Writing", grade: "B-", gpa: "2.7" },
        { code: "PHY-105", name: "Solid State Computer Physics", grade: "A-", gpa: "3.7" }
      ] 
    },
    { 
      sem: "Semester 2", gpa: "3.88", credits: "15",
      courses: [
        { code: "CSE-201", name: "Object Oriented Frameworks", grade: "A", gpa: "4.0" },
        { code: "CSE-202", name: "Data Structures & Trees", grade: "A", gpa: "4.0" },
        { code: "MAT-220", name: "Linear Equation Algebra", grade: "B+", gpa: "3.3" },
        { code: "CSE-205", name: "Computer Architecture Systems", grade: "A", gpa: "4.0" },
        { code: "HUM-120", name: "Sociology of Innovation", grade: "A-", gpa: "3.7" }
      ]
    },
    { 
      sem: "Semester 3", gpa: "3.75", credits: "16",
      courses: [
        { code: "CSE-301", name: "Theory of Automata & Parser", grade: "B-", gpa: "2.7" },
        { code: "CSE-302", name: "Analysis of Sorting Algorithms", grade: "A", gpa: "4.0" },
        { code: "CSE-303", name: "Operating System Kernels", grade: "A-", gpa: "3.7" },
        { code: "MAT-340", name: "Statistical Inference & Probability", grade: "A", gpa: "4.0" },
        { code: "CSE-306", name: "Interactive Software Systems", grade: "A", gpa: "4.0" }
      ]
    },
    { 
      sem: "Semester 4", gpa: "3.90", credits: "14",
      courses: [
        { code: "CSE-401", name: "System Design Patterns", grade: "A", gpa: "4.0" },
        { code: "CSE-405", name: "Cybersecurity & Cryptology", grade: "A-", gpa: "3.7" },
        { code: "CSE-411", name: "Human Centered Systems", grade: "A", gpa: "4.0" },
        { code: "ENG-210", name: "Advanced Software Practicum", grade: "A", gpa: "4.0" }
      ]
    },
    { 
      sem: "Semester 5 (Current)", gpa: "3.72", credits: "18",
      courses: [
        { code: "CSE-305", name: "Database Systems", grade: "A", gpa: "4.0" },
        { code: "CSE-402", name: "Software Engineering", grade: "B+", gpa: "3.3" },
        { code: "CSE-310", name: "Computer Networks", grade: "B", gpa: "3.0" },
        { code: "CSE-420", name: "Machine Learning", grade: "A-", gpa: "3.7" },
        { code: "CSE-225", name: "Web Engineering", grade: "A", gpa: "4.0" },
        { code: "CSE-435", name: "Software Architecture", grade: "A-", gpa: "3.7" }
      ]
    }
  ];

  // Submits a new goal
  const handleAddNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    onAddGoal(
      newGoalTitle,
      newGoalCurrent,
      newGoalTarget,
      newGoalSubtitle || "Personalized achievement milestone track"
    );
    setNewGoalTitle('');
    setNewGoalSubtitle('');
    setNewGoalCurrent(65);
    setNewGoalTarget(100);
    setShowGoalForm(false);
  };

  // Export report alert action
  const triggerReportGeneration = () => {
    setShowReportModal(true);
  };

  return (
    <div id="gpa-analytics-container" className="space-y-6 text-slate-800 font-sans animate-fade-in pb-12">
      
      {/* 1. TOP TITLE HEADER AREA */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-50" /> Academic Dashboard
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">GPA Analytics</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Monitor academic performance, analyze GPA trends, track progress toward goals, and gain insights into your university journey.
          </p>
        </div>

        {/* Dynamic Filters & Diagnostic Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Empty State Toggle Option */}
          <button
            id="toggle-empty-state-check"
            onClick={() => setEmptyStateActive(!emptyStateActive)}
            className={`font-semibold text-xs py-2 px-3.5 rounded-xl border transition-all cursor-pointer ${
              emptyStateActive 
                ? 'bg-amber-50 text-amber-700 border-amber-250 font-bold' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
            }`}
            title="Toggle empty state to view alternative state visual"
          >
            {emptyStateActive ? "Show Live Analytics" : "Preview Empty State"}
          </button>

          <button
            id="trigger-transcript-preview"
            onClick={() => setShowTranscriptModal(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3.5 rounded-xl border border-slate-200 shadow-3xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-400" /> Digital Transcript
          </button>

          <button
            id="op-export-report-modal"
            onClick={triggerReportGeneration}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4.5 rounded-xl shadow-md shadow-indigo-100/50 flex items-center gap-1.5 transform active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {emptyStateActive ? (
        
        /* ================= EMPTY STATE CONTAINER ================= */
        <div id="gpa-empty-state" className="bg-white border border-slate-200 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-6 shadow-xs my-10">
          <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900">No GPA data available yet.</h4>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed text-balance">
              Add subjects, assign grades, and complete curriculum courses to start tracking your premium academic performance statistics!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setEmptyStateActive(false);
                setSelectedSemester('all');
                setSelectedAcademicYear('all');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4.5 rounded-lg shadow-xs cursor-pointer transition-all"
            >
              Populate Demo Data
            </button>
            <button
              onClick={() => setEmptyStateActive(false)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 text-xs py-2 px-4 rounded-lg transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>

      ) : (

        /* ================= POPULATED MAIN INTERACTIVE CONTENT ================= */
        <>
          
          {/* FILTERING CONTROLLER BAR */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Filter Workstation:
              </span>

              {/* Semester Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">SEMESTER:</span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Semesters</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.academicYear})</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-[9px] font-mono font-bold text-slate-400">ACADEMIC YEAR:</span>
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Years</option>
                  {academicYears.filter(y => y !== 'all').map(yr => (
                    <option key={yr} value={yr}>Year {yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick resets */}
            {(selectedSemester !== 'all' || selectedAcademicYear !== 'all') && (
              <button
                onClick={() => {
                  setSelectedSemester('all');
                  setSelectedAcademicYear('all');
                }}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 self-end md:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
            
            <div className="text-[10px] text-slate-400 font-mono text-right hidden lg:block">
              Dataset status: <strong>5 Terms Audited</strong>
            </div>
          </div>

          {/* 2. HERO PERFORMANCE SECTION (4 KPI Cards Grid) */}
          <div id="gpa-kpi-row" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
            
            {/* Card A: Current Semester GPA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-indigo-200/60 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 bg-indigo-50/40 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">CURRENT SEMESTER GPA</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span id="label-current-gpa" className="text-3xl font-black font-mono text-slate-900 tracking-tight">{currentTermGpa.toFixed(2)}</span>
                  <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold font-mono tracking-tight flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +0.12
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px]">
                  <span className="text-slate-400">Standing:</span>
                  <strong className="text-slate-700 block font-bold leading-none mt-0.5">First Class</strong>
                </div>
                <span className="text-[8px] bg-slate-100 text-slate-500 font-mono font-bold px-1.5 py-0.5 rounded uppercase">Verified Grade</span>
              </div>
            </div>

            {/* Card B: CGPA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-blue-200/60 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 bg-blue-50/40 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">CUMULATIVE CGPA</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span id="label-cgpa" className="text-3xl font-black font-mono text-slate-900 tracking-tight">{baselineCgpa.toFixed(2)}</span>
                  <span className="text-[10px] text-indigo-500 bg-indigo-50 font-bold px-2 py-0.5 rounded border border-indigo-100">
                    High Tier
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px]">
                  <span className="text-slate-400">Predictive Award:</span>
                  <strong className="text-indigo-650 block font-black leading-none mt-0.5">{getDegreeClassification(baselineCgpa)}</strong>
                </div>
                <Award className="w-4 h-4 text-indigo-500" />
              </div>
            </div>

            {/* Card C: Target GPA Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-purple-200/60 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 bg-purple-50/40 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">ACADEMIC GOAL METRIC</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span id="label-target-gpa" className="text-3xl font-black font-mono text-purple-950 tracking-tight">3.80</span>
                  <span className="text-[10px] text-slate-400 font-medium">target goal</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Goal achieved progress:</span>
                  <strong className="text-slate-700 font-mono font-black">92%</strong>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
            </div>

            {/* Card D: Credits Earned */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-pink-200/60 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 bg-pink-50/40 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">CURRICULUM CREDITS COMPLETED</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span id="label-credits-completed" className="text-3xl font-black font-mono text-slate-900 tracking-tight">{creditsEarned}</span>
                  <span className="text-sm font-mono text-slate-400 font-bold">/ {totalTargetCredits}</span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Expected graduation credit ratio:</span>
                  <strong className="text-pink-600 font-mono font-bold">{Math.round((creditsEarned / totalTargetCredits) * 100)}%</strong>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.round((creditsEarned / totalTargetCredits) * 100)}%` }} />
                </div>
              </div>
            </div>

          </div>

          {/* 3. MAIN ANALYTICS ROW: GPA Trend Analysis Line Chart & Subject Performance Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* GPA Trend Chart (8 cols map) */}
            <div id="gpa-line-chart-section" className="lg:col-span-8 bg-white border border-slate-250/70 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <TrendingUp className="w-5 h-5 text-indigo-500" /> GPA Career Arc Progression Trend
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Visually tracking how performance results evolve semester over semester.</p>
                </div>
                
                {/* Stats badge details */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.8 rounded-lg border border-emerald-100 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Upward Trajectory Status
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-50 font-mono font-bold px-2.2 py-0.8 rounded border border-slate-200">
                    Cgpa average base: 3.68
                  </span>
                </div>
              </div>

              {/* GORGEOUS HIGH-FIDELITY INTERACTIVE SVG PATH TREND GRAPH */}
              <div className="relative pt-6 px-4 pb-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <svg 
                  id="gpa-curve-svg-canvas"
                  viewBox="0 0 620 280" 
                  className="w-full h-72 overflow-visible"
                >
                  <defs>
                    {/* SVG Gradient definition for premium glowing line area */}
                    <linearGradient id="gpaFlowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="gpaBaselineLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#cbd5e1" stopOpacity="1" />
                      <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Values */}
                  {[
                    { label: "4.0", y: 20 },
                    { label: "3.7 (A- Target)", y: 80 },
                    { label: "3.5 (Good)", y: 120 },
                    { label: "3.0 (Average)", y: 200 },
                    { label: "2.0 (Pass)", y: 260 }
                  ].map((grid, gIdx) => (
                    <g key={gIdx}>
                      <line x1="30" y1={grid.y} x2="590" y2={grid.y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3" />
                      <text x="6" y={grid.y + 3} className="text-[9px] fill-slate-350 font-mono font-semibold">{grid.label}</text>
                    </g>
                  ))}

                  {/* Dynamic Average GPA Line Overlay */}
                  <line x1="30" y1="84" x2="590" y2="84" stroke="url(#gpaBaselineLine)" strokeWidth="1.5" />
                  <text x="592" y="87" className="text-[8px] fill-slate-400 font-mono font-bold">AVG GPA LINE (3.68)</text>

                  {/* SVG Coordinates mapping for Semester 1 to Semester 6
                      S1: 3.45 (x:60, y:135)
                      S2: 3.65 (x:156, y:95)
                      S3: 3.55 (x:252, y:115)
                      S4: 3.88 (x:348, y:49)
                      S5: 3.72 (x:444, y:81)
                      S6: 3.85 (x:540, y:55) (forecasted target representation)
                  */}
                  
                  {/* Glowing shaded area under trajectory curve */}
                  <path 
                    d="M 60,260 L 60,135 L 156,95 L 252,115 L 348,49 L 444,81 L 540,55 L 540,260 Z"
                    fill="url(#gpaFlowGradient)"
                    className="transition-all duration-300"
                  />

                  {/* Rich Indigo curve line */}
                  <polyline 
                    fill="none" 
                    stroke="#4338ca" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="60,135 156,95 252,115 348,49 444,81 540,55"
                    className="drop-shadow-xs"
                  />

                  {/* Interactive Dot checkpoints */}
                  {[
                    { sem: "Sem 1", gpa: 3.45, x: 60, y: 135, status: "Completed" },
                    { sem: "Sem 2", gpa: 3.65, x: 156, y: 95, status: "Completed" },
                    { sem: "Sem 3", gpa: 3.55, x: 252, y: 115, status: "Completed" },
                    { sem: "Sem 4", gpa: 3.88, x: 348, y: 49, status: "Completed" },
                    { sem: "Sem 5", gpa: 3.72, x: 444, y: 81, status: "Current" },
                    { sem: "Sem 6", gpa: 3.85, x: 540, y: 55, status: "Forecasted" }
                  ].map((pt, index) => {
                    const isHovered = hoveredTrendIdx === index;
                    return (
                      <g 
                        key={index} 
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredTrendIdx(index)}
                        onMouseLeave={() => setHoveredTrendIdx(null)}
                      >
                        {/* Interactive glow handle on hover */}
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isHovered ? "11" : "5"} 
                          fill="#4f46e5" 
                          fillOpacity={isHovered ? "0.15" : "0.0"} 
                          className="transition-all duration-150" 
                        />
                        
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isHovered ? "7" : "5"} 
                          fill={pt.status === 'Forecasted' ? '#d946ef' : '#312e81'} 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          className="transition-all duration-150 shadow-sm" 
                        />

                        {/* Top Label values */}
                        <text 
                          x={pt.x} 
                          y={pt.y - 14} 
                          textAnchor="middle" 
                          className={`text-[10px] font-mono font-black ${isHovered ? 'fill-indigo-600 font-extrabold scale-110' : 'fill-slate-700'}`}
                        >
                          {pt.gpa.toFixed(2)}
                        </text>

                        {/* Bottom X-Axis labels */}
                        <text 
                          x={pt.x} 
                          y="275" 
                          textAnchor="middle" 
                          className={`text-[9px] font-mono font-semibold ${pt.status === 'Current' ? 'fill-indigo-600 font-bold' : 'fill-slate-400'}`}
                        >
                          {pt.sem}
                        </text>

                        {/* Hover Popup card details */}
                        {isHovered && (
                          <g transform={`translate(${pt.x + 12 < 500 ? pt.x + 10 : pt.x - 110}, ${pt.y - 45})`}>
                            <rect width="100" height="42" rx="6" fill="#0f172a" opacity="0.94" />
                            <text x="8" y="16" className="text-[8px] fill-slate-300 font-bold">{pt.sem} Standing</text>
                            <text x="8" y="27" className="text-[9px] fill-white font-mono font-semibold">GPA: {pt.gpa.toFixed(2)}</text>
                            <text x="8" y="36" className="text-[7px] fill-indigo-300 font-bold uppercase">{pt.status}</text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Compare matrix stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4 pt-3.5 border-t border-slate-150/70 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Fastest Climbing Semester</span>
                  <p id="trend-metric-highest" className="text-slate-700 font-extrabold mt-0.5">Semester 4 (+0.33 increase)</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Current average performance</span>
                  <p className="text-slate-700 font-extrabold mt-0.5">Class Rank: Top 8% of students</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Degree Outlook Target</span>
                  <p id="trend-metric-degree" className="text-indigo-650 font-black mt-0.5">Dean's List Eligible (Active)</p>
                </div>
              </div>

            </div>

            {/* Subject Performance analysis (4 cols map) */}
            <div id="subject-performance-section" className="lg:col-span-4 bg-white border border-slate-250/70 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div>
                <dt className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Layers className="w-5 h-5 text-indigo-500" /> Subject Level Analysis
                  </h3>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-bold uppercase tracking-wider py-0.5 px-2 rounded">SIM COMPLETED</span>
                </dt>
                <p className="text-xs text-slate-400 mt-2">Horizontal comparison of core subjects. Focus items are highlighted below.</p>
              </div>

              {/* Course GPA Meter columns rendering */}
              <div className="space-y-4 mt-5">
                {subjectPerformance.map((course, idx) => (
                  <div key={idx} className="space-y-1 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-800 font-extrabold tracking-tight">{course.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({course.grade})</span>
                      </div>
                      <strong className="font-mono text-slate-800">{course.gpa.toFixed(2)} GPA</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                        <div 
                          className={`${course.color} h-full rounded-full transition-all duration-500 group-hover:scale-y-110`} 
                          style={{ width: `${(course.gpa / 4.0) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 text-right w-8">{course.score}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono leading-none pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Rating: <strong className="text-indigo-500">{course.rating}</strong></span>
                      <span>Weight: 4-Credits</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/50 text-[11px] text-indigo-800 flex items-start gap-2.5 mt-4">
                <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="leading-normal">
                  <strong>Hooray!</strong> <span className="font-semibold text-indigo-900">Database Systems</span> is currently your strongest subject with a perfect score matrix representation.
                </p>
              </div>

            </div>

          </div>

          {/* 4. ACADEMIC PROGRESS & PERFORMANCE DISTRIBUTION SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Progress widget (5 units) */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div>
                <h3 className="text-base font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                  <CalendarCheck className="w-5 h-5 text-pink-500" /> Degree Completion Tracker
                </h3>
                <p className="text-xs text-slate-400 mt-1">Expected Graduation Credit requirements status report.</p>
              </div>

              {/* Progress Ring Visualization Side by Side */}
              <div className="flex flex-col sm:flex-row items-center gap-6 py-6 border-y border-dashed border-slate-150 my-4">
                
                {/* SVG Progress gauge circle */}
                <div className="relative h-32 w-32 shrink-0">
                  <svg transform="rotate(-90)" viewBox="0 0 120 120" className="w-32 h-32">
                    {/* Background track circle */}
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      fill="none" 
                      stroke="#f1f5f9" 
                      strokeWidth="11" 
                    />
                    {/* Glowing pink foreground progression ring representing 78 completed out of 120 (65%) */}
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      fill="none" 
                      stroke="#ec4899" 
                      strokeWidth="11" 
                      strokeDasharray="314.15" 
                      strokeDashoffset={314.15 * (1 - 0.65)} 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* Central Text label overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black font-mono text-slate-900 leading-none">65%</span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1">Completed</span>
                  </div>
                </div>

                {/* Legend details description */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">CREDITS EARNED</span>
                    <strong className="text-base font-extrabold text-slate-800 block leading-none">78 of 120 Credits</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">REMAINING FOR DEGREE</span>
                    <strong className="text-base font-extrabold text-slate-850 block leading-none">42 Credits</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">EXPECTED GRADUATION</span>
                    <span className="text-slate-650 text-xs font-semibold block">June 2027</span>
                  </div>
                </div>

              </div>

              {/* Status footer information */}
              <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                ⭐ <span className="font-semibold text-slate-800">First Class expected classification:</span> Maintain an average SGPA of 3.65+ for the remaining semesters to lock in First Class honors officially.
              </div>

            </div>

            {/* Middle Performance distribution (4 units) */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <PieChart className="w-5 h-5 text-indigo-500" /> Grade Achievements
                </h3>
                <p className="text-xs text-slate-400 mt-1">Grade frequency parameters throughout the career trajectory.</p>
              </div>

              {/* Horizontal stacked segmented metrics represent donut map bar */}
              <div className="space-y-3.5 my-4">
                {gradeDistribution.map((item, keyIdx) => (
                  <div key={keyIdx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium font-mono">{item.grade}</span>
                      <span className="font-bold text-slate-700">{item.count} classes ({item.percentage}%)</span>
                    </div>
                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
                Total assessed courses: 18 (GPA weighted)
              </div>

            </div>

            {/* Right Academic Standing details (3 units) */}
            <div className="md:col-span-3 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold bg-white/10 text-indigo-300 font-mono tracking-widest px-2 py-0.5 rounded-sm uppercase inline-block">System Decider</span>
                <h4 className="text-base font-black tracking-tight flex items-center gap-1">
                  <Award className="w-4.5 h-4.5 text-indigo-300" /> Standing Status
                </h4>
              </div>

              <div className="space-y-4 py-4 border-y border-white/10 my-3">
                
                <div className="space-y-0.5">
                  <span className="text-[10px] text-indigo-200 block uppercase font-mono">CURRENT ACADEMIC STANDING</span>
                  <strong className="text-lg font-extrabold text-indigo-50 font-sans block tracking-tight">FIRST CLASS HONOR</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-indigo-200 block uppercase font-mono">FACULTY RANK ESTIMATE</span>
                  <span className="text-sm font-extrabold text-emerald-350 block font-mono">Top 8% (#24 in cohort)</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-indigo-200 block uppercase font-mono">DEAN'S LIST ELIGIBILITY</span>
                  <strong className="text-sm font-extrabold text-blue-300 block">ELIGIBLE (Active status)</strong>
                </div>

              </div>

              <div className="text-[10px] text-indigo-200/70 font-mono">
                Last checked: June 22, 2026.
              </div>

            </div>

          </div>

          {/* 5. INTERACTIVE GPA PREDICTION MODULE & ACADEMIC GOALS COMPONENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* GPA PREDICTION MODULE (7 units) */}
            <div id="gpa-prediction-module" className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Calculator className="w-5 h-5 text-blue-500" /> GPA Forecast Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Interactively adjust mock scores to dynamically predict expected grades!</p>
                </div>
                
                <button
                  onClick={() => {
                    setAssignmentAvg(88);
                    setQuizAvg(85);
                    setMidExamAvg(90);
                    setExpectedFinalScore(92);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                  title="Restore model averages to initial presets"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset sliders
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Sliders Controllers Form (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">COURSE MOCK INPUT DATA</h4>
                  
                  {/* Slider 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-650 font-extrabold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Assignments Average
                      </label>
                      <span className="font-mono text-slate-700 font-black">{assignmentAvg}%</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="100"
                      value={assignmentAvg}
                      onChange={(e) => setAssignmentAvg(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 cursor-pointer bg-slate-100 rounded-lg"
                    />
                    <p className="text-[9px] text-slate-400">Weight value parameter: 20% overall</p>
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-650 font-extrabold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Quizzes Average
                      </label>
                      <span className="font-mono text-slate-700 font-black">{quizAvg}%</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="100"
                      value={quizAvg}
                      onChange={(e) => setQuizAvg(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 cursor-pointer bg-slate-100 rounded-lg"
                    />
                    <p className="text-[9px] text-slate-400">Weight value parameter: 10% overall</p>
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-650 font-extrabold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Mid-term Exam Average
                      </label>
                      <span className="font-mono text-slate-700 font-black">{midExamAvg}%</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="100"
                      value={midExamAvg}
                      onChange={(e) => setMidExamAvg(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 h-1.5 cursor-pointer bg-slate-100 rounded-lg"
                    />
                    <p className="text-[9px] text-slate-400">Weight value parameter: 30% overall</p>
                  </div>

                  {/* Slider 4 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-650 font-extrabold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Expected Final Exam Score
                      </label>
                      <span className="font-mono text-slate-700 font-black">{expectedFinalScore}%</span>
                    </div>
                    <input 
                      type="range"
                      min="30"
                      max="100"
                      value={expectedFinalScore}
                      onChange={(e) => setExpectedFinalScore(parseFloat(e.target.value))}
                      className="w-full accent-pink-600 h-1.5 cursor-pointer bg-slate-100 rounded-lg"
                    />
                    <p className="text-[9px] text-slate-400">Weight value parameter: 40% overall</p>
                  </div>

                </div>

                {/* Simulated Prediction Outcome Screen (5 cols) */}
                <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono text-center">PREVIEW OUTCOME MODEL</span>
                    
                    {/* Centered big estimated grade badge */}
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center justify-center h-20 w-20 bg-indigo-50 text-indigo-700 rounded-full border-3 border-indigo-200">
                        <span id="predicted-grade-value" className="text-4xl font-extrabold tracking-tight font-sans">{prediction.grade}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 font-semibold mt-1">Expected Cumulative Score: <strong>{prediction.score}%</strong></p>
                    </div>

                    {/* Result lines */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450 font-mono">Predicted GPA Equivalent:</span>
                        <strong id="predicted-gpa-eq" className="font-mono text-slate-800 text-sm font-black">{prediction.gpa}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450">Outlook Rating:</span>
                        <strong className="text-blue-600 font-bold">{prediction.outlook}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-450">Confidence Score:</span>
                        <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">{prediction.confidence}%</span>
                      </div>
                    </div>

                  </div>

                  <div className="text-center">
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Weights adhere strictly to Student Success Platform course syllabus guidelines.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* ACADEMIC GOALS LISTING PANEL (5 units) */}
            <div id="academic-goals-block" className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div>
                <dt className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <Target className="w-5 h-5 text-emerald-500" /> Academic Goals Supervisor
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Track strategic academic benchmarks.</p>
                  </div>
                  <button
                    id="open-set-goal-popup"
                    onClick={() => setShowGoalForm(true)}
                    className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-extrabold text-xs py-1.5 px-3 rounded-lg border border-emerald-100 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Set Goal
                  </button>
                </dt>

                {/* Combine Custom Goals and Standards list */}
                <div id="goals-supervisor-timeline" className="space-y-4">
                  
                  {/* Render standard core goals */}
                  {standardGoals.map((standard, idx) => (
                    <div key={idx} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/20 hover:border-slate-200 relative">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-bold font-mono tracking-widest px-2 py-0.5 rounded border ${
                          standard.status === 'Achieved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {standard.status.toUpperCase()}
                        </span>
                        
                        <span className="text-[10px] text-slate-400 font-mono font-medium">
                          Probability: <strong className="text-slate-700 font-bold">{standard.probability}</strong>
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 mt-2">{standard.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">{standard.subtitle}</p>

                      <div className="mt-3.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Progress Rate:</span>
                          <span className="font-mono text-slate-700 font-bold">{standard.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-1 rounded-full" 
                            style={{ width: `${standard.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Render user dynamic goals from props */}
                  {goals.map((g) => {
                    const ratio = Math.round((g.currentPercent / g.targetPercent) * 100);
                    return (
                      <div key={g.id} className="border border-indigo-150 p-4 rounded-x bg-indigo-50/10 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            CUSTOM GOAL
                          </span>

                          <button
                            onClick={() => onDeleteGoal(g.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded"
                            title="Drop specific goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 mt-2">{g.title}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 font-mono">{g.subtitle}</p>

                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Completion Slide:</span>
                            <strong className="font-mono text-indigo-700">{ratio}%</strong>
                          </div>
                          
                          <input 
                            type="range"
                            min="0"
                            max={g.targetPercent}
                            value={g.currentPercent}
                            onChange={(e) => onUpdateGoalProgress(g.id, parseInt(e.target.value))}
                            className="w-full accent-indigo-600 h-1"
                          />
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-mono mt-4">
                Total Tracked Objectives: {3 + goals.length}
              </div>

            </div>

          </div>

          {/* 6. AI RECOMMENDATIONS & STRATEGIC INSIGHTS ACCENT PANEL */}
          <div id="ai-insights-panel" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">AI Academic Insights & Recommendations</h3>
                <p className="text-xs text-slate-400">Heuristic strategic suggestions generated dynamically from your active academic registers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 font-mono flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" /> STRENGTHS & TARGETS
                </h4>
                <ul className="text-xs text-slate-650 space-y-2.5 list-none pl-0">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>
                      <strong className="text-slate-800">Database Systems (CSE-305)</strong> is your strongest subject. You currently have a solid 93% average grade achieved. Excellent system integration skills observed.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>
                      Completing all remaining coursework assignments will boost your final semester GPA by <strong className="text-emerald-600 font-mono font-bold font-semibold">+0.15 points</strong> automatically.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-extrabold">✓</span>
                    <span>
                      Maintaining your current trajectory easily secures an esteemed <strong className="text-slate-900">First Class honors degree</strong> upon graduation in June 2027.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-rose-950 font-mono flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> IMPROVEMENTS ADVISED
                </h4>
                <ul className="text-xs text-slate-650 space-y-2.5 list-none pl-0">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">!</span>
                    <span>
                      <strong className="text-slate-800">Computer Networks (CSE-310)</strong> requires improvement. Your current quiz scores point to potential exam performance dips. Attempt socket connection labs with care!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">!</span>
                    <span>
                      Software Engineering project timelines indicate peak load warnings between December 1st and December 15th. We advise scheduling study segments in advance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">!</span>
                    <span>
                      Aim for a final exam grade of at least 88% in networks to prevent your active SGPA from slipping below Dean's eligibility margin (3.65).
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* 7. HISTORICAL SEMESTER COMPARISON TABLE */}
          <div id="semester-ledger" className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
            
            <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5 leading-none">
                  <Layers className="w-5 h-5 text-indigo-500" /> Semester Performance Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">Official cumulative audits per semester validated by the university registrar's office.</p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-400">
                Completed Credits: <strong>78</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-5">Semester</th>
                    <th className="py-3 px-3">Academic Period</th>
                    <th className="py-3 px-3 text-center">GPA Equivalent</th>
                    <th className="py-3 px-3 text-center">Credits Enrolled</th>
                    <th className="py-3 px-3 text-center">Average Course Grade</th>
                    <th className="py-3 px-3">Official Status</th>
                    <th className="py-3 px-5 text-right w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td id="sem-comparison-row-1" className="py-3.5 px-5 font-extrabold text-slate-900">Semester 1</td>
                    <td className="py-3.5 px-3 text-slate-500">Sep 2021 - Jan 2022</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-950">3.45</td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">18</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-705">B+</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-400">Registrar ok</td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">Semester 2</td>
                    <td className="py-3.5 px-3 text-slate-500">Feb 2022 - Jun 2022</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-950">3.62</td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">18</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-705">A-</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-400">Registrar ok</td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">Semester 3</td>
                    <td className="py-3.5 px-3 text-slate-500">Sep 2022 - Jan 2023</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-950">3.71</td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">18</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-705">A-</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-400">Registrar ok</td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-extrabold text-slate-900">Semester 4</td>
                    <td className="py-3.5 px-3 text-slate-500">Feb 2023 - Jun 2023</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-950">3.78</td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">18</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-705">A</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-400">Registrar ok</td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 transition-colors bg-indigo-50/10">
                    <td className="py-3.5 px-5 font-black text-slate-900">Semester 5 (Active)</td>
                    <td className="py-3.5 px-3 text-slate-600">Sep 2023 - Jan 2024</td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-indigo-700">3.72</td>
                    <td className="py-3.5 px-3 text-center font-mono text-indigo-700">15</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-705">A/A-</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2.2 py-0.5 rounded border border-blue-200">
                        <Activity className="w-3 h-3 text-blue-500 animate-spin" strokeWidth={3} /> In Progress
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-indigo-500 font-bold">Active term</td>
                  </tr>

                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-mono">
              Registrar validated. Data values updated on UTC timestamp 2026-06-22.
            </div>

          </div>

          {/* 8. QUICK ACTIONS GRID CONTROLLER */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Work Suite Quick Actions Panel
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <button 
                id="act-btn-calc-gpa"
                onClick={() => {
                  setAssignmentAvg(95);
                  setQuizAvg(95);
                  setMidExamAvg(95);
                  setExpectedFinalScore(95);
                  triggerToast("Simulated an Outstanding 'A' expectation forecast in results widget!");
                }}
                className="bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-bold text-xs p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-start gap-4 text-left transition-all cursor-pointer"
              >
                <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">Simulate GP Milestone</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Quick predict model scores.</p>
                </div>
              </button>

              <button 
                id="act-btn-goal"
                onClick={() => setShowGoalForm(true)}
                className="bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-bold text-xs p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-start gap-4 text-left transition-all cursor-pointer"
              >
                <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">Add Academic Goal</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Set strategic benchmarks.</p>
                </div>
              </button>

              <button 
                id="act-btn-nav-courses"
                onClick={() => {
                  if (setActiveTab) {
                    setActiveTab('subjects');
                  } else {
                    triggerToast("Unable to redirect: Navigation controller missing context.");
                  }
                }}
                className="bg-indigo-650 hover:bg-indigo-705 text-white font-bold text-xs p-4 rounded-2xl shadow-sm border border-indigo-700 hover:shadow-lg flex flex-col items-start gap-4 text-left transition-all cursor-pointer"
              >
                <div className="h-9 w-9 bg-white/15 text-white rounded-xl flex items-center justify-center animate-pulse">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight text-white">Manage Live Grades</h4>
                  <p className="text-[10px] text-indigo-100 mt-0.5">Edit actual credentials.</p>
                </div>
              </button>

              <button 
                id="act-btn-report"
                onClick={triggerReportGeneration}
                className="bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-bold text-xs p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-start gap-4 text-left transition-all cursor-pointer"
              >
                <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Download className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">Download Report</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generate analytical backup.</p>
                </div>
              </button>

              <button 
                id="act-btn-transcript"
                onClick={() => setShowTranscriptModal(true)}
                className="bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-bold text-xs p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-start gap-4 text-left transition-all cursor-pointer"
              >
                <div className="h-9 w-9 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">Generate Transcript</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Review multi-semester records.</p>
                </div>
              </button>

              <button 
                id="act-btn-empty"
                onClick={() => setEmptyStateActive(true)}
                className="bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-bold text-xs p-4 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-start gap-4 text-left transition-all cursor-pointer"
              >
                <div className="h-9 w-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">Empty States Preview</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle default illustrative layout.</p>
                </div>
              </button>

            </div>
          </div>

        </>
      )}

      {/* ================= MODAL APPARATUS A: TRANSCRIPT PREVIEWER ================= */}
      {showTranscriptModal && (
        <div id="transcript-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col justify-between">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Digital Unofficial Transcript</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Issued by: Student Success Platform Registrar Engine</p>
                </div>
              </div>

              <button 
                onClick={() => setShowTranscriptModal(false)}
                className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            {/* Transcript Sheet Body */}
            <div className="p-6 space-y-6">
              
              {/* Header profile data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-mono text-[9px] font-bold">STUDENT ID</span>
                  <strong className="text-slate-800 font-mono">STU-2021-9844</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-mono text-[9px] font-bold">DEPARTMENT MAJOR</span>
                  <strong className="text-slate-800">Software Engineering</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-mono text-[9px] font-bold">TOTAL COMPLETED CGPA</span>
                  <strong className="text-indigo-600 font-mono font-bold font-black">{baselineCgpa.toFixed(2)} / 4.0</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-mono text-[9px] font-bold">CREDITS REGISTERED</span>
                  <strong className="text-slate-800 font-mono">{creditsEarned} Credits</strong>
                </div>
              </div>

              {/* Course timeline records loop */}
              <div className="space-y-6">
                {transcriptTimeline.map((segment, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-1.5 border-slate-150">
                      <span className="text-xs font-black text-indigo-950 font-sans">{segment.sem}</span>
                      <div className="flex gap-2 text-[10px] font-mono text-slate-500 font-bold">
                        <span>GPA: <strong>{segment.gpa}</strong></span>
                        <span>•</span>
                        <span>Earned: <strong>{segment.credits} Credits</strong></span>
                      </div>
                    </div>

                    <div className="space-y-1.5 divide-y divide-slate-100">
                      {segment.courses.map((crs, cKey) => (
                        <div key={cKey} className="flex justify-between items-center text-xs pt-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-slate-100 text-[10px] text-slate-500 font-bold px-1.5 py-0.2 rounded">{crs.code}</span>
                            <span className="text-slate-700 font-medium">{crs.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-6 font-mono font-semibold">
                            <span>GPA {crs.gpa}</span>
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-100 text-[10px] font-bold text-center w-8">{crs.grade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-b-3xl text-xs">
              <span className="text-slate-400 font-mono">Verify digitally: <strong>SSP-MD5-9833X18</strong></span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerToast("Official digital transcript generated and copied to local files tray.")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Official PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL APPARATUS B: EXPORT REPORT GENERATOR ================= */}
      {showReportModal && (
        <div id="report-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                  <Download className="w-5 h-5 text-indigo-500" /> Export Academic Report
                </h3>
                <p className="text-xs text-slate-400">Generate a comprehensive cumulative academic brief.</p>
              </div>
              
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Config details */}
            <div className="space-y-4">
              
              <div>
                <span className="text-xs font-bold text-slate-500 font-mono block mb-1">CHOOSE FILE FORMAT</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-extrabold">
                  <label className="border border-indigo-650 bg-indigo-50/20 text-indigo-850 p-3 rounded-xl flex flex-col items-center gap-1 text-center cursor-pointer">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span>PDF Brief</span>
                  </label>
                  <label onClick={() => triggerToast("Excel format selected as target export layout.")} className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-xl flex flex-col items-center gap-1 text-center cursor-pointer">
                    <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                    <span>Excel Ledger</span>
                  </label>
                  <label onClick={() => triggerToast("JSON structure selected as target serialization standard.")} className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-xl flex flex-col items-center gap-1 text-center cursor-pointer">
                    <Layers className="w-5 h-5 text-slate-400" />
                    <span>JSON Raw</span>
                  </label>
                </div>
              </div>

              {/* Inclusion checkboxes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 font-mono block">INCLUSIONS CONTROLLER</span>
                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 accent-indigo-600" />
                    <span>Include GPA Progression Trend Data</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 accent-indigo-600" />
                    <span>Include Detailed Course-by-Course Marks Record</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 accent-indigo-600" />
                    <span>Include Active Academic Goals Status indicators</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 accent-indigo-600" />
                    <span>Include AI Insight-Based Recommendations list</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  triggerToast("Preparing export profile... Saved to files under cumulative-gpa-progress-audit.pdf");
                  setShowReportModal(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100"
              >
                Compile and Export (cumulative-gpa-report.pdf)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL APPARATUS C: SET ACADEMIC GOAL POPUP ================= */}
      {showGoalForm && (
        <div id="add-goal-overlay" className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            id="popup-academic-goal-form"
            onSubmit={handleAddNewGoal}
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in"
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <h4 className="font-black text-slate-900 leading-none">Configure New Academic Goal</h4>
              <button 
                type="button" 
                onClick={() => setShowGoalForm(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pb-2 text-xs">
              <div className="space-y-0.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Goal Title</label>
                <input 
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Master algorithms study notes weekly"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-medium"
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Complementary Subtitle</label>
                <input 
                  type="text"
                  value={newGoalSubtitle}
                  onChange={(e) => setNewGoalSubtitle(e.target.value)}
                  placeholder="e.g. Weekly study sessions with peer groups"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Current Progress (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Target Threshold (%)</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowGoalForm(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-center text-xs border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 rounded-xl text-center text-xs shadow-md shadow-indigo-100"
              >
                Create Goal Track
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notice Banner Overlay */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
