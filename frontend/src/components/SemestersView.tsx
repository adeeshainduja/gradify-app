import { useState, FormEvent } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  AlertCircle, 
  GraduationCap,
  Save,
  X
} from 'lucide-react';
import { Semester, Subject, gradeToPoints } from '../types';

interface SemestersViewProps {
  semesters: Semester[];
  subjects: Subject[];
  onAddSemester: (name: string, year: number, isCurrent: boolean) => void;
  onUpdateSemester: (id: string, name: string, year: number, isCurrent: boolean) => void;
  onDeleteSemester: (id: string) => void;
  onSetCurrentSemester: (id: string) => void;
}

export default function SemestersView({
  semesters,
  subjects,
  onAddSemester,
  onUpdateSemester,
  onDeleteSemester,
  onSetCurrentSemester
}: SemestersViewProps) {
  // Modal & form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState('');

  // Form value states
  const [semName, setSemName] = useState('');
  const [semYear, setSemYear] = useState<number>(new Date().getFullYear());
  const [semIsCurrent, setSemIsCurrent] = useState(false);

  // Helper: calculate courses & gpa for a semester
  const getSemesterStats = (semId: string) => {
    const semSubjects = subjects.filter(s => s.semesterId === semId);
    const graded = semSubjects.filter(s => s.grade !== 'IP');
    
    const count = semSubjects.length;
    const credits = semSubjects.reduce((total, s) => total + s.credits, 0);

    let gpaPoints = 0;
    let gradedCredits = 0;

    graded.forEach(s => {
      gpaPoints += gradeToPoints(s.grade) * s.credits;
      gradedCredits += s.credits;
    });

    const gpa = gradedCredits > 0 ? (gpaPoints / gradedCredits) : null;
    return { count, credits, gpa };
  };

  const handleOpenAdd = () => {
    setSemName('');
    setSemYear(new Date().getFullYear());
    setSemIsCurrent(false);
    setIsAddOpen(true);
    setIsEditOpen(false);
  };

  const handleOpenEdit = (sem: Semester) => {
    setEditId(sem.id);
    setSemName(sem.name);
    setSemYear(sem.year);
    setSemIsCurrent(sem.isCurrent);
    setIsEditOpen(true);
    setIsAddOpen(false);
  };

  const handleSaveAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!semName.trim()) return;
    onAddSemester(semName.trim(), semYear, semIsCurrent);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!semName.trim()) return;
    onUpdateSemester(editId, semName.trim(), semYear, semIsCurrent);
    setIsEditOpen(false);
  };

  // Overall stats calculations
  const totalSemesters = semesters.length;
  const activeSemesterObj = semesters.find(s => s.isCurrent) || semesters[Math.max(0, semesters.length - 1)];
  const activeSemesterName = activeSemesterObj ? activeSemesterObj.name : 'N/A';

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach(s => {
      if (s.grade !== 'IP') {
        totalPoints += gradeToPoints(s.grade) * s.credits;
        totalCredits += s.credits;
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };
  const overallCgpa = calculateCGPA();
  const totalCreditsEarned = subjects.filter(s => s.grade !== 'IP').reduce((sum, s) => sum + s.credits, 0);

  // Performance indicators for page 7
  const gradedSubjects = subjects.filter(s => s.grade !== 'IP');
  const totalSubjectsCount = subjects.length;
  const completionPercentage = totalSubjectsCount > 0 ? Math.round((gradedSubjects.length / totalSubjectsCount) * 100) : 0;

  let bestSubjectName = 'N/A';
  let bestSubjectGrade = '--';
  let bestPoints = -1;
  let lowestSubjectName = 'N/A';
  let lowestSubjectGrade = '--';
  let lowestPoints = 99;

  gradedSubjects.forEach(s => {
    const pts = gradeToPoints(s.grade);
    if (pts > bestPoints) {
      bestPoints = pts;
      bestSubjectName = `${s.code}`;
      bestSubjectGrade = s.grade;
    }
    if (pts < lowestPoints) {
      lowestPoints = pts;
      lowestSubjectName = `${s.code}`;
      lowestSubjectGrade = s.grade;
    }
  });

  const pointsToGrade = (pts: number) => {
    if (pts >= 4.0) return 'A+';
    if (pts >= 3.8) return 'A';
    if (pts >= 3.5) return 'A-';
    if (pts >= 3.2) return 'B+';
    if (pts >= 2.8) return 'B';
    if (pts >= 2.5) return 'B-';
    if (pts >= 2.0) return 'C+';
    if (pts >= 1.5) return 'C';
    if (pts >= 1.0) return 'D';
    return 'F';
  };
  const averageGradeStr = gradedSubjects.length > 0 ? pointsToGrade(overallCgpa) : 'N/A';

  // Semester GPA data for Trend Chart
  const trendData = semesters.map(sem => {
    const stats = getSemesterStats(sem.id);
    return {
      id: sem.id,
      name: sem.name,
      year: sem.year,
      gpa: stats.gpa || 0,
      credits: stats.credits || 0
    };
  }).sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-slate-500 font-sans">Organize your semesters, target GPAs and active registration periods.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold px-4 py-2.5 shadow-sm transition-transform active:scale-95"
          id="btn-add-semester-modal"
        >
          <Plus size={16} />
          <span>Create Semester</span>
        </button>
      </div>

      {/* Summary KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="semesters-kpis">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-sans block mb-1">Total Semesters</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{totalSemesters}</span>
            <span className="text-xs text-slate-400 font-sans">academic blocks</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-2">Registered historical entries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-sans block mb-1">Active Semester</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold font-headline text-blue-700 truncate max-w-[160px] block">{activeSemesterName}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium font-sans mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Currently tracking</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-sans block mb-1">Overall CGPA</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{overallCgpa > 0 ? overallCgpa.toFixed(2) : '0.00'}</span>
            <span className="text-xs text-slate-400 font-sans">/ 4.0</span>
          </div>
          <p className="text-[10px] text-indigo-500 font-semibold font-sans mt-2">Cumulative overall average</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-sans block mb-1">Total Credits Earned</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{totalCreditsEarned}</span>
            <span className="text-xs text-slate-400 font-sans">earned hours</span>
          </div>
          <p className="text-[10px] text-amber-500 font-semibold font-sans mt-2">Passing credit threshold</p>
        </div>
      </div>

      {/* Page 7: Analytics Section (Semester GPA Trend & Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="semester-analytics-hub">
        
        {/* Left/Middle Column (2/3 width) - Semester GPA Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between col-span-1 lg:col-span-2">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-600" />
              <span>Semester GPA Index Trend</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">Chronological representation of your block grades performance</p>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 px-2 relative border-b border-l border-slate-100 pb-2 pt-6">
            
            {/* Background dashed horizontal index lines */}
            <div className="absolute left-0 right-0 top-[20%] border-t border-dashed border-slate-100 text-[9px] text-slate-300 font-mono pl-1">3.00</div>
            <div className="absolute left-0 right-0 top-[50%] border-t border-dashed border-slate-100 text-[9px] text-slate-300 font-mono pl-1">2.00</div>
            <div className="absolute left-0 right-0 top-[80%] border-t border-dashed border-slate-100 text-[9px] text-slate-300 font-mono pl-1">1.00</div>

            {trendData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 italic">
                No semester GPA statistics found yet.
              </div>
            ) : (
              <div className="w-full h-full flex items-end justify-around absolute bottom-2 left-0 right-0 px-8">
                {trendData.map((t, index) => {
                  const gpaLimit = Math.max(0, Math.min(4, t.gpa));
                  const percentage = (gpaLimit / 4.0) * 100;
                  return (
                    <div key={t.id} className="flex flex-col items-center gap-1.5 h-full justify-end group relative w-12">
                      {/* Interactive Tooltip popup on hover */}
                      <div className="absolute -top-6 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-mono font-bold shadow-xs">
                        GPA: {t.gpa.toFixed(2)}
                      </div>

                      {/* Bar columns representing SGPA */}
                      <div 
                        className="w-8 rounded-t-lg bg-gradient-to-t from-blue-500 to-indigo-600 group-hover:from-indigo-600 group-hover:to-blue-500 transition-all cursor-crosshair duration-500 relative"
                        style={{ height: `${Math.max(12, percentage)}%` }}
                      >
                        <span className="absolute bottom-1 left-0 right-0 text-[10px] text-white text-center font-bold font-sans">
                          {t.gpa > 0 ? t.gpa.toFixed(1) : '0'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 text-center truncate max-w-full">
                        {t.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Dashboard panel - credit breakdown & Performance overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline flex items-center gap-2 mb-1">
              <GraduationCap size={16} className="text-indigo-600" />
              <span>Performance Insight Ledger</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-sans">Page 7 academic performance indicators</p>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            
            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Average Letter Grade:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 font-headline text-sm">
                {averageGradeStr}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Best Subject Class:</span>
              <div className="text-right">
                <span className="font-bold text-emerald-700 block">{bestSubjectName}</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Grade: {bestSubjectGrade}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-500 font-medium">Lowest Subject Class:</span>
              <div className="text-right">
                <span className="font-bold text-amber-700 block">{lowestSubjectName}</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Grade: {lowestSubjectGrade}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Course Completion rate:</span>
              <span className="font-bold text-slate-800 font-mono">{completionPercentage}% Completed</span>
            </div>
          </div>
        </div>
      </div>


      {/* Semester Modals (Add / Edit Panel) */}
      {(isAddOpen || isEditOpen) && (
        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 shadow-inner mt-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <span>{isAddOpen ? 'Add New Academic Semester' : 'Modify Semester Info'}</span>
            </h4>
            <button 
              onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-600 font-sans">Semester Name</label>
              <input 
                type="text" 
                value={semName} 
                onChange={(e) => setSemName(e.target.value)}
                placeholder="e.g. Fall 2026, Spring 2027"
                className="w-full text-sm bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 focus:ring-1 focus:ring-blue-100 font-sans"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-600 font-sans">Academic Year</label>
              <input 
                type="number" 
                value={semYear} 
                onChange={(e) => setSemYear(parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="e.g. 2026"
                className="w-full text-sm bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2 focus:ring-1 focus:ring-blue-100 font-sans"
                required
              />
            </div>

            <div className="flex items-center gap-2 py-3.5 col-span-1">
              <input 
                type="checkbox" 
                id="is-current-checkbox"
                checked={semIsCurrent}
                onChange={(e) => setSemIsCurrent(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="is-current-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none font-sans">
                Set as Active / Current Semester
              </label>
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200/60">
              <button 
                type="button" 
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-lg text-xs font-extrabold px-4 py-1.5 hover:bg-blue-700 shadow-xs"
              >
                <Save size={14} />
                <span>Save Semester</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of semesters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesters.map((sem) => {
          const stats = getSemesterStats(sem.id);
          return (
            <div 
              key={sem.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                sem.isCurrent 
                  ? 'border-blue-500 ring-2 ring-blue-50' 
                  : 'border-slate-150 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className={sem.isCurrent ? "text-blue-600" : "text-slate-400"} />
                    <span className="text-xs text-slate-400 font-mono font-bold">{sem.year} ACADEMIC</span>
                  </div>
                  {sem.isCurrent ? (
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Current Active
                    </span>
                  ) : (
                    <button
                      onClick={() => onSetCurrentSemester(sem.id)}
                      className="text-[10px] hover:bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200"
                    >
                      Mark Active
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold font-headline text-slate-900 mb-1">{sem.name}</h3>
                <p className="text-xs text-slate-400 mb-6 font-sans">
                  Holds enrolled curricular coursework for {sem.name.toLowerCase()} periods.
                </p>
              </div>

              {/* Stats block */}
              <div className="border-t border-slate-100 pt-4 mt-6">
                <div className="grid grid-cols-3 gap-2 text-center mb-5">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-sans text-slate-400 block">Courses</span>
                    <span className="text-lg font-bold text-slate-800 font-headline">{stats.count}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-sans text-slate-400 block">Credits</span>
                    <span className="text-lg font-bold text-slate-800 font-headline">{stats.credits}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-sans text-slate-400 block">GPA</span>
                    <span className="text-lg font-bold text-blue-700 font-headline">
                      {stats.gpa !== null ? stats.gpa.toFixed(2) : '--'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 justify-end border-t border-slate-50 pt-3">
                  <button
                    onClick={() => handleOpenEdit(sem)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit info"
                  >
                    <Edit3 size={15} />
                  </button>
                  
                  {semesters.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you absolutely sure you want to delete "${sem.name}"? This action deletes all subjects, assignments, and exams belonging to this semester!`)) {
                          onDeleteSemester(sem.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Semester"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
