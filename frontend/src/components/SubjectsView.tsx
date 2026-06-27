import { useState, FormEvent, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Mail, 
  MapPin, 
  Clock, 
  ChevronDown, 
  Check, 
  X,
  User,
  GraduationCap
} from 'lucide-react';
import { 
  Semester, 
  Subject, 
  SUBJECT_COLORS, 
  GradeType, 
  AVAILABLE_GRADES,
  gradeToPoints
} from '../types';

interface SubjectsViewProps {
  semesters: Semester[];
  subjects: Subject[];
  activeSemesterId: string;
  onAddSubject: (newSub: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (id: string, updatedSub: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
}

export default function SubjectsView({
  semesters,
  subjects,
  activeSemesterId,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject
}: SubjectsViewProps) {
  // Find current semester to select initially — use activeSemesterId from parent
  const [selectedSemesterId, setSelectedSemesterId] = useState(activeSemesterId || '');

  // Re-sync when the parent's activeSemesterId changes (happens after backend fetch replaces
  // the placeholder IDs like 'sem-1' with real numeric string IDs like '1')
  useEffect(() => {
    if (activeSemesterId && activeSemesterId !== selectedSemesterId) {
      // Only auto-switch if the current selection doesn't exist in the updated semesters list
      const exists = semesters.some(s => s.id === selectedSemesterId);
      if (!exists) {
        setSelectedSemesterId(activeSemesterId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSemesterId, semesters]);

  // Modal open states
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    grade: 'IP' as GradeType,
    targetGrade: 'A' as GradeType,
    professorName: '',
    professorEmail: '',
    color: 'blue',
    schedule: '',
    room: '',
  });

  const filteredSubjects = subjects.filter(s => s.semesterId === selectedSemesterId);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      grade: 'IP',
      targetGrade: 'A',
      professorName: '',
      professorEmail: '',
      color: 'blue',
      schedule: '',
      room: '',
    });
    setEditingSubject(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      grade: sub.grade,
      targetGrade: sub.targetGrade,
      professorName: sub.professorName || '',
      professorEmail: sub.professorEmail || '',
      color: sub.color,
      schedule: sub.schedule || '',
      room: sub.room || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingSubject) {
      onUpdateSubject(editingSubject.id, {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
      });
    } else {
      onAddSubject({
        semesterId: selectedSemesterId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        credits: formData.credits,
        grade: formData.grade,
        targetGrade: formData.targetGrade,
        professorName: formData.professorName.trim(),
        professorEmail: formData.professorEmail.trim(),
        color: formData.color,
        schedule: formData.schedule.trim(),
        room: formData.room.trim(),
      });
    }
    setIsOpen(false);
    resetForm();
  };

  const getColorConfig = (colorName: string) => {
    return SUBJECT_COLORS.find(c => c.value === colorName) || SUBJECT_COLORS[0];
  };

  // KPI card logic for Page 9 & 11
  const totalSubjectsCount = filteredSubjects.length;
  const totalSemesterCreditsSum = filteredSubjects.reduce((acc, current) => acc + current.credits, 0);

  const calculateAverageSemesterGpa = () => {
    let earnedPoints = 0;
    let earnedCredits = 0;
    filteredSubjects.forEach(s => {
      if (s.grade !== 'IP') {
        earnedPoints += gradeToPoints(s.grade) * s.credits;
        earnedCredits += s.credits;
      }
    });
    return earnedCredits > 0 ? (earnedPoints / earnedCredits) : 0;
  };
  const subjectsCurrentGpaValue = calculateAverageSemesterGpa();
  
  const pointsToGradeLet = (pts: number) => {
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
  
  const averageGradeString = filteredSubjects.filter(s => s.grade !== 'IP').length > 0 
    ? pointsToGradeLet(subjectsCurrentGpaValue) 
    : 'N/A';

  // Analytics helpers for page 11 widgets
  const gradedSubjectsList = filteredSubjects.filter(s => s.grade !== 'IP');
  const topGradedCourses = [...gradedSubjectsList]
    .sort((a, b) => gradeToPoints(b.grade) - gradeToPoints(a.grade))
    .slice(0, 3);
  const needAttentionCourses = filteredSubjects.filter(s => s.grade === 'IP' || gradeToPoints(s.grade) < 3.0);

  // Grade distributions mapping
  const distCounts = { A: 0, B: 0, C: 0, F: 0, IP: 0 };
  filteredSubjects.forEach(s => {
    if (s.grade === 'IP') distCounts.IP++;
    else if (s.grade.startsWith('A')) distCounts.A++;
    else if (s.grade.startsWith('B')) distCounts.B++;
    else if (s.grade.startsWith('C')) distCounts.C++;
    else distCounts.F++;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Semester Selection Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-500 font-sans whitespace-nowrap">Filter Semester:</label>
          <div className="relative">
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="appearance-none bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-4 pr-10 text-sm font-semibold text-slate-800 focus:ring-1 focus:ring-blue-100 cursor-pointer"
            >
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name} {sem.isCurrent ? '(Active)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={!selectedSemesterId}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold px-4 py-2.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          id="btn-add-subject-modal"
        >
          <Plus size={16} />
          <span>Add Course</span>
        </button>
      </div>

      {/* KPI Stats Cards - Page 9 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="subjects-kpis">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Enrolled Subjects</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{totalSubjectsCount}</span>
            <span className="text-xs text-slate-400">active classes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Class load this academic block</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Enrolled Credits</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{totalSemesterCreditsSum}</span>
            <span className="text-xs text-slate-400">weighted units</span>
          </div>
          <p className="text-[10px] text-indigo-500 font-semibold mt-2">Average credits workload</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Average Grade (Est)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-slate-900">{averageGradeString}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Earned curriculum benchmark</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Semester Est GPA</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-blue-700">
              {subjectsCurrentGpaValue > 0 ? subjectsCurrentGpaValue.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-400">/ 4.0</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-2">Active running GPA block</p>
        </div>
      </div>

      {/* Visual Analytics Widgets - Page 11 Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="subject-visualizations-row">
        
        {/* Left Column: Grade Distribution (Bar Chart representation) + Credit visual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between col-span-1 lg:col-span-2 space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Grade Distribution</span>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline">Academic Grades Dispersion</h4>
          </div>

          <div className="space-y-3">
            {[
              { label: 'A / A+ Category', count: distCounts.A, color: 'bg-emerald-500' },
              { label: 'B / B+ Category', count: distCounts.B, color: 'bg-blue-500' },
              { label: 'C / C+ Category', count: distCounts.C, color: 'bg-amber-500' },
              { label: 'D / F Category', count: distCounts.F, color: 'bg-red-500' },
              { label: 'In Progress (IP)', count: distCounts.IP, color: 'bg-slate-400' }
            ].map((gradeItem, i) => {
              const rRatio = totalSubjectsCount > 0 ? (gradeItem.count / totalSubjectsCount) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-sans">
                    <span className="text-slate-600 font-medium">{gradeItem.label}</span>
                    <span className="text-slate-800 font-bold">{gradeItem.count} ({Math.round(rRatio)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${gradeItem.color}`}
                      style={{ width: `${rRatio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Widgets highlighting Strongest vs Improvement classes (Page 11) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Performance Ranks</span>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline">Top vs Improvement Classes</h4>
          </div>

          <div className="space-y-4 flex-1">
            {/* Top performing */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Top Performing (Grade)
              </span>
              {topGradedCourses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No graded subjects available yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {topGradedCourses.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">{sub.code} &mdash; {sub.name}</span>
                      <span className="font-extrabold text-emerald-600 font-mono text-sm">{sub.grade}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Needs improvement */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                Alert/Needs Review
              </span>
              {needAttentionCourses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">All subjects currently meet satisfactory targets!</p>
              ) : (
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {needAttentionCourses.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">{sub.code} &mdash; {sub.name}</span>
                      <span className="font-extrabold text-amber-600 font-mono">{sub.grade === 'IP' ? 'IP (Active)' : sub.grade}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slideout or inline Add/Edit Form panel */}
      {isOpen && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner mx-auto space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
            <h4 className="text-md font-bold text-slate-900 font-headline">
              {editingSubject ? `Edit Course ${formData.code}` : 'Enroll a New Course'}
            </h4>
            <button 
              onClick={() => { setIsOpen(false); resetForm(); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-slate-500 font-sans">Course Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Course Code</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CS102"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Credits Count</label>
                <input 
                  type="number" 
                  value={formData.credits} 
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                  min="0"
                  max="10"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Grade Level</label>
                <select 
                  value={formData.grade} 
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value as GradeType })}
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                >
                  {AVAILABLE_GRADES.map(g => (
                    <option key={g} value={g}>{g === 'IP' ? 'IP (In Progress)' : g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Target Grade Goal</label>
                <select 
                  value={formData.targetGrade} 
                  onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value as GradeType })}
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                >
                  {AVAILABLE_GRADES.filter(g => g !== 'IP').map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Professor Name</label>
                <input 
                  type="text" 
                  value={formData.professorName} 
                  onChange={(e) => setFormData({ ...formData, professorName: e.target.value })}
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Professor Email</label>
                <input 
                  type="email" 
                  value={formData.professorEmail} 
                  onChange={(e) => setFormData({ ...formData, professorEmail: e.target.value })}
                  placeholder="turing@university.edu"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Lecture Hours</label>
                <input 
                  type="text" 
                  value={formData.schedule} 
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g. Mon/Wed 10:00 AM"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-sans">Room Assignment</label>
                <input 
                  type="text" 
                  value={formData.room} 
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="e.g. Sloan Hall 302"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500 font-sans">Theme Badge Accent Color</label>
                <div className="flex gap-2 flex-wrap pt-1">
                  {SUBJECT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center relative transition-transform hover:scale-110`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {formData.color === c.value && (
                        <Check size={12} className="text-white drop-shadow-sm font-extrabold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 text-white rounded-lg text-xs font-bold px-4 py-1.5 hover:bg-blue-700"
              >
                {editingSubject ? 'Update Course Info' : 'Enroll Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Course Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <GraduationCap className="mx-auto text-slate-200 mb-2" size={48} />
          <h3 className="font-bold text-slate-900 mb-1 font-headline">No Classes Registered</h3>
          <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
            This workspace list is blank for this semester. Click &ldquo;Add Course&rdquo; above to register coursework credits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => {
            const colorConfig = getColorConfig(sub.color);
            return (
              <div 
                key={sub.id}
                className="bg-white border border-slate-150 rounded-2xl hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden relative"
              >
                {/* Visual Top Colored Bar */}
                <div className="h-2 w-full" style={{ backgroundColor: colorConfig.hex }} />

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Code & Credits Badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                        {sub.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorConfig.bg}`}>
                        {sub.credits} Credits
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-headline text-slate-900 group-hover:text-blue-700 transition-colors mb-2.5 leading-snug">
                      {sub.name}
                    </h3>

                    {/* Professor Details block */}
                    {sub.professorName && (
                      <div className="bg-slate-50/70 rounded-xl p-3 mb-4 border border-slate-100 flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <User size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{sub.professorName}</p>
                          {sub.professorEmail && (
                            <a 
                              href={`mailto:${sub.professorEmail}`}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Mail size={10} />
                              <span className="truncate">{sub.professorEmail}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Times & Scheduling info */}
                    <div className="space-y-1.5 text-xs text-slate-500 font-sans mt-2 mb-4">
                      {sub.schedule && (
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{sub.schedule}</span>
                        </div>
                      )}
                      {sub.room && (
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{sub.room}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target vs Actual Grade */}
                  <div className="border-t border-slate-50 pt-4 mt-auto">
                    <div className="flex justify-between items-baseline mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Course Status</span>
                        <span className="text-sm font-extrabold text-slate-800 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono">
                          {sub.grade === 'IP' ? 'IN PROGRESS' : sub.grade}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Goal Grade</span>
                        <span className="text-sm font-bold text-emerald-600 uppercase font-mono">
                          {sub.targetGrade}
                        </span>
                      </div>
                    </div>

                    {/* Actions tools Bar */}
                    <div className="flex gap-2 justify-end pt-2 mt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Course info"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove course "${sub.code}: ${sub.name}"? This deletes all associated Assignments & Exams!`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
