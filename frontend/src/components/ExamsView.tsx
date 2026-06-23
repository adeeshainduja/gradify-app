import { useState, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  X,
  Award,
  BookOpen,
  MapPin,
  Clock,
  NotebookTabs,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  SquareCheck,
  Square
} from 'lucide-react';
import { 
  Subject, 
  Exam, 
  SUBJECT_COLORS,
  formatDateTimeSafe 
} from '../types';

interface ExamsViewProps {
  subjects: Subject[];
  exams: Exam[];
  onAddExam: (newExam: Omit<Exam, 'id'>) => void;
  onUpdateExam: (id: string, updated: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
}

export default function ExamsView({
  subjects,
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam
}: ExamsViewProps) {
  const [filterMode, setFilterMode] = useState<'Upcoming' | 'Completed'>('Upcoming');
  const [isOpen, setIsOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Dynamic Exam Prep Checklists (stored in local state or browser storage by Exam ID)
  // Let's seed preloaded goals!
  const [prepTasks, setPrepTasks] = useState<Record<string, { id: string; text: string; done: boolean }[]>>({
    'e-1': [
      { id: 't1', text: 'Read chapters 1 to 4 in book', done: true },
      { id: 't2', text: 'Compile example assembly projects and practice debugging with gdb', done: false },
      { id: 't3', text: 'Go to Dr. Hopper\'s exam office hours', done: false }
    ],
    'e-2': [
      { id: 't4', text: 'Practice Bayes formula calculations', done: true },
      { id: 't5', text: 'Solve past year sample midterm PDF', done: true }
    ]
  });

  const [newTaskInput, setNewTaskInput] = useState('');
  const [activePrepExamId, setActivePrepExamId] = useState<string | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    dateTime: new Date().toISOString().substring(0, 16), // datetime-local format
    room: '',
    weight: '15',
    maxScore: '100',
    score: '',
    notes: '',
    status: 'Upcoming' as 'Upcoming' | 'Completed'
  });

  const getSubjectInfo = (subId: string) => {
    return subjects.find(s => s.id === subId);
  };

  const getSubjectColorHex = (subId: string) => {
    const sub = getSubjectInfo(subId);
    if (!sub) return '#3b82f6';
    const conf = SUBJECT_COLORS.find(c => c.value === sub.color);
    return conf ? conf.hex : '#3b82f6';
  };

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      title: '',
      subjectId: subjects[0]?.id || '',
      dateTime: new Date().toISOString().substring(0, 16),
      room: '',
      weight: '20',
      maxScore: '100',
      score: '',
      notes: '',
      status: 'Upcoming'
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subjectId: exam.subjectId,
      dateTime: exam.dateTime,
      room: exam.room || '',
      weight: exam.weight.toString(),
      maxScore: exam.maxScore.toString(),
      score: exam.score?.toString() || '',
      notes: exam.notes || '',
      status: exam.status
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subjectId) return;

    const parsedWeight = parseFloat(formData.weight) || 0;
    const parsedMaxScore = parseFloat(formData.maxScore) || 100;
    const parsedScore = formData.score !== '' ? parseFloat(formData.score) : undefined;

    const payload = {
      title: formData.title.trim(),
      subjectId: formData.subjectId,
      dateTime: formData.dateTime,
      room: formData.room.trim(),
      weight: parsedWeight,
      maxScore: parsedMaxScore,
      score: formData.status === 'Completed' ? parsedScore : undefined,
      notes: formData.notes.trim(),
      status: formData.status
    };

    if (editingExam) {
      onUpdateExam(editingExam.id, payload);
    } else {
      onAddExam(payload);
    }

    setIsOpen(false);
    setEditingExam(null);
  };

  const toggleChecklistTask = (examId: string, taskId: string) => {
    const list = prepTasks[examId] || [];
    const updated = list.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    setPrepTasks({ ...prepTasks, [examId]: updated });
  };

  const handleAddPrepTask = (examId: string) => {
    if (!newTaskInput.trim()) return;
    const list = prepTasks[examId] || [];
    const newTask = {
      id: Math.random().toString(),
      text: newTaskInput.trim(),
      done: false
    };
    setPrepTasks({ ...prepTasks, [examId]: [...list, newTask] });
    setNewTaskInput('');
  };

  const handleDeletePrepTask = (examId: string, taskId: string) => {
    const list = prepTasks[examId] || [];
    setPrepTasks({ ...prepTasks, [examId]: list.filter(t => t.id !== taskId) });
  };

  const filteredExams = exams.filter(e => e.status === filterMode);

  // KPI calculations for Page 24
  const completedExams = exams.filter(e => e.status === 'Completed');
  const upcomingExamsList = exams.filter(e => e.status === 'Upcoming').sort((a,b) => a.dateTime.localeCompare(b.dateTime));

  let totalScorePercentSum = 0;
  let gradedExamsCount = 0;
  completedExams.forEach(e => {
    if (e.score !== undefined && e.maxScore > 0) {
      totalScorePercentSum += (e.score / e.maxScore) * 100;
      gradedExamsCount++;
    }
  });
  const averageExamScore = gradedExamsCount > 0 ? Math.round(totalScorePercentSum / gradedExamsCount) : 82; 

  let highestPercentAchieved = 0;
  completedExams.forEach(e => {
    if (e.score !== undefined && e.maxScore > 0) {
      const pct = (e.score / e.maxScore) * 100;
      if (pct > highestPercentAchieved) {
        highestPercentAchieved = pct;
      }
    }
  });
  const highestS = highestPercentAchieved > 0 ? Math.round(highestPercentAchieved) : 94; 

  const nextExamCountdown = upcomingExamsList.length > 0 ? (() => {
    const nextExamDate = new Date(upcomingExamsList[0].dateTime);
    const today = new Date();
    const diffMs = nextExamDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days Remaining` : 'Scheduled Today';
  })() : 'No Pending Exams';

  return (
    <div className="space-y-6">

      {/* Tabs selector + CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setFilterMode('Upcoming')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'Upcoming' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={14} className="text-indigo-600" />
            <span>Upcoming Exams ({exams.filter(e => e.status === 'Upcoming').length})</span>
          </button>
          <button
            onClick={() => setFilterMode('Completed')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'Completed' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle size={14} className="text-emerald-600" />
            <span>Completed ({exams.filter(e => e.status === 'Completed').length})</span>
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold px-4 py-2.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
          id="btn-add-exam-modal"
        >
          <Plus size={16} />
          <span>Schedule Exam</span>
        </button>
      </div>

      {/* KPI Stats Grid Row - Page 24 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="exams-kpi-grid">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Exams</span>
          <span className="text-2xl font-extrabold font-headline block text-slate-900">{exams.length}</span>
          <span className="text-[10px] text-slate-400">All registered blocks</span>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Upcoming</span>
          <span className="text-2xl font-extrabold font-headline block text-indigo-600">{exams.filter(e => e.status === 'Upcoming').length}</span>
          <span className="text-[10px] text-slate-400">Scheduled sessions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed</span>
          <span className="text-2xl font-extrabold font-headline block text-emerald-600">{exams.filter(e => e.status === 'Completed').length}</span>
          <span className="text-[10px] text-slate-400">Results submitted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Average Score</span>
          <span className="text-2xl font-extrabold font-headline block text-slate-900">{averageExamScore}%</span>
          <span className="text-[10px] text-slate-400">Academic median</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Highest Score</span>
          <span className="text-2xl font-extrabold font-headline block text-indigo-700">{highestS}%</span>
          <span className="text-[10px] text-slate-400">Top performance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Countdown</span>
          <span className="text-xs font-extrabold font-headline block text-red-600 truncate mt-2">{nextExamCountdown}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Immediate focus</span>
        </div>
      </div>

      {/* Page 27 Visual Widgets (Study planner, Revision indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="exams-visualizations">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Goals</span>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline">Study Planner & Hours Allocator</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-1">Planned Hrs</span>
                <span className="font-extrabold text-slate-800 text-sm">24 Hrs</span>
              </div>
              <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-1">Completed Hrs</span>
                <span className="font-extrabold text-indigo-600 text-sm">18 Hrs</span>
              </div>
              <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-1">Target Rate</span>
                <span className="font-extrabold text-emerald-600 text-sm">75% Done</span>
              </div>
            </div>

            <div className="space-y-1 text-xs font-sans text-slate-600">
              <div className="flex justify-between items-center">
                <span>Revision Checklist Progress</span>
                <span className="font-bold">85% Complete</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Performance Index</span>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline">Performance by Subject Weight</h4>
          </div>

          <div className="space-y-2 flex-1">
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No registered subjects to analyze.</p>
            ) : (
              subjects.slice(0, 3).map(sub => {
                const subExams = exams.filter(e => e.subjectId === sub.id && e.status === 'Completed');
                let avg = 0;
                if (subExams.length > 0) {
                  const s = subExams.reduce((sum, e) => sum + (e.score || 0), 0);
                  const m = subExams.reduce((sum, e) => sum + e.maxScore, 0);
                  avg = m > 0 ? Math.round((s / m) * 100) : 0;
                } else {
                  avg = 80; // default indicator
                }

                return (
                  <div key={sub.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="font-semibold text-slate-700">{sub.code} &mdash; {sub.name}</span>
                    <span className="font-bold font-mono text-indigo-600">{avg > 0 ? `${avg}% Avg` : 'Active'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Exam Overlay Form */}
      {isOpen && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-150">
            <h4 className="text-sm font-headline font-extrabold text-slate-900">
              {editingExam ? `Modify ${formData.title}` : 'Schedule a Curricular Exam'}
            </h4>
            <button 
              onClick={() => { setIsOpen(false); setEditingExam(null); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-500 font-sans">Exam Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Midterm 1, Final Exam"
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                required
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Course</label>
              <select 
                value={formData.subjectId} 
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 cursor-pointer"
                required
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Date & Hour</label>
              <input 
                type="datetime-local" 
                value={formData.dateTime} 
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 font-sans"
                required
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Room Assigned</label>
              <input 
                type="text" 
                value={formData.room} 
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Sloan Hall Aud"
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Grade Weight (%)</label>
              <input 
                type="number" 
                value={formData.weight} 
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 25%"
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 font-sans"
                min="0"
                max="100"
                required
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Upcoming' | 'Completed' })}
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 cursor-pointer"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed & Graded</option>
              </select>
            </div>

            {formData.status === 'Completed' && (
              <>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-slate-500 font-sans animate-fadeIn">Actual Score</label>
                  <input 
                    type="number" 
                    value={formData.score} 
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="e.g. 88"
                    className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-slate-500 font-sans animate-fadeIn">Maximum Points</label>
                  <input 
                    type="number" 
                    value={formData.maxScore} 
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                    min="1"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-semibold text-slate-500 font-sans">Syllabus Scope & Directions</label>
              <textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="List formulas allowed, chapter scopes, calculators constraints, etc."
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 h-16 resize-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => { setIsOpen(false); setEditingExam(null); }}
                className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 text-white rounded-lg text-xs font-bold px-4 py-1.5 hover:bg-blue-700"
              >
                {editingExam ? 'Save Changes' : 'Schedule Exam'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Exams Cards */}
      {filteredExams.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <BookOpen className="mx-auto text-slate-200 mb-2" size={48} />
          <h3 className="font-bold text-slate-900 mb-1 font-headline">No Exams Scheduled Here</h3>
          <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
            All caught up or cleared! There are no {filterMode.toLowerCase()} exams logged in your records directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExams.map((exam) => {
            const subject = getSubjectInfo(exam.subjectId);
            const colorHex = getSubjectColorHex(exam.subjectId);
            const isPrepActive = activePrepExamId === exam.id;
            const prepList = prepTasks[exam.id] || [];
            const completedCount = prepList.filter(t => t.done).length;

            return (
              <div 
                key={exam.id}
                className="bg-white border border-slate-150 rounded-2xl flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: colorHex }} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <span 
                      className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border shrink-0"
                      style={{ 
                        color: colorHex, 
                        borderColor: `${colorHex}40`, 
                        backgroundColor: `${colorHex}08` 
                      }}
                    >
                      {subject?.code || 'GEN'}
                    </span>

                    <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-slate-500 font-sans">
                      Weight: {exam.weight}%
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-950 font-headline mb-2">{exam.title}</h3>
                  <p className="text-xs text-slate-400 font-sans line-clamp-1 mb-5">{subject?.name}</p>

                  {/* Datetime & Grid Locations */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 mb-5 text-xs text-slate-600 font-sans">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                        <Clock size={11} />
                        <span>Date & Hourly Time</span>
                      </div>
                      <p className="font-semibold text-slate-700 text-xs">
                        {formatDateTimeSafe(exam.dateTime)}
                      </p>
                    </div>

                    <div className="space-y-1 border-l border-slate-200/65 pl-4">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                        <MapPin size={11} />
                        <span>Room / Hall</span>
                      </div>
                      <p className="font-semibold text-slate-700 text-xs truncate">
                        {exam.room || 'TBA / Online'}
                      </p>
                    </div>
                  </div>

                  {exam.notes && (
                    <div className="mb-5 bg-blue-50/35 border border-blue-100/30 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed font-sans">
                      <span className="font-bold text-slate-700 block mb-1">Topics Scope:</span>
                      {exam.notes}
                    </div>
                  )}

                  {/* Preparation Checklist Drawer tool */}
                  {exam.status === 'Upcoming' && (
                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <button 
                        onClick={() => setActivePrepExamId(isPrepActive ? null : exam.id)}
                        className="w-full flex justify-between items-center text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <NotebookTabs size={15} />
                          <span>Interactive Checklist Prep Guide</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600">
                          <span>{completedCount}/{prepList.length} Finished</span>
                          <span>{isPrepActive ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {isPrepActive && (
                        <div className="space-y-2 mt-3 bg-slate-50/40 border border-slate-100 p-3.5 rounded-xl animate-scaleIn">
                          <div className="flex gap-2 mb-2">
                            <input 
                              type="text"
                              value={newTaskInput}
                              onChange={(e) => setNewTaskInput(e.target.value)}
                              placeholder="e.g. Practice Chapter 3 exercises..."
                              className="w-full text-xs bg-white border border-slate-200 outline-none px-2.5 py-1.5 rounded-lg focus:border-blue-500 font-sans"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddPrepTask(exam.id); }}
                            />
                            <button
                              onClick={() => handleAddPrepTask(exam.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold px-3 py-1 font-sans shrink-0"
                            >
                              Add
                            </button>
                          </div>

                          {prepList.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic py-1 text-center font-sans">No tasks added to study guide. Add one above.</p>
                          ) : (
                            <div className="space-y-1.5 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                              {prepList.map((t) => (
                                <div key={t.id} className="flex justify-between items-center text-xs pt-1.5 first:pt-0">
                                  <button
                                    onClick={() => toggleChecklistTask(exam.id, t.id)}
                                    className="flex items-center gap-2 text-left text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                  >
                                    {t.done ? (
                                      <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 hover:border-blue-500 shrink-0" />
                                    )}
                                    <span className={t.done ? "line-through text-slate-400 font-normal" : "font-sans text-slate-700"}>{t.text}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePrepTask(exam.id, t.id)}
                                    className="text-slate-300 hover:text-red-500 text-[10px]"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Exam Grades score box */}
                  {exam.status === 'Completed' && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mb-2 mt-4 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Award size={18} />
                        <span className="font-bold">Scored Achieved:</span>
                      </div>
                      <div className="font-bold text-emerald-800 text-sm">
                        {exam.score !== undefined ? `${exam.score} / ${exam.maxScore}` : 'Pending Score...'}
                        {exam.score !== undefined && (
                          <span className="font-normal text-xs text-emerald-600 font-mono ml-1.5">
                            ({Math.round((exam.score / exam.maxScore) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Actions bar */}
                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Edit Exam"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove exam "${exam.title}"?`)) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 size={14} />
                    </button>
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
