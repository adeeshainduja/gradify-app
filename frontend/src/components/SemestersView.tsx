import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  BookOpen,
  Award,
  PlusCircle,
  HelpCircle,
  Search,
  Archive,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { Semester, Subject } from '../types';

interface SemestersViewProps {
  semesters: Semester[];
  subjects: Subject[];
  currentSemesterId: string;
  setCurrentSemesterId: (id: string) => void;
  onAddSemester: (
    name: string, 
    duration: string, 
    totalCredits: number, 
    expectedSgpa: number, 
    status: 'completed' | 'active' | 'upcoming',
    academicYear?: string,
    startDate?: string,
    endDate?: string
  ) => void;
  onDeleteSemester: (id: string) => void;
  onUpdateSemester: (sem: Semester) => void;
  setActiveTab: (tab: string) => void;
}

export const SemestersView: React.FC<SemestersViewProps> = ({
  semesters,
  subjects,
  currentSemesterId,
  setCurrentSemesterId,
  onAddSemester,
  onDeleteSemester,
  onUpdateSemester,
  setActiveTab
}) => {
  // Page filters & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modals & form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  // Form input states
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formStartDate, setFormStartDate] = useState('2024-02-01');
  const [formEndDate, setFormEndDate] = useState('2024-06-30');
  const [formStatus, setFormStatus] = useState<'completed' | 'active' | 'upcoming'>('upcoming');
  const [formCredits, setFormCredits] = useState(15);
  const [formSgpa, setFormSgpa] = useState(3.8);

  // Selected semester details panel tracker
  // Defaults to current active context index if valid
  const nonArchivedSemesters = semesters.filter(s => !s.isArchived);
  const [selectedSemId, setSelectedSemId] = useState<string>(() => {
    return currentSemesterId || (nonArchivedSemesters[0]?.id || '');
  });

  // Calculate GPA points helper
  const getGpaPoints = (score: number) => {
    if (score >= 93) return 4.0;
    if (score >= 90) return 3.7;
    if (score >= 87) return 3.3;
    if (score >= 83) return 3.0;
    if (score >= 80) return 2.7;
    if (score >= 77) return 2.3;
    if (score >= 73) return 2.0;
    if (score >= 70) return 1.7;
    return 1.4;
  };

  // Safe fetch helper for selected semester
  const selectedSem = semesters.find(s => s.id === selectedSemId) || semesters.find(s => !s.isArchived) || semesters[0];
  const selectedSemSubjects = selectedSem ? subjects.filter(sub => sub.semesterId === selectedSem.id) : [];

  // Submit adding new semester
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    // Build human-friendly duration text (e.g. Feb 2024 - Jun 2024)
    const formatMonthYear = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    const humanDuration = `${formatMonthYear(formStartDate)} - ${formatMonthYear(formEndDate)}`;

    onAddSemester(
      formName,
      humanDuration,
      formCredits,
      formSgpa,
      formStatus,
      formYear,
      formStartDate,
      formEndDate
    );

    // Reset fields
    setFormName('');
    setFormYear('2024');
    setFormStartDate('2024-02-01');
    setFormEndDate('2024-06-30');
    setFormStatus('upcoming');
    setFormCredits(15);
    setFormSgpa(3.8);
    setShowAddModal(false);
  };

  // Trigger editing form
  const triggerEdit = (sem: Semester) => {
    setEditingSemester(sem);
    setFormName(sem.name);
    setFormYear(sem.academicYear || '2024');
    setFormStartDate(sem.startDate || '2024-02-01');
    setFormEndDate(sem.endDate || '2024-06-30');
    setFormStatus(sem.status);
    setFormCredits(sem.totalCredits);
    setFormSgpa(sem.sgpa);
    setShowEditModal(true);
  };

  // Submit edited semester
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSemester) return;

    const formatMonthYear = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    const humanDuration = `${formatMonthYear(formStartDate)} - ${formatMonthYear(formEndDate)}`;

    const updated: Semester = {
      ...editingSemester,
      name: formName,
      academicYear: formYear,
      startDate: formStartDate,
      endDate: formEndDate,
      duration: humanDuration,
      status: formStatus,
      totalCredits: formCredits,
      sgpa: formSgpa,
      completionRate: formStatus === 'completed' ? 100 : formStatus === 'active' ? 70 : 0
    };

    onUpdateSemester(updated);
    setShowEditModal(false);
    setEditingSemester(null);
  };

  // Archive semester trigger
  const handleArchiveToggle = (sem: Semester) => {
    const updated: Semester = {
      ...sem,
      isArchived: !sem.isArchived
    };
    onUpdateSemester(updated);
  };

  // Filter semesters
  const visibleSemesters = semesters.filter(sem => {
    // Search query constraint
    const matchesSearch = sem.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (sem.academicYear && sem.academicYear.includes(searchQuery));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || sem.status === statusFilter;

    // Year filter
    const semYear = sem.academicYear || sem.duration.split(' ').pop() || '';
    const matchesYear = yearFilter === 'all' || semYear === yearFilter;

    // Archive visibility
    const matchesArchive = showArchived ? sem.isArchived : !sem.isArchived;

    return matchesSearch && matchesStatus && matchesYear && matchesArchive;
  });

  // Unique list of years for filter dropdown
  const availableYears = Array.from(new Set(semesters.map(s => s.academicYear || s.duration.split(' ').pop() || ''))).filter(Boolean).sort();

  // CGPA calculations from completed terms
  const completedTermsList = semesters.filter(s => s.status === 'completed' && !s.isArchived);
  const calculatedCgpaValue = completedTermsList.length > 0 
    ? completedTermsList.reduce((sum, s) => sum + s.sgpa, 0) / completedTermsList.length 
    : 3.72;

  // Credits Earned calculation
  const totalCreditsEarned = semesters
    .filter(s => !s.isArchived && (s.status === 'completed' || s.status === 'active'))
    .reduce((sum, s) => sum + (s.status === 'completed' ? s.totalCredits : s.creditsEarned), 0);

  // Active / current semester object name helper
  const activeSemesterObj = semesters.find(s => s.status === 'active' && !s.isArchived);

  // --- Analytics parameters ---
  // GPA trend variables sorted chronologically
  const sortedGPAChronology = [...semesters]
    .filter(s => !s.isArchived)
    .sort((a, b) => a.id.localeCompare(b.id));

  // Credits allocation donut computation helpers
  const plannedCreditsByStatus = semesters.filter(s => !s.isArchived).reduce((acc, sem) => {
    acc[sem.status] = (acc[sem.status] || 0) + sem.totalCredits;
    return acc;
  }, {} as Record<string, number>);

  const completedCount = plannedCreditsByStatus['completed'] || 0;
  const activeCount = plannedCreditsByStatus['active'] || 0;
  const upcomingCount = plannedCreditsByStatus['upcoming'] || 0;
  const grandTotalPlanned = completedCount + activeCount + upcomingCount;

  // Performance breakdown
  const activeAllSubjects = subjects.filter(sb => {
    const parentSem = semesters.find(s => s.id === sb.semesterId);
    return parentSem && !parentSem.isArchived;
  });

  const averageOverallScore = activeAllSubjects.length > 0
    ? activeAllSubjects.reduce((sum, s) => sum + s.score, 0) / activeAllSubjects.length
    : 88;

  const bestSubjectObj = activeAllSubjects.length > 0
    ? [...activeAllSubjects].sort((a,b) => b.score - a.score)[0]
    : null;

  const lowestSubjectObj = activeAllSubjects.length > 0
    ? [...activeAllSubjects].sort((a,b) => a.score - b.score)[0]
    : null;

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      
      {/* SaaS Page Title Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm shadow-slate-100/50">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-full border border-primary/20">
            <Layers className="w-3.5 h-3.5" /> Student Success Platform
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Semester Management</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Manage academic semesters, organize subjects, track progress, and monitor GPA performance across your university journey.
          </p>
        </div>
        
        {/* Navigation Action */}
        <button
          id="op-create-semester-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow-md shadow-primary/15 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4 text-white" /> Create Semester
        </button>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Semesters */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Semesters</span>
            <span className="text-2xl font-black font-mono text-slate-900 block mt-1.5">{nonArchivedSemesters.length}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{semesters.filter(s=>s.isArchived).length} archived</span>
          </div>
        </div>

        {/* KPI 2: Active Semester (Current Context) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Current Semester</span>
            <span className="text-base font-black text-slate-900 block mt-2 truncate">
              {activeSemesterObj ? activeSemesterObj.name : "None active"}
            </span>
            <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100/50 mt-1 inline-block">
              {activeSemesterObj ? "Active Status" : "TBD"}
            </span>
          </div>
        </div>

        {/* KPI 3: Overall CGPA */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Overall CGPA</span>
            <span className="text-2xl font-black font-mono text-slate-900 block mt-1.5">{calculatedCgpaValue.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Summed completed semesters</span>
          </div>
        </div>

        {/* KPI 4: Total Credits Earned */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Credits Earned</span>
            <span className="text-2xl font-black font-mono text-slate-900 block mt-1.5">{totalCreditsEarned} Cr</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Of {grandTotalPlanned} planned total</span>
          </div>
        </div>

      </div>

      {/* Advanced Filter and Control Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        
        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search semester..."
            className="w-full bg-slate-50 border border-slate-200/95 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-slate-700"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Academic Year filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">ACADEMIC YEAR:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">All Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Archive Toggle Button */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              showArchived 
                ? 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-xs' 
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? "Viewing Archived" : "Show Archived"}
          </button>

        </div>

      </div>

      {/* Main Double Pane Section: Grid view & Selected Semester Ledger Details pane */}
      {visibleSemesters.length === 0 ? (
        
        /* Empty State Illustration */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-2 relative">
            <Layers className="w-10 h-10 text-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">
              {searchQuery || statusFilter !== 'all' || yearFilter !== 'all'
                ? "No matching semesters found" 
                : "Start your academic journey by creating your first semester."}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Plan ahead your credits, grade expectations, and track semester performance metrics comprehensively to secure academic merit honors.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <PlusCircle className="w-4 h-4" /> Create Semester
            </button>
            <button 
              onClick={() => setActiveTab('subjects')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <BookOpen className="w-4 h-4 text-slate-500" /> Add Subjects
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <TrendingUp className="w-4 h-4 text-slate-500" /> View GPA Analytics
            </button>
          </div>
        </div>

      ) : (
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Semester Cards List Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {visibleSemesters.map((sem) => {
              const isFocused = sem.id === selectedSemId;
              const semSubjects = subjects.filter(sub => sub.semesterId === sem.id);
              
              // Status Styling configs
              const statusColors = {
                completed: {
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                  theme: "border-slate-200 hover:border-slate-300",
                  progress: "bg-emerald-500"
                },
                active: {
                  badge: "bg-primary/10 text-primary border-primary/20",
                  theme: "border-primary/50 ring-2 ring-primary/5",
                  progress: "bg-primary"
                },
                upcoming: {
                  badge: "bg-slate-50 text-slate-500 border-slate-200",
                  theme: "border-slate-200 hover:border-slate-300",
                  progress: "bg-indigo-300"
                }
              }[sem.status] || {
                badge: "bg-slate-50 text-slate-500 border-slate-200",
                theme: "border-slate-200",
                progress: "bg-slate-500"
              };

              // Progress percentage estimation
              const dispPercent = sem.status === 'completed' ? 100 : sem.status === 'active' ? 70 : 0;

              return (
                <div
                  key={sem.id}
                  id={`sem-card-${sem.id}`}
                  onClick={() => setSelectedSemId(sem.id)}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer select-none transition-all relative flex flex-col justify-between ${
                    isFocused 
                      ? 'shadow-md shadow-slate-100 border-primary ring-2 ring-primary/10 bg-gradient-to-tr from-white to-primary/[0.01]' 
                      : 'hover:shadow-sm hover:border-slate-300 shadow-xs'
                  } ${statusColors.theme}`}
                >
                  {/* Top line properties */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                        Academic Year: {sem.academicYear || "2024"}
                      </span>
                      <span className={`text-[9px] font-bold uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${statusColors.badge}`}>
                        {sem.status}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-1.5">
                      {sem.name}
                      {sem.id === currentSemesterId && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Context" />
                      )}
                    </h3>

                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {sem.duration}
                    </p>
                  </div>

                  {/* Indicators stats row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-dashed border-slate-100 my-2 text-center text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium uppercase font-mono tracking-wider">Subjects</span>
                      <strong className="block text-sm text-slate-800 font-black font-mono mt-0.5">{semSubjects.length || sem.subjectsCount || 0}</strong>
                    </div>
                    <div className="border-x border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-medium uppercase font-mono tracking-wider">Credits</span>
                      <strong className="block text-sm text-slate-800 font-black font-mono mt-0.5">{sem.totalCredits} cr</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium uppercase font-mono tracking-wider">
                        {sem.status === 'active' ? 'Current GPA' : 'SGPA'}
                      </span>
                      <strong className="block text-sm text-primary font-bold font-mono mt-0.5">
                        {sem.status === 'upcoming' ? "TBD" : sem.sgpa > 0 ? sem.sgpa.toFixed(2) : "3.80"}
                      </strong>
                    </div>
                  </div>

                  {/* Completion Progress bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-mono uppercase tracking-wider font-semibold">Completion rate</span>
                      <span className="font-bold text-slate-700 font-mono">{dispPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${statusColors.progress}`}
                        style={{ width: `${dispPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons inside Card */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-1.5">
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSemId(sem.id);
                      }}
                      className="text-[10px] font-extrabold text-primary hover:bg-primary/5 py-1.5 px-2.5 rounded-lg flex items-center gap-0.5 transition-colors"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerEdit(sem);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-100 transition-all"
                        title="Edit properties"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveToggle(sem);
                        }}
                        className="text-[10px] text-slate-400 hover:text-yellow-600 hover:bg-yellow-50/70 p-1.5 rounded-lg border border-slate-100 transition-all"
                        title={sem.isArchived ? "Restore to active list" : "Archive Semester"}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {sem.id !== 'sem-5' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you absolutely sure you want to delete ${sem.name}?`)) {
                              onDeleteSemester(sem.id);
                            }
                          }}
                          className="text-[10px] text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg border border-slate-100 transition-all"
                          title="Delete Semester permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Right Column: Sticky Semester Details Pane */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            
            <div id="semester-details-pane-wrapper" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              
              {/* Header Title */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Semester Details Panel</h3>
                  <p className="text-[11px] text-slate-400 font-semibold font-mono uppercase mt-0.5">Focus: {selectedSem ? selectedSem.name : "None selected"}</p>
                </div>
                {selectedSem && selectedSem.id === currentSemesterId && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full animate-pulse">
                    Active Context Focus
                  </span>
                )}
              </div>

              {selectedSem ? (
                <>
                  {/* Semester Information */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Semester Information</h4>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3 text-xs">
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Semester Name</span>
                        <strong className="text-slate-800 font-bold">{selectedSem.name}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Academic Year</span>
                        <strong className="text-slate-800 font-mono font-bold">{selectedSem.academicYear || selectedSem.duration.split(' ').pop()}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Start Date</span>
                        <strong className="text-slate-800 font-mono font-bold">
                          {selectedSem.startDate ? new Date(selectedSem.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : "Sep 1, 2021"}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">End Date</span>
                        <strong className="text-slate-800 font-mono font-bold font-mono">
                          {selectedSem.endDate ? new Date(selectedSem.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : "Jan 15, 2022"}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Status</span>
                        <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded border ${
                          selectedSem.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          selectedSem.status === 'active' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {selectedSem.status}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Academic Statistics */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Academic Statistics</h4>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 font-medium">TOTAL SUBJECTS</span>
                        <strong className="text-base font-black text-slate-800 font-mono mt-0.5 block">{selectedSemSubjects.length || selectedSem.subjectsCount || 0} Courses</strong>
                      </div>

                      <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 font-medium">CREDITS MET</span>
                        <strong className="text-base font-black text-slate-800 font-mono mt-0.5 block">{selectedSem.totalCredits} Credits</strong>
                      </div>

                      <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 font-medium">SEMESTER GPA</span>
                        <strong className="text-base font-black text-primary font-mono mt-0.5 block">
                          {selectedSem.status === 'upcoming' ? "TBD" : selectedSem.sgpa > 0 ? selectedSem.sgpa.toFixed(2) : "3.75"}
                        </strong>
                      </div>

                      <div className="border border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase font-mono tracking-wider">CGPA EFFECT</span>
                        <strong className="text-[11px] font-bold text-emerald-600 mt-1 block">
                          {selectedSem.status === 'upcoming' ? "No weight" : `Weight contribution +${(selectedSem.sgpa / 6).toFixed(3)}`}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Subjects Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Subjects List Table</h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 font-bold">Grades Locked</span>
                    </div>

                    {selectedSemSubjects.length === 0 ? (
                      <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/40">
                        <BookOpen className="w-6 h-6 mx-auto text-slate-300 mb-1.5" />
                        <p className="text-[11px]">No subjects registered in this semester.</p>
                        <button
                          onClick={() => {
                            setCurrentSemesterId(selectedSem.id);
                            setActiveTab('subjects');
                          }}
                          className="text-[10px] text-primary font-bold hover:underline mt-1 capitalize block mx-auto"
                        >
                          + Bind first course
                        </button>
                      </div>
                    ) : (
                      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[9px] font-bold text-slate-400 font-mono tracking-wider border-b border-slate-200">
                              <th className="py-2 px-3">CODE</th>
                              <th className="py-2 px-1">NAME</th>
                              <th className="py-2 px-1 text-center">CR</th>
                              <th className="py-2 px-2 text-center">PTS</th>
                              <th className="py-2 px-3 text-center">GR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {selectedSemSubjects.map((sub) => {
                              const points = getGpaPoints(sub.score);
                              return (
                                <tr key={sub.id} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-mono font-bold text-slate-500 uppercase">{sub.code}</td>
                                  <td className="py-2.5 px-1 font-bold text-slate-700 truncate max-w-[100px]" title={sub.name}>{sub.name}</td>
                                  <td className="py-2.5 px-1 font-mono text-center text-slate-500">{sub.credits}</td>
                                  <td className="py-2.5 px-2 font-mono text-center text-slate-400 font-bold">{points.toFixed(1)}</td>
                                  <td className="py-2.5 px-3 text-center font-bold">
                                    <span className={`inline-block px-1.5 py-0.2 select-none border rounded font-mono text-[10px] ${
                                      sub.grade.startsWith('A') 
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                        : 'bg-indigo-50 text-indigo-800 border-indigo-100'
                                    }`}>
                                      {sub.grade}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  Please select or focus a semester card on the left grid.
                </div>
              )}

            </div>

          </div>

        </div>

      )}

      {/* Analytics Section: GPA Chart Line & Credits Allocation Donut */}
      {visibleSemesters.length > 0 && (
        <div id="analytics-section-panel" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-secondary" /> Unified Academic Analytics Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Evaluated performance diagnostics across all historical metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* GPA line trend comparison */}
            <div className="md:col-span-8 p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Semester GPA Trend</h4>
                  <p className="text-[10px] text-slate-400 mt-0.2">Historic & forecasted SGPA milestones mapped</p>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full font-bold">
                  Sustained Scholarship: Active
                </span>
              </div>

              {/* Line chart SVG wrapper */}
              <div className="relative pt-6">
                {sortedGPAChronology.length > 0 ? (
                  <svg viewBox="0 0 540 160" className="w-full h-40 overflow-visible">
                    <defs>
                      <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0058be" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0058be" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y scale reference guidelines */}
                    <line x1="0" y1="120" x2="540" y2="120" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="0" y1="80" x2="540" y2="80" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="0" y1="40" x2="540" y2="40" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />

                    <text x="-8" y="123" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">3.4</text>
                    <text x="-8" y="83" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">3.6</text>
                    <text x="-8" y="43" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">3.8</text>
                    <text x="-8" y="10" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">4.0</text>

                    {/* Target reference line */}
                    <line x1="0" y1="40" x2="540" y2="40" stroke="#10b981" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.8" />
                    <text x="535" y="32" textAnchor="end" fill="#10b981" className="text-[8px] font-bold font-mono">SCHOLARSHIP MIN (3.80)</text>

                    {/* Generate Coordinates */}
                    {(() => {
                      const points = sortedGPAChronology.map((sem, idx) => {
                        const score = sem.status === 'upcoming' ? 3.80 : sem.sgpa || 3.80;
                        const x = 30 + idx * ((540 - 64) / Math.max(1, sortedGPAChronology.length - 1));
                        const y = 160 - ((score - 3.20) * 200); // map coordinate system
                        return { x, y, score, name: sem.name };
                      });

                      const pathD = points.length > 0 
                        ? `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') 
                        : '';

                      const fillD = points.length > 0
                        ? `${pathD} L ${points[points.length - 1].x},160 L ${points[0].x},160 Z`
                        : '';

                      return (
                        <g>
                          {/* Shaded Area fill */}
                          {fillD && <path d={fillD} fill="url(#gpaGrad)" />}

                          {/* SVG Stroke line */}
                          {pathD && <path d={pathD} fill="none" stroke="#2170e4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                          {/* Coordinates points */}
                          {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="4" 
                                fill="#ffffff" 
                                stroke="#0058be" 
                                strokeWidth="2.2" 
                                className="transition-all hover:r-6"
                              />
                              <text 
                                x={p.x} 
                                y={p.y - 12} 
                                textAnchor="middle" 
                                fill="#0b1c30" 
                                className="text-[9px] font-bold font-mono bg-white select-none pointer-events-none"
                              >
                                {p.score.toFixed(2)}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">No trend coordinates available.</div>
                )}

                {/* X axis labels */}
                <div className="flex justify-between pl-7 pr-3 pt-2.5 border-t border-slate-200/60 text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest leading-none">
                  {sortedGPAChronology.map((sem, i) => (
                    <div key={sem.id} className="text-center max-w-[65px] truncate">{sem.name.replace("Semester ", "Sem ")}</div>
                  ))}
                </div>
              </div>

            </div>

            {/* Donut Chart and parameters right column */}
            <div className="md:col-span-4 p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col justify-between">
              
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Credits Distribution</h4>
                <p className="text-[10px] text-slate-400 mt-0.2">Planned total academic workload context</p>
              </div>

              {/* Custom SVG Donut representation */}
              <div className="my-3 flex items-center justify-center relative">
                <svg width="110" height="110" className="transform -rotate-90">
                  <circle cx="55" cy="55" r="42" stroke="#cbd5e1" strokeWidth="9" fill="transparent" opacity="0.2" />
                  {(() => {
                    const radius = 42;
                    const circumference = 2 * Math.PI * radius;
                    
                    const compFract = grandTotalPlanned > 0 ? (completedCount / grandTotalPlanned) : 0.6;
                    const activeFract = grandTotalPlanned > 0 ? (activeCount / grandTotalPlanned) : 0.2;
                    const upcomingFract = grandTotalPlanned > 0 ? (upcomingCount / grandTotalPlanned) : 0.2;

                    const compOffset = circumference;
                    const activeOffset = circumference * (1 - compFract);
                    const upcomingOffset = circumference * (1 - compFract - activeFract);

                    return (
                      <g>
                        {/* Completed credits segment */}
                        <circle 
                          cx="55" cy="55" r={radius} 
                          stroke="#10b981" strokeWidth="9" fill="transparent" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={circumference * (1 - compFract)} 
                          strokeLinecap="round" 
                        />
                        {/* Active credits segment */}
                        <circle 
                          cx="55" cy="55" r={radius} 
                          stroke="#0058be" strokeWidth="9" fill="transparent" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={circumference * (1 - activeFract)} 
                          transform={`rotate(${compFract * 360} 55 55)`}
                          strokeLinecap="round" 
                        />
                      </g>
                    );
                  })()}
                </svg>
                <div className="absolute text-center leading-none">
                  <span className="text-xl font-black font-mono text-slate-800">{grandTotalPlanned}</span>
                  <span className="text-[8px] font-bold font-mono text-slate-400 uppercase tracking-widest block mt-1">Cr Total</span>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="grid grid-cols-3 gap-1 pt-2 text-[10px] border-t border-slate-200/50">
                <div className="text-center font-mono">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                  <span className="text-slate-400">Done</span>
                  <strong className="block text-slate-700 font-bold">{completedCount} cr</strong>
                </div>
                <div className="text-center font-mono border-x border-slate-200">
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mr-1"></span>
                  <span className="text-slate-400">Active</span>
                  <strong className="block text-slate-700 font-bold">{activeCount} cr</strong>
                </div>
                <div className="text-center font-mono">
                  <span className="inline-block w-1.5 h-1.5 bg-slate-300 rounded-full mr-1"></span>
                  <span className="text-slate-400">Plan</span>
                  <strong className="block text-slate-700 font-bold">{upcomingCount} cr</strong>
                </div>
              </div>

            </div>

          </div>

          {/* Performance Overview section */}
          <div className="pt-4 border-t border-dashed border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Live Performance Indicators</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Average Grade overall */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-mono">OVERALL RAW GRADE</span>
                  <strong className="text-slate-700 font-bold">{averageOverallScore.toFixed(1)}% Score Average</strong>
                </div>
                <div className="h-8 w-8 rounded bg-primary/10 text-primary font-black font-mono flex items-center justify-center border border-primary/20">
                  A-
                </div>
              </div>

              {/* Best Subject inside coursework */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="text-emerald-600 block font-mono font-bold">★ HIGHEST SCORING</span>
                  <strong className="text-slate-700 font-bold block truncate">{bestSubjectObj ? bestSubjectObj.name : "Database Systems"}</strong>
                </div>
                <div className="shrink-0 h-8 px-2 rounded bg-emerald-50 text-emerald-800 font-black font-mono flex items-center justify-center border border-emerald-200 text-[10px]">
                  {bestSubjectObj ? bestSubjectObj.grade : "A"} ({bestSubjectObj ? bestSubjectObj.score : 93})
                </div>
              </div>

              {/* Lowest Subject inside coursework */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="text-amber-600 block font-mono font-bold">⚠️ LOWEST RUNTIME</span>
                  <strong className="text-slate-700 font-bold block truncate">{lowestSubjectObj ? lowestSubjectObj.name : "Computer Networks"}</strong>
                </div>
                <div className="shrink-0 h-8 px-2 rounded bg-amber-50/70 text-amber-800 font-black font-mono flex items-center justify-center border border-amber-200 text-[10px]">
                  {lowestSubjectObj ? lowestSubjectObj.grade : "B"} ({lowestSubjectObj ? lowestSubjectObj.score : 84})
                </div>
              </div>

              {/* Overall Completion Percentage calculated */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center text-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">TOTAL COMPLETION RATE</span>
                  <strong className="text-slate-700 font-mono font-bold">
                    {Math.round((completedTermsList.length / semesters.filter(s=>!s.isArchived).length) * 100)}%
                  </strong>
                </div>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1 rounded-full" 
                    style={{ width: `${(completedTermsList.length / semesters.filter(s=>!s.isArchived).length) * 100}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* -------------------- CREATE SEMESTER MODAL -------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleCreateSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" /> Create Semester
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Semester Name input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Semester Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Semester 7"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Academic Year select */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Academic Year</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700"
                  >
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>

                {/* Status select option */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700"
                  >
                    <option value="completed">Completed</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Start date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>

                {/* End date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">End Date</label>
                  <input 
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Credits scale */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Credits (Planned / Maximum)</label>
                  <input 
                    type="number"
                    required
                    value={formCredits}
                    onChange={(e) => setFormCredits(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>

                {/* SGPA projections */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SGPA (Outcome / Expectation)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    required
                    value={formSgpa}
                    onChange={(e) => setFormSgpa(parseFloat(e.target.value) || 0.0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                className="px-4.5 py-2 bg-primary hover:bg-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                Save Semester
              </button>
            </div>

          </form>
        </div>
      )}

      {/* -------------------- EDIT SEMESTER MODAL -------------------- */}
      {showEditModal && editingSemester && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" /> Edit Semester Parameters
              </h3>
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Semester Name input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Semester Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Semester 7"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Academic Year select */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Academic Year</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700"
                  >
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>

                {/* Status select option */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700"
                  >
                    <option value="completed">Completed</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Start date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>

                {/* End date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">End Date</label>
                  <input 
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Credits scale */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Credits</label>
                  <input 
                    type="number"
                    required
                    value={formCredits}
                    onChange={(e) => setFormCredits(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>

                {/* SGPA projections */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SGPA Score</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    required
                    value={formSgpa}
                    onChange={(e) => setFormSgpa(parseFloat(e.target.value) || 0.0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:bg-white focus:border-primary text-slate-700 font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                className="px-4.5 py-2 bg-primary hover:bg-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
