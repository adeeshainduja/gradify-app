import { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Sparkles,
  Activity,
  Target,
  BarChart2
} from 'lucide-react';
import { 
  Semester, 
  Subject, 
  Assignment, 
  Exam, 
  scalePoints, 
  gradeToPoints, 
  SUBJECT_COLORS,
  formatDateSafe,
  formatDateTimeSafe,
  formatLocaleStringSafe
} from '../types';
import { currentGPA } from '../api/gpaApi';
import { dashboardStats } from '../api/analyticsApi';

interface DashboardViewProps {
  semesters: Semester[];
  subjects: Subject[];
  assignments: Assignment[];
  exams: Exam[];
  profile: any;
  setActiveView: (view: string) => void;
  onQuickToggleAssignment: (id: string) => void;
  onAddAssignmentQuick: () => void;
}

export default function DashboardView({
  semesters,
  subjects,
  assignments,
  exams,
  profile,
  setActiveView,
  onQuickToggleAssignment,
  onAddAssignmentQuick
}: DashboardViewProps) {
  const [analyticsTab, setAnalyticsTab] = useState<'timeline' | 'workload' | 'gauge'>('timeline');
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalSubjects: number;
    pendingAssignments: number;
    upcomingExams: number;
  } | null>(null);
  const [currentGPAData, setCurrentGPAData] = useState<{
    sgpa: number;
    cgpa: number;
  } | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, gpaRes] = await Promise.all([
          dashboardStats(),
          currentGPA(),
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (gpaRes.data) setCurrentGPAData(gpaRes.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      }
    };
    loadDashboard();
  }, []);

  // Find current semester
  const currentSemester = semesters.find(s => s.isCurrent) || semesters[semesters.length - 1];
  const currentSubjects = subjects.filter(sub => sub.semesterId === currentSemester?.id);
  const currentSubjectIds = currentSubjects.map(s => s.id);

  // Filter current assignments & exams
  const currentAssignments = assignments.filter(a => currentSubjectIds.includes(a.subjectId));
  const currentExams = exams.filter(e => currentSubjectIds.includes(e.subjectId));

  const pendingAssignments = currentAssignments.filter(a => a.status !== 'Graded');
  const upcomingExams = currentExams.filter(e => e.status === 'Upcoming');

  // GPA Calculation logic
  const calculateCumulativeGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    // Filter out In Progress ('IP') grades
    const gradedSubjects = subjects.filter(sub => sub.grade !== 'IP');

    if (gradedSubjects.length === 0) return 0;

    gradedSubjects.forEach(sub => {
      totalPoints += gradeToPoints(sub.grade) * sub.credits;
      totalCredits += sub.credits;
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calculateSemesterGPA = (semId: string) => {
    let totalPoints = 0;
    let totalCredits = 0;

    const gradedSubjects = subjects.filter(sub => sub.semesterId === semId && sub.grade !== 'IP');

    if (gradedSubjects.length === 0) return 0;

    gradedSubjects.forEach(sub => {
      totalPoints += gradeToPoints(sub.grade) * sub.credits;
      totalCredits += sub.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };

  const rawCumulativeGpa = calculateCumulativeGPA();
  const cumulativeGpa = isNaN(rawCumulativeGpa) ? 0 : rawCumulativeGpa;
  const rawScaledCumulativeGpa = scalePoints(cumulativeGpa, profile.gpaScale);
  const scaledCumulativeGpa = isNaN(rawScaledCumulativeGpa) ? 0 : rawScaledCumulativeGpa;
  const rawCurrentSemesterGpa = currentSemester ? calculateSemesterGPA(currentSemester.id) : 0;
  const currentSemesterGpa = isNaN(rawCurrentSemesterGpa) ? 0 : rawCurrentSemesterGpa;
  const rawScaledSemesterGpa = scalePoints(currentSemesterGpa, profile.gpaScale);
  const scaledSemesterGpa = isNaN(rawScaledSemesterGpa) ? 0 : rawScaledSemesterGpa;

  // Total completed credits
  const totalCompletedCredits = subjects
    .filter(sub => sub.grade !== 'IP' && sub.grade !== 'F')
    .reduce((sum, sub) => sum + sub.credits, 0);

  const totalRegisteredCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);

  // Timeline compiled dataset (chronological assignments & exams)
  const timelineActivities = [
    ...currentAssignments.map(a => {
      const d = new Date(a.dueDate || '');
      const val = isNaN(d.getTime()) ? 0 : d.getTime();
      return {
        id: a.id,
        title: a.title,
        type: 'Assignment' as const,
        date: d,
        dateVal: val,
        dateStr: a.dueDate,
        priority: a.priority || 'Medium',
        status: a.status,
        subjectId: a.subjectId,
        detail: `${a.description || 'No homework details loaded.'} | Weight: ${a.weight}% | Max Score: ${a.maxScore}`
      };
    }),
    ...currentExams.map(e => {
      const d = new Date(e.dateTime || '');
      const val = isNaN(d.getTime()) ? 0 : d.getTime();
      return {
        id: e.id,
        title: e.title,
        type: 'Exam' as const,
        date: d,
        dateVal: val,
        dateStr: e.dateTime,
        priority: 'High' as const,
        status: e.status,
        subjectId: e.subjectId,
        detail: `Exam Location: ${e.room || 'TBA'} | Weight: ${e.weight}% | Notes: ${e.notes || 'N/A'}`
      };
    })
  ].sort((a, b) => a.dateVal - b.dateVal);

  // Get color configurations
  const getColorConfig = (colorName: string) => {
    return SUBJECT_COLORS.find(c => c.value === colorName) || SUBJECT_COLORS[0];
  };

  // Helper to format dates nicely
  const formatDateSimple = (dateStr: string) => {
    return formatDateSafe(dateStr);
  };


  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 transition-colors rounded-full text-xs font-semibold backdrop-blur-sm">
              <Sparkles size={14} className="animate-pulse text-amber-300" />
              <span>{profile.university}</span>
            </div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tight">Active Semester: {currentSemester ? currentSemester.name : 'Summer 2026'}</h1>
            <p className="text-blue-100 text-sm max-w-xl font-sans">
              Keep it up! Your current cumulative GPA is holding strong at <span className="font-bold underline text-white">
                {currentGPAData ? currentGPAData.cgpa.toFixed(2) : (scaledCumulativeGpa > 0 ? scaledCumulativeGpa.toFixed(2) : '3.72')}
              </span>. You have {stats ? stats.pendingAssignments : pendingAssignments.length} pending tasks to finish this week.
            </p>
          </div>
          <button 
            onClick={() => setActiveView('GPA & Analytics')}
            className="self-start md:self-auto inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm text-sm transition-transform active:scale-95"
            id="gpa-cta-btn"
          >
            <TrendingUp size={16} />
            <span>GPA Projection Tool</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid with micro-sparklines (Page 2, Statistics Cards Row 1 to 6) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="stats-grid">
        
        {/* 1. Current GPA */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Current GPA</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-headline text-slate-900">
              {currentGPAData && currentGPAData.cgpa > 0 ? currentGPAData.cgpa.toFixed(2) : (scaledCumulativeGpa > 0 ? scaledCumulativeGpa.toFixed(2) : '3.72')}
            </span>
          </div>
          <p className="text-[9px] text-emerald-600 font-medium mt-2 flex items-center gap-0.5">
            <TrendingUp size={11} />
            <span>Trend +0.12 (Upward)</span>
          </p>
        </div>

        {/* 2. Target GPA */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target GPA</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-headline text-blue-700">{profile.targetGpa.toFixed(2)}</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2">
            Progress {scaledCumulativeGpa > 0 ? Math.min(100, Math.round((scaledCumulativeGpa / profile.targetGpa) * 100)) : 93}%
          </p>
        </div>

        {/* 3. Pending Assignments */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pending Homework</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{stats ? stats.pendingAssignments : (pendingAssignments.length > 0 ? pendingAssignments.length : 5)}</span>
            <span className="text-xs text-slate-400">tasks</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Immediate deadlines</p>
        </div>

        {/* 4. Upcoming Exams */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Upcoming Exams</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{stats ? stats.upcomingExams : (upcomingExams.length > 0 ? upcomingExams.length : 3)}</span>
            <span className="text-xs text-slate-400">tests</span>
          </div>
          <p className="text-[9px] text-red-500 font-medium mt-2">Preparation scheduled</p>
        </div>

        {/* 5. Total Subjects */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Subjects</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-headline text-indigo-700">{stats ? stats.totalSubjects : (currentSubjects.length > 0 ? currentSubjects.length : 6)}</span>
            <span className="text-xs text-slate-400">enrolled</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Active syllabus tracks</p>
        </div>

        {/* 6. Completed Tasks */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed Tasks</span>
          {(() => {
            const totalTasks = currentAssignments.length + currentExams.length;
            const completedTasks = currentAssignments.filter(a => a.status === 'Graded').length + currentExams.filter(e => e.status === 'Completed').length;
            const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 78;
            return (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-headline text-emerald-600">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
              </>
            );
          })()}
        </div>

      </div>

      {/* Interactive Academic Analytics Hub */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold font-headline text-slate-950 flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              <span>Interactive Analytics Hub</span>
            </h3>
            <p className="text-xs text-slate-400">Click tabs to view academic timelines, credit workloads, or the GPA gauge</p>
          </div>

          {/* Tab buttons switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl self-stretch sm:self-auto select-none">
            <button
              onClick={() => { setAnalyticsTab('timeline'); setSelectedTimelineId(null); }}
              className={`flex-1 sm:flex-initial text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                analyticsTab === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Academic Calendar Timeline
            </button>
            <button
              onClick={() => { setAnalyticsTab('workload'); setSelectedTimelineId(null); }}
              className={`flex-1 sm:flex-initial text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                analyticsTab === 'workload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Workload Distribution Ledger
            </button>
            <button
              onClick={() => { setAnalyticsTab('gauge'); setSelectedTimelineId(null); }}
              className={`flex-1 sm:flex-initial text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                analyticsTab === 'gauge'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              GPA Target Dial Gauge
            </button>
          </div>
        </div>

        {/* Tab content wrapper container */}
        <div className="min-h-[180px] flex flex-col justify-center">
          
          {analyticsTab === 'timeline' && (
            <div className="space-y-6">
              {timelineActivities.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-sans">No scheduled exams or pending assignments on the timeline.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Timeline ribbons flow container */}
                  <div className="relative overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="flex items-center gap-4 min-w-[650px] relative">
                      {/* Timeline connection connector bar */}
                      <div className="absolute left-0 right-0 h-1 bg-slate-100 top-1/2 -translate-y-1/2 z-0" />
                      
                      {timelineActivities.map((act, idx) => {
                        const boundSubject = subjects.find(s => s.id === act.subjectId);
                        const visualCol = boundSubject ? getColorConfig(boundSubject.color) : SUBJECT_COLORS[0];
                        const isSelected = selectedTimelineId === act.id;
                        
                        return (
                          <div 
                            key={act.id} 
                            onClick={() => setSelectedTimelineId(isSelected ? null : act.id)}
                            className={`relative cursor-pointer z-10 p-3 rounded-xl border transition-all select-none w-56 shrink-0 ${
                              isSelected 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-102 ring-4 ring-blue-500/20' 
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-2 mb-1.5">
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                act.type === 'Exam' 
                                  ? 'bg-red-500 text-white' 
                                  : isSelected ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {act.type}
                              </span>
                              <span className={`text-[10px] font-mono font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                {formatDateSimple(act.dateStr)}
                              </span>
                            </div>

                            <p className="font-semibold text-xs truncate max-w-full leading-snug">{act.title}</p>
                            
                            <div className="flex items-center gap-1.5 mt-2">
                              <span 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: visualCol.hex }}
                              />
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold opacity-80 truncate">
                                {boundSubject?.code || 'GEN'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity detail sheet pane */}
                  {selectedTimelineId && (() => {
                    const selAct = timelineActivities.find(a => a.id === selectedTimelineId);
                    if (!selAct) return null;
                    const bSubject = subjects.find(s => s.id === selAct.subjectId);
                    const visualCol = bSubject ? getColorConfig(bSubject.color) : SUBJECT_COLORS[0];
                    
                    return (
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: visualCol.hex }} />
                            <h4 className="font-bold text-sm text-slate-900">{selAct.title}</h4>
                            <span className="text-xs text-slate-400 font-mono">({bSubject?.code})</span>
                          </div>
                          <p className="text-xs text-slate-600 font-sans">{selAct.detail}</p>
                          <p className="text-[11px] text-slate-400 font-sans">
                            Due/Scheduled Date: {formatLocaleStringSafe(selAct.dateStr)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                          {selAct.type === 'Assignment' && (
                            <button
                              onClick={() => {
                                onQuickToggleAssignment(selAct.id);
                                setSelectedTimelineId(null);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                            >
                              Toggle Completed
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveView(selAct.type === 'Assignment' ? 'Assignments' : 'Exams');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer transition-colors"
                          >
                            Details Hub &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {analyticsTab === 'workload' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {/* Left Column: Credit Workload Chart */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-400 font-sans uppercase tracking-wider">Subject Workload Weights (Credits)</h4>
                
                {currentSubjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No enrolled classes during this current semester.</p>
                ) : (
                  <div className="space-y-3">
                    {currentSubjects.map((sub) => {
                      const col = getColorConfig(sub.color);
                      const sAssignments = currentAssignments.filter(a => a.subjectId === sub.id);
                      const comp = sAssignments.filter(a => a.status === 'Graded').length;
                      const ratio = totalRegisteredCredits > 0 ? (sub.credits / totalRegisteredCredits) * 100 : 0;
                      
                      return (
                        <div key={sub.id} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{sub.code} &mdash; {sub.name}</span>
                            <span className="font-medium text-slate-500">{sub.credits} credits ({Math.round(ratio)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${ratio}%`, backgroundColor: col.hex }} 
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                            <span>Status Grade: {sub.grade} (Target: {sub.targetGrade})</span>
                            <span>{sAssignments.length} Assignments ({comp} graded)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Comparative Workload Insights info card */}
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-1.5">
                    <BarChart2 className="text-indigo-600" size={16} />
                    <span>Academic Load Intelligence</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside font-sans leading-relaxed">
                    <li>
                      Your course load is distributed across <span className="font-semibold text-slate-800">{currentSubjects.length} courses</span> this semester.
                    </li>
                    <li>
                      The total registered credits for this block are <span className="font-semibold text-indigo-600">{totalRegisteredCredits} credit hours</span>.
                    </li>
                    <li>
                      Average syllabus weight of assignments: <span className="font-semibold text-indigo-600">
                        {currentAssignments.length > 0 
                          ? Math.round(currentAssignments.reduce((sum, act) => sum + (act.weight || 10), 0) / currentAssignments.length)
                          : 15}%
                      </span> space per graded task.
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs font-mono font-bold text-slate-400">
                  <span>GPA TARGET SHADOW</span>
                  <span className="text-indigo-700 font-headline text-sm">{profile.targetGpa.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {analyticsTab === 'gauge' && (
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2 animate-fade-in">
              {/* Dynamic pointer needle gauge */}
              <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden shrink-0">
                {/* SVG circular needle dial */}
                <svg viewBox="0 0 220 120" className="w-[180px] h-[100px] overflow-visible">
                  {/* Outer circle track */}
                  <path 
                    d="M 30 110 A 80 80 0 0 1 190 110" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="16" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Completed colored track relative to cumulative gpa */}
                  {(() => {
                    const rawRatio = cumulativeGpa / 4.0;
                    const ratio = isNaN(rawRatio) || !isFinite(rawRatio) ? 0 : Math.min(1, Math.max(0, rawRatio));
                    // Simple coordinate mapper for custom interactive circular track progress
                    const angle = Math.PI - (ratio * Math.PI);
                    const tx = 110 + 80 * Math.cos(angle);
                    const ty = 110 - 80 * Math.sin(angle);
                    
                    return ratio > 0 ? (
                      <path 
                        d={`M 30 110 A 80 80 0 0 1 ${tx} ${ty}`} 
                        fill="none" 
                        stroke="url(#blue-to-indigo)" 
                        strokeWidth="16" 
                        strokeLinecap="round" 
                      />
                    ) : null;
                  })()}

                  {/* Visual gradient definition */}
                  <defs>
                    <linearGradient id="blue-to-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>

                  {/* Target gpa hash indicators */}
                  {(() => {
                    const scale = profile.gpaScale || 4.0;
                    const rawRatio = profile.targetGpa / scale;
                    const ratio = isNaN(rawRatio) || !isFinite(rawRatio) ? 0.9 : Math.min(1, Math.max(0, rawRatio));
                    const angle = Math.PI - (ratio * Math.PI);
                    const tx1 = 110 + 70 * Math.cos(angle);
                    const ty1 = 110 - 70 * Math.sin(angle);
                    const tx2 = 110 + 90 * Math.cos(angle);
                    const ty2 = 110 - 90 * Math.sin(angle);
                    
                    return (
                      <>
                        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#ef4444" strokeWidth="3" />
                        <text x={tx2} y={ty2 - 3} className="text-[9px] fill-red-500 font-sans font-bold" textAnchor="middle">TARGET</text>
                      </>
                    );
                  })()}

                  {/* Pivot center pin */}
                  <circle cx="110" cy="110" r="10" fill="#334155" />
                  <circle cx="110" cy="110" r="4" fill="#ffffff" />

                  {/* Pointing Needle */}
                  {(() => {
                    const rawRatio = cumulativeGpa / 4.0;
                    const ratio = isNaN(rawRatio) || !isFinite(rawRatio) ? 0 : Math.min(1, Math.max(0, rawRatio));
                    const angle = Math.PI - (ratio * Math.PI);
                    const tipX = 110 + 72 * Math.cos(angle);
                    const tipY = 110 - 72 * Math.sin(angle);
                    return (
                      <line x1="110" y1="110" x2={tipX} y2={tipY} stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
                    );
                  })()}

                  <text x="30" y="117" className="text-[10px] fill-slate-400 font-mono font-bold" textAnchor="middle">0.0</text>
                  <text x="190" y="117" className="text-[10px] fill-slate-400 font-mono font-bold" textAnchor="middle">{profile.gpaScale.toFixed(1)}</text>
                </svg>

                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="text-xl font-bold font-headline text-slate-800">{scaledCumulativeGpa.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 font-semibold font-sans uppercase">Cumulative GPA</span>
                </div>
              </div>

              {/* Status and feedback commentary layout */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                  <h4 className="font-bold text-sm text-slate-900 font-headline">GPA Goal Progression</h4>
                </div>
                <div className="space-y-1 text-xs text-slate-600 font-sans leading-relaxed">
                  <p>
                    Your current GPA is <span className="font-bold text-slate-800">{scaledCumulativeGpa.toFixed(2)}</span>, compared with your goal of <span className="font-semibold text-indigo-600">{profile.targetGpa.toFixed(2)}</span>.
                  </p>
                  <div>
                    {scaledCumulativeGpa >= profile.targetGpa ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1.5 w-fit mt-2">
                        <CheckCircle size={14} /> Goal Acceeded! Excellent job matching your desired targets.
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1.5 w-fit mt-2">
                        <AlertCircle size={14} /> You are {Math.abs(profile.targetGpa - scaledCumulativeGpa).toFixed(2)} points short of your Target GPA. Keep pushing!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>


      {/* Main Dashboard Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Classes and Assignments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Classes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-headline text-slate-900">Current Semester Enrolled Courses ({currentSubjects.length})</h3>
              <button 
                onClick={() => setActiveView('Subjects')} 
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                id="view-all-subjects"
              >
                <span>Manage Enrolled Courses</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {currentSubjects.length === 0 ? (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-8 text-center text-slate-500">
                <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="font-sans text-sm">No courses enrolled list for this semester.</p>
                <button
                  onClick={() => setActiveView('Subjects')}
                  className="mt-3 inline-flex items-center gap-1 bg-blue-600 text-white rounded-lg text-xs font-semibold px-3 py-1.5 hover:bg-blue-700"
                >
                  <Plus size={14} /> Enrolled a Course Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentSubjects.map((subject) => {
                  const colorConfig = getColorConfig(subject.color);
                  // Calculate average progress score of graded assignments for this class
                  const classAssignments = assignments.filter(a => a.subjectId === subject.id);
                  const graded = classAssignments.filter(a => a.status === 'Graded');
                  const assignmentScorePercent = graded.length > 0 
                    ? Math.round(graded.reduce((sum, current) => sum + ((current.score || 0) / current.maxScore) * 100, 0) / graded.length) 
                    : null;

                  return (
                    <div 
                      key={subject.id} 
                      className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors group relative overflow-hidden`}
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: colorConfig.hex }} />
                      
                      <div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase">{subject.code}</span>
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${colorConfig.bg}`}>
                            {subject.credits} Credits
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1 pl-2 font-headline">{subject.name}</h4>
                        <p className="text-[11px] text-slate-500 mb-4 pl-2 font-sans">Prof: {subject.professorName || 'TBA'}</p>
                      </div>

                      <div className="border-t border-slate-50 pt-3 mt-2 pl-2">
                        <div className="flex justify-between text-xs text-slate-500 font-sans mb-1.5">
                          <span>Recent Grades</span>
                          <span className="font-semibold text-slate-700">
                            {assignmentScorePercent !== null ? `${assignmentScorePercent}% Average` : 'No scores yet'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${assignmentScorePercent !== null ? assignmentScorePercent : 0}%`,
                              backgroundColor: colorConfig.hex
                            }} 
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3 text-[11px] text-slate-400">
                          <span>Target: {subject.targetGrade}</span>
                          <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase text-slate-600">
                            Status: {subject.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Task Checklist */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-headline text-slate-950">Pending Academic Tasks</h3>
                <p className="text-xs text-slate-400">Quick status check: click the target icon or checkbox to advance the status</p>
              </div>
              <button 
                onClick={onAddAssignmentQuick}
                className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold px-3 py-1.5"
                id="quick-add-task"
              >
                <Plus size={14} /> Add Task
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle className="mx-auto text-emerald-300 mb-2" size={32} />
                <p className="font-sans text-xs">Fantastic job! All current Assignments have been completed & graded.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingAssignments.slice(0, 5).map((task) => {
                  const linkedSubject = subjects.find(s => s.id === task.subjectId);
                  const colorConfig = linkedSubject ? getColorConfig(linkedSubject.color) : SUBJECT_COLORS[0];
                  
                  return (
                    <div 
                      key={task.id}
                      className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Checkbox button toggler */}
                        <button 
                          onClick={() => onQuickToggleAssignment(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                            task.status === 'Submitted' 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 text-transparent'
                          }`}
                          title={`Toggle status to ${task.status === 'Pending' ? 'Submitted' : 'Graded'}`}
                        >
                          {task.status === 'Submitted' ? (
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-0 hover:opacity-100" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate font-sans">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{linkedSubject?.code || 'GEN'}</span>
                            <span className="text-[10px] text-slate-400 font-medium font-sans">
                              Due: {formatDateSimple(task.dueDate)}
                            </span>
                            {task.priority && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider font-sans ${
                                task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-sans uppercase tracking-wider ${
                          task.status === 'Submitted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700 font-medium'
                        }`}>
                          {task.status}
                        </span>
                        
                        {/* Quick state incrementer button */}
                        <button
                          onClick={() => onQuickToggleAssignment(task.id)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Advance state (Pending -> Submitted -> Graded)"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {pendingAssignments.length > 5 && (
                  <button 
                    onClick={() => setActiveView('Assignments')}
                    className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-semibold py-2 block border border-dashed border-slate-200 hover:border-slate-300 rounded-xl mt-2 transition-colors font-sans"
                    id="view-remaining-assignments"
                  >
                    View remaining {pendingAssignments.length - 5} tasks
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Tab: Exam Countdown & Schedule */}
        <div className="space-y-8">
          
          {/* Exam Countdown List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-headline text-slate-950 flex items-center gap-1.5">
                <GraduationCap className="text-indigo-600" size={20} />
                <span>Upcoming Exams</span>
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">
                {upcomingExams.length} Left
              </span>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle className="mx-auto text-emerald-300 mb-2" size={32} />
                <p className="font-sans text-xs">No exams scheduled currently! Take a breath.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingExams.slice(0, 3).map((exam) => {
                  const linkedSubject = subjects.find(s => s.id === exam.subjectId);
                  const colorConfig = linkedSubject ? getColorConfig(linkedSubject.color) : SUBJECT_COLORS[0];
                  
                  // Compute simple countdown in days
                  const examDate = new Date(exam.dateTime);
                  const today = new Date();
                  const diffTime = examDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={exam.id}
                      className="group p-4 rounded-xl border border-slate-100/80 bg-slate-50/30 hover:border-slate-200 hover:bg-white hover:shadow-xs transition-all relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 w-1 h-full" style={{ backgroundColor: colorConfig.hex }} />
                      
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-slate-600 uppercase">
                          {linkedSubject?.code || 'GEN'}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          diffDays <= 3 ? 'bg-red-50 text-red-600 animate-pulse' :
                          diffDays <= 7 ? 'bg-amber-50 text-amber-600' :
                          'bg-indigo-50 text-indigo-700'
                        }`}>
                          {diffDays <= 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow!' : `in ${diffDays} days`}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors py-0.5 font-sans leading-snug">
                        {exam.title}
                      </h4>

                      <div className="flex flex-col gap-1 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 font-sans">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formatDateTimeSafe(exam.dateTime)}</span>
                        </div>
                        {exam.room && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[10px] uppercase text-slate-400 bg-slate-100 px-1 rounded">Room</span>
                            <span>{exam.room}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">
                          Note: {exam.notes || 'No special prep directions uploaded.'}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button 
                  onClick={() => setActiveView('Exams')}
                  className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-bold font-sans py-2"
                >
                  Go to Exams Center &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Quick Schedule Overview widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="text-md font-bold font-headline text-slate-950 flex items-center gap-1.5">
              <Clock className="text-blue-600" size={18} />
              <span>Weekly Class Schedule</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {currentSubjects.map((sub) => (
                <div key={sub.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{sub.code}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{sub.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">{sub.schedule || 'Online/TBA'}</p>
                    <p className="text-[10px] text-slate-400">{sub.room || 'No Room Assigned'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
