import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Sliders, 
  User, 
  GraduationCap, 
  Sparkles, 
  Award,
  BookMarked,
  Layers,
  HelpCircle,
  Search,
  Calendar,
  ChevronDown,
  List,
  Grid3X3,
  Filter,
  ChevronRight,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Shuffle,
  Check,
  Edit2,
  ExternalLink,
  RefreshCw,
  BarChart2,
  TrendingUp,
  PieChart,
  Grid,
  Sparkle
} from 'lucide-react';
import { Subject, Semester } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  semesters: Semester[];
  currentSemesterId: string;
  onAddSubject: (
    code: string, 
    name: string, 
    credits: number, 
    lecturer: string, 
    score: number, 
    status: 'active' | 'completed' | 'upcoming',
    targetSemesterId?: string,
    description?: string
  ) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubjectGrade: (id: string, score: number, grade: string, assignmentsProgress: number, quizzesProgress: number, midExamProgress: number) => void;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setActiveTab: (tab: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  semesters,
  currentSemesterId,
  onAddSubject,
  onDeleteSubject,
  onUpdateSubjectGrade,
  setSubjects,
  setActiveTab
}) => {
  // Page states
  const [layoutMode, setLayoutMode] = useState<'table' | 'grid'>('table');
  const [activeSemesterFilter, setActiveSemesterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  // Multiselect state for Bulk Actions
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [bulkActionTargetSem, setBulkActionTargetSem] = useState<string>('');

  // Modals status
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form input states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formSemesterId, setFormSemesterId] = useState(currentSemesterId);
  const [formCredits, setFormCredits] = useState(3);
  const [formLecturer, setFormLecturer] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'completed' | 'active' | 'upcoming'>('active');
  const [formScore, setFormScore] = useState(88);

  // Custom interactive transient state feedback (toast alerts) override alert()
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Helpers to translate score directly
  const calculateGradeFromScore = (val: number): { letter: string; gpaPoint: number; indicator: string; colorClass: string } => {
    if (val >= 93) return { letter: 'A', gpaPoint: 4.0, indicator: 'Exceptional Performance', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val >= 90) return { letter: 'A-', gpaPoint: 3.7, indicator: 'Excellent Achievement', colorClass: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (val >= 87) return { letter: 'B+', gpaPoint: 3.3, indicator: 'Very Good Standard', colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (val >= 83) return { letter: 'B', gpaPoint: 3.0, indicator: 'Good Competency', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (val >= 80) return { letter: 'B-', gpaPoint: 2.7, indicator: 'Above Average Core', colorClass: 'text-purple-700 bg-purple-50 border-purple-200' };
    if (val >= 77) return { letter: 'C+', gpaPoint: 2.3, indicator: 'Moderate Credency', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val >= 70) return { letter: 'C', gpaPoint: 2.0, indicator: 'Basic Passing Limit', colorClass: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { letter: 'F', gpaPoint: 0.0, indicator: 'Needs Immediate Review', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  // Live filtered subjects calculation
  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSemester = activeSemesterFilter === 'all' || sub.semesterId === activeSemesterFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesSemester && matchesStatus;
  });

  // KPI Calculations (Live Based on selection / overall)
  const totalFilteredCount = filteredSubjects.length;
  
  // Total Credits of current selection
  const totalFilteredCredits = filteredSubjects.reduce((acc, curr) => acc + curr.credits, 0);

  // Average Grade Score
  const averageFilteredScore = filteredSubjects.length > 0
    ? Math.round(filteredSubjects.reduce((acc, curr) => acc + curr.score, 0) / filteredSubjects.length)
    : 85;

  const averageGradeLetter = calculateGradeFromScore(averageFilteredScore).letter;

  // Current GPA points average
  const currentGPAValue = filteredSubjects.length > 0
    ? filteredSubjects.reduce((acc, curr) => acc + calculateGradeFromScore(curr.score).gpaPoint, 0) / filteredSubjects.length
    : 3.72;

  // Selected subject helper
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || filteredSubjects[0] || subjects[0];

  // Multiselect toggle helper
  const handleToggleSelectSubject = (id: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedSubjectIds.length === filteredSubjects.length) {
      setSelectedSubjectIds([]);
    } else {
      setSelectedSubjectIds(filteredSubjects.map(s => s.id));
    }
  };

  // Slider change simulation with math calculation
  const handleUpdateSlider = (
    subId: string, 
    type: 'assignments' | 'quizzes' | 'midExam', 
    value: number,
    currentSubject: Subject
  ) => {
    const nextWeights = {
      assignments: type === 'assignments' ? value : currentSubject.assignmentsProgress || 80,
      quizzes: type === 'quizzes' ? value : currentSubject.quizzesProgress || 80,
      midExam: type === 'midExam' ? value : currentSubject.midExamProgress || 80,
    };

    // Simulated weighted score (Assignments 35%, Quizzes 25%, Midterm/Exam 40%)
    const simulatedScore = Math.min(100, Math.round(
      (nextWeights.assignments * 0.35) + 
      (nextWeights.quizzes * 0.25) + 
      (nextWeights.midExam * 0.40)
    ));

    const { letter } = calculateGradeFromScore(simulatedScore);
    onUpdateSubjectGrade(subId, simulatedScore, letter, nextWeights.assignments, nextWeights.quizzes, nextWeights.midExam);
  };

  // Handle open add subject modal
  const handleOpenAddModal = () => {
    setFormCode('');
    setFormName('');
    setFormSemesterId(currentSemesterId || semesters[0]?.id || 'sem-5');
    setFormCredits(3);
    setFormLecturer('');
    setFormDescription('');
    setFormStatus('active');
    setFormScore(88);
    setShowAddModal(true);
  };

  // Submit adding new subject
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formLecturer) return;

    onAddSubject(
      formCode,
      formName,
      formCredits,
      formLecturer,
      formScore,
      formStatus,
      formSemesterId,
      formDescription
    );

    setShowAddModal(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setFormCode(sub.code);
    setFormName(sub.name);
    setFormSemesterId(sub.semesterId);
    setFormCredits(sub.credits);
    setFormLecturer(sub.lecturer);
    setFormDescription(sub.description || '');
    setFormStatus(sub.status);
    setFormScore(sub.score);
    setShowEditModal(true);
  };

  // Save edited subject
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const { letter } = calculateGradeFromScore(formScore);

    setSubjects(prev => prev.map(s => {
      if (s.id === editingSubject.id) {
        return {
          ...s,
          code: formCode,
          name: formName,
          semesterId: formSemesterId,
          credits: formCredits,
          lecturer: formLecturer,
          description: formDescription,
          status: formStatus,
          score: formScore,
          grade: letter
        };
      }
      return s;
    }));

    setShowEditModal(false);
    setEditingSubject(null);
  };

  // Delete single subject helper
  const handleDeleteSingle = (id: string) => {
    if (confirm("Are you sure you want to remove this academic track subject permanently?")) {
      onDeleteSubject(id);
      if (selectedSubjectId === id) setSelectedSubjectId('');
    }
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (selectedSubjectIds.length === 0) return;
    if (confirm(`Are you absolutely sure you want to delete all ${selectedSubjectIds.length} selected subjects?`)) {
      setSubjects(prev => prev.filter(s => !selectedSubjectIds.includes(s.id)));
      setSelectedSubjectIds([]);
    }
  };

  const handleBulkAssignSemester = () => {
    if (selectedSubjectIds.length === 0 || !bulkActionTargetSem) return;
    setSubjects(prev => prev.map(s => {
      if (selectedSubjectIds.includes(s.id)) {
        return { ...s, semesterId: bulkActionTargetSem };
      }
      return s;
    }));
    triggerToast(`Successfully transferred ${selectedSubjectIds.length} subjects to ${semesters.find(sm => sm.id === bulkActionTargetSem)?.name}!`);
    setSelectedSubjectIds([]);
    setBulkActionTargetSem('');
  };

  const handleBulkExport = () => {
    const subjectsToExport = subjects.filter(s => selectedSubjectIds.length === 0 || selectedSubjectIds.includes(s.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subjectsToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `academic_subjects_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleBulkImportSample = () => {
    const samplePack: Subject[] = [
      {
        id: `sub-sample-1-${Date.now()}`,
        code: "SE420",
        name: "Cloud-Native Infrastructure & DevOps",
        credits: 4,
        lecturer: "Dr. Rachel Green",
        grade: "A",
        score: 95,
        progress: 100,
        status: "completed",
        semesterId: currentSemesterId || semesters[0]?.id || "sem-5",
        assignmentsProgress: 96,
        quizzesProgress: 94,
        midExamProgress: 95,
        description: "Focuses on microservice deployment pipelines, continuous integration, configuration management, and Kubernetes container scaling configurations."
      },
      {
        id: `sub-sample-2-${Date.now()}`,
        code: "CS360",
        name: "Artificial Intelligence Principles",
        credits: 3,
        lecturer: "Prof. Arthur Shelby",
        grade: "B+",
        score: 87,
        progress: 75,
        status: "active",
        semesterId: currentSemesterId || semesters[1]?.id || "sem-5",
        assignmentsProgress: 90,
        quizzesProgress: 75,
        midExamProgress: 88,
        description: "Introduces heuristic search algorithms, first-order logic systems, probabilistic game theory planning and introductory deep multi-layer models."
      },
      {
        id: `sub-sample-3-${Date.now()}`,
        code: "SE311",
        name: "Interactive UX/UI Studio",
        credits: 3,
        lecturer: "Dr. Evelyn Miller",
        grade: "A-",
        score: 91,
        progress: 90,
        status: "active",
        semesterId: currentSemesterId || semesters[0]?.id || "sem-5",
        assignmentsProgress: 93,
        quizzesProgress: 85,
        midExamProgress: 92,
        description: "Core principles of user centered interaction design, low and high fidelity system prototyping, usability testing diagnostics, and responsive SaaS wireframing."
      }
    ];

    setSubjects(prev => [...prev, ...samplePack]);
    triggerToast("Injected 3 premium academic subjects into your database!");
  };

  // Analytics helper calculations
  // 1. Grade Distribution counts (A/A-, B+/B/B-, C+/C/C-, F)
  let countA = 0;
  let countB = 0;
  let countC = 0;
  let countF = 0;

  subjects.forEach(s => {
    if (s.grade.startsWith('A')) countA++;
    else if (s.grade.startsWith('B')) countB++;
    else if (s.grade.startsWith('C')) countC++;
    else countF++;
  });

  const totalSubjectsCount = subjects.length || 1;
  const gradePercentages = {
    A: Math.round((countA / totalSubjectsCount) * 100),
    B: Math.round((countB / totalSubjectsCount) * 100),
    C: Math.round((countC / totalSubjectsCount) * 105), // slightly padded for UI representation
    F: Math.round((countF / totalSubjectsCount) * 100),
  };

  // 2. Credits distribution categorization (4 credits, 3 credits, Other range)
  let creds4 = 0;
  let creds3 = 0;
  let credsOther = 0;

  subjects.forEach(s => {
    if (s.credits === 4) creds4++;
    else if (s.credits === 3) creds3++;
    else credsOther++;
  });

  // Top 5 Performing Subjects
  const topPerformingSubjects = [...subjects]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Lowest Performing Subjects needing improvement (score < 84)
  const lowestPerformingSubjects = [...subjects]
    .filter(s => s.status !== 'upcoming')
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return (
    <div className="space-y-6 text-slate-800 font-sans animate-fade-in">
      
      {/* SaaS Page Custom Header Breadcrumb Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm shadow-slate-100/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-50" /> Student Success Platform
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subject Management</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Manage academic subjects, monitor grades, track credits, and analyze subject performance throughout your degree program.
          </p>
        </div>
        
        {/* Top Control Action */}
        <button
          id="op-add-subject-modal"
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow-md shadow-primary/15 flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4 text-white" /> Add Subject
        </button>
      </div>

      {/* Dynamic Summary Cards widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Total Subjects */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Subjects</span>
            <span className="text-xl font-black font-mono text-slate-900 block mt-1.5">{subjects.length} Registered</span>
            <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{totalFilteredCount} currently in filter</span>
          </div>
        </div>

        {/* Widget 2: Total Credits */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Credits</span>
            <span className="text-xl font-black font-mono text-slate-900 block mt-1.5">
              {subjects.reduce((sum, s) => sum + s.credits, 0)} Credits
            </span>
            <span className="text-[10px] text-purple-600 font-extrabold bg-purple-50/70 px-1.5 py-0.2 rounded border border-purple-100/50 mt-1 inline-block">
              {totalFilteredCredits} Credits Filtered
            </span>
          </div>
        </div>

        {/* Widget 3: Average Grade */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Average Grade</span>
            <span className="text-xl font-black font-mono text-slate-900 block mt-1.5">{averageGradeLetter} ({averageFilteredScore}%)</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Weighted selection metrics</span>
          </div>
        </div>

        {/* Widget 4: Current GPA */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Current GPA</span>
            <span className="text-xl font-black font-mono text-slate-900 block mt-1.5">GP {currentGPAValue.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Scale Out of 4.0</span>
          </div>
        </div>

      </div>

      {/* Top Section Search Filters, Layout Switches, and quick triggers */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xs">
        
        {/* Left: Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Field */}
          <div className="relative max-w-xs w-full min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, name, lecturer..."
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700 font-medium animate-fade-in"
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

          {/* Semester Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono font-bold">SEMESTER:</span>
            <select
              value={activeSemesterFilter}
              onChange={(e) => setActiveSemesterFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">All Semesters</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono font-bold">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">Any Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

        </div>

        {/* Right: Layout Modes Toggles & Action Bundles */}
        <div className="flex items-center gap-3 self-end xl:self-auto">
          
          {/* Alternative Layout Toggle Buttons */}
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex items-center">
            
            <button
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ${
                layoutMode === 'table' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table view list"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ${
                layoutMode === 'grid' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Alternative Cards Grid view"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

          </div>

          {/* Show/Print Transcript Report */}
          <button
            onClick={() => setShowReportCard(true)}
            className="bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-[11px] border border-indigo-200 py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Generate print transcript list of subjects"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Academic Transcript</span>
          </button>

        </div>

      </div>

      {/* Bulk Actions Console Section - Only when checkboxes are clicked or optionally displayed */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-700">Bulk Administrator Panel</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {selectedSubjectIds.length > 0 
                ? `${selectedSubjectIds.length} subjects chosen for action below.` 
                : "Select items using list checkboxes to enable bulk transfers & tools."}
            </p>
          </div>
        </div>

        {/* Bulk triggers row */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={handleBulkImportSample}
            className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" /> Import Samples
          </button>

          <button
            onClick={handleBulkExport}
            className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
            title="Export items to offline backup JSON"
          >
            <Download className="w-3.5 h-3.5 text-purple-500" /> Export JSON
          </button>

          {selectedSubjectIds.length > 0 && (
            <>
              {/* Batch assign semester drop dropdown */}
              <div className="bg-white border border-slate-200 rounded-lg py-1 px-3.5 flex items-center text-[11px] text-slate-700 font-bold gap-1.5">
                <span>Assign Semester:</span>
                <select
                  value={bulkActionTargetSem}
                  onChange={(e) => {
                    setBulkActionTargetSem(e.target.value);
                  }}
                  className="bg-transparent outline-none cursor-pointer border-none text-[11px] text-indigo-600 font-black h-full"
                >
                  <option value="">Choose...</option>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                  ))}
                </select>
                {bulkActionTargetSem && (
                  <button 
                    onClick={handleBulkAssignSemester}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Confirm Assignment Change"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Bulk Delete trigger */}
              <button
                onClick={handleBulkDelete}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-extrabold py-1.5 px-3 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedSubjectIds.length})
              </button>
            </>
          )}

        </div>

      </div>

      {/* Double Column content: Subjects table list vs details panel */}
      {filteredSubjects.length === 0 ? (
        
        /* Empty State Illustration */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xs my-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-indigo-50/50 flex items-center justify-center border border-indigo-100 mb-2 relative">
            <BookOpen className="w-10 h-10 text-primary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-100" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-800">No subjects added yet. Start by adding your first academic subject.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Log code descriptors, allocate credit weights, register instructors, and track assignment checkpoints to secure honors GPA.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={handleOpenAddModal}
              className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Add New Subject
            </button>
            <button 
              onClick={() => setActiveTab('assignments')}
              className="bg-slate-50 hover:bg-slate-150 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Sliders className="w-4 h-4 text-slate-500" /> View Assignments
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="bg-slate-50 hover:bg-slate-150 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <TrendingUp className="w-4 h-4 text-slate-500" /> View GPA Analytics
            </button>
            <button 
              onClick={() => setShowReportCard(true)}
              className="bg-slate-50 hover:bg-slate-155 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <FileText className="w-4 h-4 text-slate-400" /> Generate Academic Report
            </button>
          </div>
        </div>

      ) : (
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Main Pane: Selected Layout View */}
          <div className="lg:col-span-8 space-y-4">
            
            {layoutMode === 'table' ? (
              
              /* 1. SUBJECT TABLE VIEW */
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                        <th className="py-3 px-4 w-10 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedSubjectIds.length === filteredSubjects.length && filteredSubjects.length > 0}
                            onChange={handleToggleSelectAll}
                            className="rounded text-indigo-600 focus:ring-indigo-300 h-3.5 w-3.5 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3">CODE</th>
                        <th className="py-3 px-3">SUBJECT NAME</th>
                        <th className="py-3 px-3 text-center">CREDITS</th>
                        <th className="py-3 px-3">LECTURER</th>
                        <th className="py-3 px-3 text-center">GRADE</th>
                        <th className="py-3 px-3 text-center">PROGRESS</th>
                        <th className="py-3 px-3">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredSubjects.map(sub => {
                        const isItemSelected = selectedSubjectIds.includes(sub.id);
                        const isPanelFocused = sub.id === selectedSubjectId;
                        const parentSemName = semesters.find(sm => sm.id === sub.semesterId)?.name || 'Generic Term';
                        
                        // Status styling config inline
                        const statusPillColor = {
                          completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
                          active: "bg-primary/10 text-primary border-primary/20",
                          upcoming: "bg-slate-100 text-slate-500 border-slate-200"
                        }[sub.status] || "bg-slate-100 text-slate-500 border-slate-200";

                        const evaluation = calculateGradeFromScore(sub.score);

                        return (
                          <tr 
                            key={sub.id}
                            className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${
                              isPanelFocused ? 'bg-indigo-50/10' : ''
                            } ${isItemSelected ? 'bg-indigo-50/20' : ''}`}
                            onClick={() => setSelectedSubjectId(sub.id)}
                          >
                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                checked={isItemSelected}
                                onChange={() => handleToggleSelectSubject(sub.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-300 h-3.5 w-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-500 uppercase shrink-0">
                              {sub.code}
                            </td>
                            <td className="py-3.5 px-3 font-extrabold text-slate-800">
                              <div>{sub.name}</div>
                              <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase bg-slate-50 px-1 rounded block mt-0.5 max-w-max">
                                {parentSemName}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-600">
                              {sub.credits}
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-slate-500 italic">
                              {sub.lecturer}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 font-bold font-mono text-[10px] border rounded ${evaluation.colorClass}`}>
                                {sub.grade} ({sub.score}%)
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5 min-w-[70px]">
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-primary h-1.5 rounded-full"
                                    style={{ width: `${sub.status === 'completed' ? 100 : sub.status === 'active' ? (sub.assignmentsProgress || 80) : 0}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold">
                                  {sub.status === 'completed' ? '100%' : `${sub.status === 'active' ? (sub.assignmentsProgress || 80) : '0'}%`}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 capitalize">
                              <span className={`text-[9px] font-bold uppercase tracking-wider font-mono border px-2 py-0.5 rounded-full ${statusPillColor}`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedSubjectId(sub.id)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                                  title="Expand metrics side panel"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(sub)}
                                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded"
                                  title="Edit subject metadata"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSingle(sub.id)}
                                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            ) : (
              
              /* 2. SUBJECT CARDS VIEW (ALTERNATIVE LAYOUT) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSubjects.map(sub => {
                  const isPanelFocused = sub.id === selectedSubjectId;
                  const parentSemName = semesters.find(sm => sm.id === sub.semesterId)?.name || 'Generic Term';
                  const evaluation = calculateGradeFromScore(sub.score);
                  const dispProg = sub.status === 'completed' ? 100 : sub.status === 'active' ? (sub.assignmentsProgress || 85) : 0;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`bg-white rounded-3xl p-5 border cursor-pointer select-none transition-all flex flex-col justify-between relative ${
                        isPanelFocused 
                          ? 'shadow-md ring-2 ring-indigo-500/10 border-indigo-500 bg-gradient-to-tr from-white to-indigo-50/[0.01]' 
                          : 'hover:shadow-sm hover:border-slate-300 shadow-xs border-slate-200'
                      }`}
                    >
                      {/* Checkbox placement inside card */}
                      <div className="absolute top-4 left-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={selectedSubjectIds.includes(sub.id)}
                          onChange={() => handleToggleSelectSubject(sub.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-300 h-3.5 w-3.5 cursor-pointer"
                        />
                      </div>

                      {/* Code line & grade pill */}
                      <div className="pl-6.5 space-y-2">
                        <div className="flex items-center justify-between gap-1 leading-none">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">
                            {sub.code} • {sub.credits} Credits
                          </span>
                          
                          <span className={`text-[10px] shrink-0 font-extrabold font-mono border px-2 py-0.5 rounded-full uppercase ${
                            sub.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            sub.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        {/* Title and Lecturer */}
                        <div>
                          <h4 className="text-sm font-black text-slate-900 tracking-tight line-clamp-1">{sub.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">{parentSemName}</span>
                          <span className="text-[11px] text-slate-500 italic block mt-1">Instructor: {sub.lecturer}</span>
                        </div>
                      </div>

                      {/* Performance gauge row */}
                      <div className="grid grid-cols-2 gap-2 border-t border-b border-dashed border-slate-100 my-3 py-2 text-center text-xs">
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">CURRENT GRADE</span>
                          <span className="block text-xs font-black text-slate-800 font-mono mt-0.5">
                            {sub.grade} ({sub.score}%)
                          </span>
                        </div>
                        <div className="border-l border-slate-100">
                          <span className="block text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">GP VALUE</span>
                          <span className="block text-xs font-bold text-indigo-600 font-mono mt-0.5">
                            {evaluation.gpaPoint.toFixed(1)} Pts
                          </span>
                        </div>
                      </div>

                      {/* Progress Line */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-bold font-mono uppercase tracking-wider">TERM MILESTONES PROGRESS</span>
                          <span className="font-extrabold text-slate-700 font-mono">{dispProg}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${dispProg}%` }}
                          />
                        </div>
                      </div>

                      {/* Interactive indicator label */}
                      <div className="mt-3.5 pt-2 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          Performance: <span className="text-indigo-600">{evaluation.letter} Rank</span>
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditModal(sub)}
                            className="text-[10px] text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-100"
                            title="Edit metadata"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteSingle(sub.id)}
                            className="text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-slate-100"
                            title="Remove Subject"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            )}

          </div>

          {/* Right Main Pane: Sticky Subject Detail Integration Side panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Header section of Panel */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Academic Details Panel</h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">Focus ledger context</p>
                </div>
                {selectedSubject && (
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/55 py-0.5 px-2.5 rounded-full">
                    {selectedSubject.code}
                  </span>
                )}
              </div>

              {selectedSubject ? (
                <>
                  {/* Subject Information */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Subject Information</h4>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Class Subject</span>
                        <strong className="text-slate-800 font-black">{selectedSubject.name}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Unique Code</span>
                        <strong className="text-slate-800 font-mono font-bold uppercase">{selectedSubject.code}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Credit Value</span>
                        <strong className="text-slate-800 font-mono text-indigo-600 font-black">{selectedSubject.credits} Credits</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Assigned Lecturer</span>
                        <strong className="text-slate-800 font-semibold">{selectedSubject.lecturer}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Semester Semester</span>
                        <strong className="text-slate-800 font-bold text-slate-500 uppercase">
                          {semesters.find(sm => sm.id === selectedSubject.semesterId)?.name || 'Generic Term'}
                        </strong>
                      </div>

                      {/* Course Description */}
                      <div className="pt-2 border-t border-slate-250/20 text-[11px] text-slate-400 leading-normal">
                        <span className="block font-bold text-[9px] text-slate-400 font-mono uppercase tracking-wider mb-0.5">SYLLABUS DESCRIPTION</span>
                        <p>{selectedSubject.description || "No customized syllabus outline cataloged yet. Use edit properties below to specify course curriculum summaries."}</p>
                      </div>

                    </div>
                  </div>

                  {/* Performance Section */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Performance Calibration</h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
                        <span className="block text-[9px] text-slate-400 font-bold">CURRENT LETTER</span>
                        <strong className="text-base font-black text-slate-800 font-mono block mt-0.5">
                          {selectedSubject.grade}
                        </strong>
                        <span className="text-[9px] text-slate-400 font-medium font-mono">({selectedSubject.score}%)</span>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
                        <span className="block text-[9px] text-slate-400 font-bold">GPA POINTS</span>
                        <strong className="text-base font-black text-slate-800 font-mono block mt-0.5 text-indigo-600">
                          {calculateGradeFromScore(selectedSubject.score).gpaPoint.toFixed(1)}
                        </strong>
                        <span className="text-[9px] font-semibold text-indigo-400 font-mono">Out of 4.0</span>
                      </div>
                    </div>

                    <div className="bg-indigo-50/25 border border-indigo-100/50 p-3 rounded-2xl space-y-2 text-xs">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-[10px]">Assignment Average</span>
                        <strong className="font-mono text-slate-700 text-xs">{selectedSubject.assignmentsProgress || 85}%</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-[10px]">Quiz Average</span>
                        <strong className="font-mono text-slate-700 text-xs">{selectedSubject.quizzesProgress || 80}%</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-[10px]">Exam Average</span>
                        <strong className="font-mono text-slate-700 text-xs">{selectedSubject.midExamProgress || 90}%</strong>
                      </div>

                    </div>
                  </div>

                  {/* Assessment Breakdown Slider Calibration tool */}
                  <div className="bg-slate-50/60 rounded-3xl p-4.5 border border-slate-205/60 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 font-mono tracking-widest">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" /> LIVE WEIGHT SIMULATION
                    </div>

                    {selectedSubject.status === 'upcoming' ? (
                      <div className="p-3 text-center text-slate-400 text-[11px] leading-relaxed">
                        Assessments locked. Sliders will unlock once course moves into active status portfolio.
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        
                        {/* Interactive Sliders list inside detailed sidebar */}
                        {/* Weight 1: Assignments */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Assignments (35% Weight)</span>
                            <strong className="font-mono text-slate-800">{selectedSubject.assignmentsProgress || 85}%</strong>
                          </div>
                          <input 
                            type="range"
                            min="10"
                            max="100"
                            value={selectedSubject.assignmentsProgress || 85}
                            onChange={(e) => handleUpdateSlider(selectedSubject.id, 'assignments', parseInt(e.target.value), selectedSubject)}
                            className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Weight 2: Quizzes */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Quizzes (25% Weight)</span>
                            <strong className="font-mono text-slate-800">{selectedSubject.quizzesProgress || 80}%</strong>
                          </div>
                          <input 
                            type="range"
                            min="10"
                            max="100"
                            value={selectedSubject.quizzesProgress || 80}
                            onChange={(e) => handleUpdateSlider(selectedSubject.id, 'quizzes', parseInt(e.target.value), selectedSubject)}
                            className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        {/* Weight 3: Mid / Final Exams */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Exams (40% Weight)</span>
                            <strong className="font-mono text-slate-800">{selectedSubject.midExamProgress || 90}%</strong>
                          </div>
                          <input 
                            type="range"
                            min="10"
                            max="100"
                            value={selectedSubject.midExamProgress || 90}
                            onChange={(e) => handleUpdateSlider(selectedSubject.id, 'midExam', parseInt(e.target.value), selectedSubject)}
                            className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-primary"
                          />
                        </div>

                        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed pt-1 flex items-start gap-1 justify-center">
                          <AlertTriangle className="w-3.5 h-3.5 uppercase text-amber-500 shrink-0" />
                          <span>Instantly adjusts cumulative database metrics and updates GPA widgets.</span>
                        </p>

                      </div>
                    )}

                  </div>

                  {/* Actions inside detailed panel */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditModal(selectedSubject)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-black cursor-pointer inline-flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-indigo-55/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Metadata
                    </button>

                    <button
                      onClick={() => handleDeleteSingle(selectedSubject.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-black cursor-pointer inline-flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-rose-55/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Subject
                    </button>
                  </div>

                </>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  Select a subject on the table grid to inspect academic indexes.
                </div>
              )}

            </div>

          </div>

        </div>

      )}

      {/* Analytics widgets section: Interactive SVGs */}
      {subjects.length > 0 && (
        <div id="analytics-grids" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-indigo-600 font-black" /> Subject Performance Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Dynamic charts and diagnostic widgets evaluating program progression catalogs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* 1. Bar Chart: Grade Distribution */}
            <div className="md:col-span-4 p-4.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Grade Distribution Chart</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Proportional grade score counts</p>
              </div>

              {/* Bar charts SVG */}
              <div className="pt-2">
                <div className="space-y-3">
                  
                  {/* Grade row A */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                      <span>A / A- Grades</span>
                      <span className="text-slate-400">{countA} Subjects ({gradePercentages.A}%)</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.max(5, gradePercentages.A)}%` }} />
                    </div>
                  </div>

                  {/* Grade row B */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                      <span>B+ / B / B- Grades</span>
                      <span className="text-slate-400">{countB} Subjects ({gradePercentages.B}%)</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.max(5, gradePercentages.B)}%` }} />
                    </div>
                  </div>

                  {/* Grade row C */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                      <span>C+ / C Grades</span>
                      <span className="text-slate-400">{countC} Subjects ({gradePercentages.C}%)</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.max(5, gradePercentages.C)}%` }} />
                    </div>
                  </div>

                  {/* Grade row F */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                      <span>Non-Passing (D/F)</span>
                      <span className="text-slate-400">{countF} Subjects ({gradePercentages.F}%)</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.max(5, gradePercentages.F)}%` }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* 2. Line Chart: Subject Performance Trend */}
            <div className="md:col-span-5 p-4.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Subject Performance Trend</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Progression curves of grades cataloged</p>
              </div>

              <div className="relative pt-4">
                <svg viewBox="0 0 400 130" className="w-full h-28 overflow-visible">
                  {/* Guidelines */}
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="0" y1="10" x2="400" y2="10" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />

                  {/* Axis labels */}
                  <text x="-5" y="103" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">60%</text>
                  <text x="-5" y="53" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">80%</text>
                  <text x="-5" y="13" textAnchor="end" fill="#94a3b8" className="text-[8px] font-mono">100%</text>

                  {/* Draw curve path of highest 8 subjects */}
                  {(() => {
                    const trendBase = [...subjects]
                      .filter(s => s.status !== 'upcoming')
                      .slice(0, 8);

                    const points = trendBase.map((s, idx) => {
                      const x = 20 + idx * ((400 - 40) / Math.max(1, trendBase.length - 1));
                      // Score calculation mapping: 60% = 100px, 100% = 10px
                      const scoreNormal = Math.max(60, s.score || 85);
                      const y = 100 - ((scoreNormal - 60) * (90 / 40));
                      return { x, y, score: s.score, code: s.code };
                    });

                    const pathString = points.length > 0
                      ? `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')
                      : '';

                    return (
                      <g>
                        {pathString && (
                          <path 
                            d={pathString}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                            <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#1e293b" className="text-[8px] font-bold font-mono">{p.score}%</text>
                            <text x={p.x} y="118" textAnchor="middle" fill="#94a3b8" className="text-[7px] font-mono uppercase font-bold">{p.code}</text>
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>

            </div>

            {/* 3. Donut Chart: Credits Distribution */}
            <div className="md:col-span-3 p-4.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Credits Allocation Chart</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Classification of course credits</p>
              </div>

              {/* Easy customized donut representation */}
              <div className="my-2 flex items-center justify-center relative">
                <svg width="84" height="84" className="transform -rotate-90">
                  <circle cx="42" cy="42" r="30" stroke="#cbd5e1" strokeWidth="7" fill="transparent" opacity="0.2" />
                  {(() => {
                    const radius = 30;
                    const circumference = 2 * Math.PI * radius;
                    
                    const grandCredTotal = subjects.length || 1;
                    const factor4 = creds4 / grandCredTotal;
                    const factor3 = creds3 / grandCredTotal;

                    const stroke4 = circumference * factor4;
                    const stroke3 = circumference * factor3;

                    return (
                      <g>
                        {/* Segment 4 credits */}
                        <circle 
                          cx="42" cy="42" r={radius} 
                          stroke="#ef57db" strokeWidth="7" fill="transparent" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={circumference * (1 - factor4)} 
                          strokeLinecap="round" 
                        />
                        {/* Segment 3 credits */}
                        <circle 
                          cx="42" cy="42" r={radius} 
                          stroke="#6366f1" strokeWidth="7" fill="transparent" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={circumference * (1 - factor3)} 
                          transform={`rotate(${factor4 * 360} 42 42)`}
                          strokeLinecap="round" 
                        />
                      </g>
                    );
                  })()}
                </svg>
                <div className="absolute text-center leading-none">
                  <span className="text-base font-black font-mono text-slate-800">{creds4 + creds3 + credsOther}</span>
                  <span className="text-[8px] font-bold text-slate-400 block mt-0.5 uppercase tracking-wide">Total Subjects</span>
                </div>
              </div>

              {/* Legend readouts */}
              <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-200/50 text-[10px]">
                <div className="text-center">
                  <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mr-1" />
                  <span className="text-slate-400">4 Cr: {creds4}</span>
                </div>
                <div className="text-center">
                  <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1" />
                  <span className="text-slate-400">3 Cr: {creds3}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Dual Widget Row: top performing vs needs improvement widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Widget Left: Top Performing (Top 5) */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Top Performing Subjects Widget
              </h4>

              <div className="space-y-2.5">
                {topPerformingSubjects.slice(0, 5).map(sub => (
                  <div key={sub.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-wider text-emerald-600 font-mono flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <strong className="text-xs text-slate-800 font-bold line-clamp-1 max-w-[150px]" title={sub.name}>{sub.name}</strong>
                    </div>
                    <span className="font-mono text-xs font-black text-emerald-600">Grade {sub.grade} ({sub.score}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget Right: Needing Improvement (Lowest Score Statuses) */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Lowest Performing Subjects Widget
              </h4>

              <div className="space-y-2.5">
                {lowestPerformingSubjects.slice(0, 5).map(sub => (
                  <div key={sub.id} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-wider text-amber-700 font-mono flex items-center bg-amber-50 px-1.5 py-0.5 rounded">
                        {sub.code}
                      </span>
                      <strong className="text-xs text-slate-800 font-bold line-clamp-1 max-w-[150px]" title={sub.name}>{sub.name}</strong>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-600">Grade {sub.grade} ({sub.score}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- ADD SUBJECT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="add-subject-modal-backdrop">
          
          <form 
            onSubmit={handleAddSubmit}
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scale-up"
            id="add-subject-modal-box"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600" /> Add Academic Subject
              </h4>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                id="close-add-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Area */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Subject Code</label>
                <input 
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. CS302"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 uppercase"
                  id="field-subject-code"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Credit Value (Units)</label>
                <select
                  value={formCredits}
                  onChange={(e) => setFormCredits(parseInt(e.target.value) || 3)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                  id="field-credit-value"
                >
                  <option value="1">1 Credit Unit</option>
                  <option value="2">2 Credit Units</option>
                  <option value="3">3 Credit Units</option>
                  <option value="4">4 Credit Units</option>
                  <option value="5">5 Credit Units</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Subject Name</label>
                <input 
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Database Systems"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                  id="field-subject-name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Instructed Semester</label>
                <select
                  value={formSemesterId}
                  onChange={(e) => setFormSemesterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                  id="field-semester"
                >
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Lecturer Name</label>
                <input 
                  type="text"
                  required
                  value={formLecturer}
                  onChange={(e) => setFormLecturer(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                  id="field-lecturer"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Course Syllabus Outline Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short outline summarizing course scopes, core milestones, and exam weights expected..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 resize-none text-[11px]"
                  id="field-description"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Subject Progress Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                  id="field-status"
                >
                  <option value="active">Active Track</option>
                  <option value="completed">Completed Term</option>
                  <option value="upcoming">Upcoming Term</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Syllabus Score Evaluation ({formScore}%)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={formScore}
                  onChange={(e) => setFormScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                  id="field-score"
                />
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
              
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all"
                id="add-subject-cancel"
              >
                Cancel
              </button>

              <button 
                type="submit" 
                className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold shadow-sm"
                id="add-subject-save"
              >
                Save Subject
              </button>

            </div>

          </form>

        </div>
      )}

      {/* --- EDIT SUBJECT MODAL --- */}
      {showEditModal && editingSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="edit-subject-modal-backdrop">
          
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-scale-up"
            id="edit-subject-modal-box"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" /> Edit Subject Attributes
              </h4>
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Subject Code</label>
                <input 
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Credit Units value</label>
                <select
                  value={formCredits}
                  onChange={(e) => setFormCredits(parseInt(e.target.value) || 3)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                >
                  <option value="1">1 Credit Unit</option>
                  <option value="2">2 Credit Units</option>
                  <option value="3">3 Credit Units</option>
                  <option value="4">4 Credit Units</option>
                  <option value="5">5 Credit Units</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Subject Name</label>
                <input 
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Semester Associated</label>
                <select
                  value={formSemesterId}
                  onChange={(e) => setFormSemesterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                >
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Lecturer Name</label>
                <input 
                  type="text"
                  required
                  value={formLecturer}
                  onChange={(e) => setFormLecturer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Catalog Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 resize-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Score Value ({formScore}%)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={formScore}
                  onChange={(e) => setFormScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                />
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
              
              <button 
                type="button" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSubject(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all"
              >
                Cancel
              </button>

              <button 
                type="submit" 
                className="py-2.5 px-5 rounded-xl bg-indigo-650 hover:bg-primary text-white font-extrabold shadow-sm"
              >
                Save Subject
              </button>

            </div>

          </form>

        </div>
      )}

      {/* --- FORMAL ACADEMIC TRANSCRIPT MODAL / REPORT POPUP --- */}
      {showReportCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="transcript-modal-backdrop">
          
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-8 space-y-6 animate-scale-up border border-slate-250 relative overflow-y-auto max-h-[90vh]">
            
            {/* Seal / Emblem header row */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-slate-900 pb-5 gap-3.5">
              
              <div className="text-center sm:text-left leading-tight">
                <h1 className="text-lg font-black tracking-widest text-slate-900 font-serif uppercase">STUDENT SUCCESS PLATFORM</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-widest">OFFICIAL TRANSCRIPT OF ACADEMIC STANDING</p>
                <p className="text-[9px] text-slate-400 font-bold italic">Generated Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
              </div>

              <div className="h-16 w-16 rounded-full border-4 border-indigo-900 flex items-center justify-center text-indigo-900 font-black relative bg-indigo-50/50 shrink-0">
                <GraduationCap className="w-8 h-8" />
                <div className="absolute inset-0.5 rounded-full border border-dashed border-indigo-805" />
              </div>

            </div>

            {/* Student Information section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase font-mono">STUDENT EMAIL</span>
                <strong className="text-slate-700 block mt-0.5">kavindup52@gmail.com</strong>
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase font-mono">ENROLLED PATH</span>
                <strong className="text-slate-700 block mt-0.5">Software Engineering</strong>
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase font-mono">CUMULATIVE GPA</span>
                <strong className="text-indigo-600 font-black block mt-0.5">3.78 / 4.00</strong>
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase font-mono">CREDITS AWARDED</span>
                <strong className="text-slate-700 block mt-0.5">{totalFilteredCredits} Credits</strong>
              </div>
            </div>

            {/* Subjects table list inside Report */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Academic Record Entries</h4>
              
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[9px] text-slate-500 font-mono font-bold uppercase border-b border-slate-300">
                      <th className="py-2 px-3">CODE</th>
                      <th className="py-2 px-3">COURSE EXCELLENCE TRACK TITLE</th>
                      <th className="py-2 px-3 text-center">CREDITS</th>
                      <th className="py-2 px-3 text-center">GRADE</th>
                      <th className="py-2 px-3 text-center">POINTS</th>
                      <th className="py-2 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {subjects.map(sb => {
                      const gp = calculateGradeFromScore(sb.score).gpaPoint;
                      return (
                        <tr key={sb.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-600">{sb.code}</td>
                          <td className="py-2 px-3 text-slate-800 font-bold">{sb.name}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-600">{sb.credits}</td>
                          <td className="py-2 px-3 text-center font-mono font-black text-indigo-700">{sb.grade}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500">{gp.toFixed(1)}</td>
                          <td className="py-2 px-3 text-right text-[10px] uppercase font-mono font-bold text-slate-400">{sb.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formal validation seal descriptor */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 gap-4 text-xs">
              <div className="text-slate-400 max-w-sm text-[10px] leading-tight text-center sm:text-left">
                * This document is a simulated transcript provided under the Student Success Platform program. Registrations are automatically verified electronically.
              </div>
              <button 
                onClick={() => window.print()}
                className="bg-slate-900 text-white font-black text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Print Copy
              </button>
            </div>

            {/* Close modal badge */}
            <button 
              onClick={() => setShowReportCard(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="Close transcript"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>
      )}

      {successToast && (
        <div id="subjects-toast-box" className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

    </div>
  );
};
