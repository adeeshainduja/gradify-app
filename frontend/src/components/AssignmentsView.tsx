import { useState, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Filter, 
  CheckCircle, 
  X,
  Search,
  Check,
  Award,
  List,
  Kanban,
  ExternalLink
} from 'lucide-react';
import { 
  Subject, 
  Assignment, 
  AssignmentStatus, 
  SUBJECT_COLORS,
  formatDateSafe 
} from '../types';

interface AssignmentsViewProps {
  subjects: Subject[];
  assignments: Assignment[];
  onAddAssignment: (newAssign: Omit<Assignment, 'id'>) => void;
  onUpdateAssignment: (id: string, updated: Partial<Assignment>) => void;
  onDeleteAssignment: (id: string) => void;
  // Trigger open add panel from parent immediately in focus mode
  initialOpenAddForm?: boolean;
}

export default function AssignmentsView({
  subjects,
  assignments,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  initialOpenAddForm = false,
}: AssignmentsViewProps) {
  const [layoutMode, setLayoutMode] = useState<'list' | 'kanban'>('list');
  const [isOpen, setIsOpen] = useState(initialOpenAddForm);
  const [editingAssign, setEditingAssign] = useState<Assignment | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | AssignmentStatus>('all');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending' as AssignmentStatus,
    score: '',
    maxScore: '100',
    weight: '10',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
  });

  const getSubjectInfo = (subId: string) => {
    return subjects.find(s => s.id === subId);
  };

  const getSubjectColorHex = (subId: string) => {
    const sub = getSubjectInfo(subId);
    if (!sub) return '#64748b';
    const conf = SUBJECT_COLORS.find(c => c.value === sub.color);
    return conf ? conf.hex : '#3b82f6';
  };

  const handleOpenAdd = () => {
    setEditingAssign(null);
    setFormData({
      title: '',
      subjectId: subjects[0]?.id || '',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      score: '',
      maxScore: '100',
      weight: '10',
      description: '',
      priority: 'Medium',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (assign: Assignment) => {
    setEditingAssign(assign);
    setFormData({
      title: assign.title,
      subjectId: assign.subjectId,
      dueDate: assign.dueDate,
      status: assign.status,
      score: assign.score?.toString() || '',
      maxScore: assign.maxScore.toString(),
      weight: assign.weight.toString(),
      description: assign.description || '',
      priority: assign.priority || 'Medium',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subjectId) return;

    const parsedScore = formData.score !== '' ? parseFloat(formData.score) : undefined;
    const parsedMaxScore = parseFloat(formData.maxScore) || 100;
    const parsedWeight = parseFloat(formData.weight) || 0;

    const dataPayload = {
      title: formData.title.trim(),
      subjectId: formData.subjectId,
      dueDate: formData.dueDate,
      status: formData.status,
      score: formData.status === 'Graded' ? parsedScore : undefined,
      maxScore: parsedMaxScore,
      weight: parsedWeight,
      description: formData.description.trim(),
      priority: formData.priority,
    };

    if (editingAssign) {
      onUpdateAssignment(editingAssign.id, dataPayload);
    } else {
      onAddAssignment(dataPayload);
    }

    setIsOpen(false);
    setEditingAssign(null);
  };

  // Status transitions
  const advanceStatus = (id: string, current: AssignmentStatus) => {
    let next: AssignmentStatus = 'Pending';
    if (current === 'Pending') next = 'Submitted';
    else if (current === 'Submitted') next = 'Graded';
    else next = 'Pending';

    // If marked as graded, prompt score builder or default to max
    const partialUpdate: Partial<Assignment> = { status: next };
    if (next === 'Graded') {
      const assign = assignments.find(a => a.id === id);
      partialUpdate.score = assign?.score || assign?.maxScore || 100;
    }

    onUpdateAssignment(id, partialUpdate);
  };

  const handleScoreGradeDirect = (id: string, scoreStr: string, maxScore: number) => {
    const sc = scoreStr === '' ? undefined : parseFloat(scoreStr);
    onUpdateAssignment(id, { score: sc, status: 'Graded', maxScore });
  };

  // Filter application
  const filteredAssignments = assignments.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectId === 'all' || item.subjectId === selectedSubjectId;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Kanban boards columns definition
  const columns: { label: string; status: AssignmentStatus; colorClass: string }[] = [
    { label: 'To Do / Pending', status: 'Pending', colorClass: 'border-t-amber-500 bg-amber-500/5' },
    { label: 'Completed / Submitted', status: 'Submitted', colorClass: 'border-t-blue-500 bg-blue-500/5' },
    { label: 'Completed & Graded', status: 'Graded', colorClass: 'border-t-emerald-500 bg-emerald-500/5' }
  ];

  // KPI Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const totalCount = assignments.length;
  const pendingCount = assignments.filter(a => a.status === 'Pending').length;
  const completedCount = assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
  
  const overdueCount = assignments.filter(a => {
    return a.status === 'Pending' && a.dueDate < todayStr;
  }).length;
  
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Upcoming This Week
  const getUpcomingThisWeekCount = () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return assignments.filter(a => {
      if (a.status !== 'Pending') return false;
      const dDate = new Date(a.dueDate);
      return dDate >= now && dDate <= nextWeek;
    }).length;
  };
  const upcomingThisWeekCount = getUpcomingThisWeekCount();

  // Upcoming nearest deadlines widget (Top 3 nearest)
  const nearestDeadlines = [...assignments]
    .filter(a => a.status === 'Pending')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Priority matrix counts (Page 16/17 parameters)
  const priorityCounts = { High: 0, Medium: 0, Low: 0 };
  assignments.forEach(a => {
    if (a.status === 'Pending') {
      if (a.priority === 'High') priorityCounts.High++;
      else if (a.priority === 'Medium') priorityCounts.Medium++;
      else priorityCounts.Low++;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Title block and action links */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setLayoutMode('list')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              layoutMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List size={14} />
            <span>List & Filters</span>
          </button>
          <button
            onClick={() => setLayoutMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              layoutMode === 'kanban' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Kanban size={14} />
            <span>Kanban Board</span>
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold px-4 py-2.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
          id="btn-add-assignment-modal"
        >
          <Plus size={16} />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* KPI Stats Cards - Page 13 Requirements */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="assignments-kpis">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Tasks</span>
          <span className="text-2xl font-extrabold font-headline text-slate-900 block">{totalCount}</span>
          <span className="text-[10px] text-slate-400">Total registered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pending</span>
          <span className="text-2xl font-extrabold font-headline text-slate-900 block">{pendingCount}</span>
          <span className="text-[10px] text-amber-600 font-semibold">{priorityCounts.High} critical priority</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completed</span>
          <span className="text-2xl font-extrabold font-headline text-emerald-600 block">{completedCount}</span>
          <span className="text-[10px] text-slate-400">Submissions graded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Overdue</span>
          <span className="text-2xl font-extrabold font-headline text-red-600 block">{overdueCount}</span>
          <span className="text-[10px] text-slate-400">Passed deadline</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Completion Rate</span>
          <span className="text-2xl font-extrabold font-headline block text-indigo-700">{completionRate}%</span>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Due This Week</span>
          <span className="text-2xl font-extrabold font-headline text-slate-900 block">{upcomingThisWeekCount}</span>
          <span className="text-[10px] text-indigo-600 font-semibold">Immediate attention</span>
        </div>
      </div>

      {/* Page 16: Analytics Section (Workload & Deadlines Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="assignments-visuals">
        
        {/* Left widget: Completion rate by subjects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Progression Metric</span>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline">Completion Rate by Subject</h4>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No enrolled subjects to track metrics.</p>
            ) : (
              subjects.slice(0, 4).map(sub => {
                const subAssigns = assignments.filter(a => a.subjectId === sub.id);
                const subCompleted = subAssigns.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
                const ratio = subAssigns.length > 0 ? Math.round((subCompleted / subAssigns.length) * 100) : 0;
                
                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{sub.code} &mdash; {sub.name}</span>
                      <span className="text-slate-500 font-mono text-xs">{subCompleted} / {subAssigns.length} Done ({ratio}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${ratio}%`, backgroundColor: getSubjectColorHex(sub.id) }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right widget: Priority Matrix & Nearest Deadlines List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Task Allocation</span>
            <h4 className="font-extrabold text-sm text-slate-900 font-headline">Upcoming Critical Deadlines</h4>
          </div>

          <div className="space-y-3 flex-1">
            {nearestDeadlines.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs italic">
                No upcoming pending deadlines left! Excellent job.
              </div>
            ) : (
              <div className="space-y-2">
                {nearestDeadlines.map(a => {
                  const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
                  const isHigh = a.priority === 'High';
                  
                  return (
                    <div key={a.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-red-500 animate-ping' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-slate-700 truncate max-w-[160px]">{a.title}</span>
                      </div>
                      <span className={`font-semibold font-mono px-2 py-0.5 rounded text-[10px] ${daysLeft <= 2 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {daysLeft <= 0 ? 'Due Today' : `${daysLeft} Days Remain`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>PRIORITY GRID COUNT</span>
              <div className="flex gap-2">
                <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">High: {priorityCounts.High}</span>
                <span className="text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Medium: {priorityCounts.Medium}</span>
                <span className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Low: {priorityCounts.Low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Add/Edit Form Overlay */}
      {isOpen && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 font-headline">
              {editingAssign ? 'Modify Course Task / Assignment' : 'Add New Curricular Assignment'}
            </h4>
            <button 
              onClick={() => { setIsOpen(false); setEditingAssign(null); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 font-sans">Task / Assignment Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Lab 2: Assembly Bomb or History Essay"
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Subject Course</label>
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

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Due Date</label>
              <input 
                type="date" 
                value={formData.dueDate} 
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 font-sans"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Syllabus weight (%)</label>
              <input 
                type="number" 
                value={formData.weight} 
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 10%"
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 font-sans"
                min="0"
                max="100"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Task Priority</label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 cursor-pointer"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-slate-500 font-sans">Workflow Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssignmentStatus })}
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 cursor-pointer"
              >
                <option value="Pending">Pending / To Do</option>
                <option value="Submitted">Submitted / Completed</option>
                <option value="Graded">Graded (Log Grade)</option>
              </select>
            </div>

            {formData.status === 'Graded' && (
              <>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-semibold text-slate-500 font-sans animate-fadeIn">Grade Earned</label>
                  <input 
                    type="number" 
                    value={formData.score} 
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="e.g. 95"
                    className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-1.5 col-span-1 border-teal-100">
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
              <label className="text-xs font-semibold text-slate-500 font-sans">Task Description / Instructions</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="List assignment parameters, rubric scopes, resource links, etc."
                className="w-full text-xs bg-white border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 h-16 resize-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => { setIsOpen(false); setEditingAssign(null); }}
                className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 text-white rounded-lg text-xs font-bold px-4 py-1.5 hover:bg-blue-700"
              >
                {editingAssign ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Options (Only shown in list view, though useful in both) */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100 w-full md:max-w-sm">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-xs text-slate-800 outline-none w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Filter by subject */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold uppercase">Course:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 w-full sm:w-40 cursor-pointer"
            >
              <option value="all">All Courses</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code}</option>
              ))}
            </select>
          </div>

          {/* Filter by status */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 w-full sm:w-40 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending / To Do</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
            </select>
          </div>
        </div>
      </div>

      {/* layout condition rendering */}
      {layoutMode === 'list' ? (
        // List Layout
        filteredAssignments.length === 0 ? (
          <div className="bg-white border rounded-2xl p-16 text-center text-slate-400 shadow-sm">
            <Filter className="mx-auto text-slate-200 mb-2" size={48} />
            <h3 className="font-bold text-slate-900 mb-1 font-headline">No Matching Tasks</h3>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              Your search filters came up empty. Reset parameters or add a task to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-sans select-none">
                    <th className="p-4 font-bold uppercase tracking-wider">Task Info</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Course</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Grade (Score)</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Weight %</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Due Date</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Workflow Status</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredAssignments.map((assign) => {
                    const linkedSub = getSubjectInfo(assign.subjectId);
                    const colorHex = getSubjectColorHex(assign.subjectId);

                    return (
                      <tr key={assign.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-slate-900 font-headline text-sm block">{assign.title}</span>
                            <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{assign.description || 'No description listed.'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span 
                            className="font-mono text-xs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border"
                            style={{ 
                              color: colorHex, 
                              borderColor: `${colorHex}40`, 
                              backgroundColor: `${colorHex}08` 
                            }}
                          >
                            {linkedSub?.code || 'GEN100'}
                          </span>
                        </td>
                        <td className="p-4">
                          {assign.status === 'Graded' ? (
                            <div className="flex items-center gap-1.5">
                              <Award size={14} className="text-emerald-500 shrink-0" />
                              <span className="font-semibold text-slate-800">
                                {assign.score !== undefined ? assign.score : '--'}
                              </span>
                              <span className="text-slate-400">/ {assign.maxScore}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({Math.round(((assign.score || 0) / assign.maxScore) * 100)}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not graded</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold font-mono text-slate-600">{assign.weight}%</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{formatDateSafe(assign.dueDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => advanceStatus(assign.id, assign.status)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border select-none transition-all cursor-pointer ${
                              assign.status === 'Graded' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              assign.status === 'Submitted' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                              'bg-amber-50 border-amber-200 text-amber-700'
                            }`}
                            title="Click to advance status"
                          >
                            <span>{assign.status}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleOpenEdit(assign)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete assignment "${assign.title}"?`)) {
                                  onDeleteAssignment(assign.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
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
        )
      ) : (
        // Kanban Layout board
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = filteredAssignments.filter(a => a.status === col.status);
            return (
              <div 
                key={col.status} 
                className={`rounded-2xl border border-slate-150 p-4 space-y-4 flex flex-col min-h-[500px] border-t-4 ${col.colorClass}`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                  <h4 className="font-bold text-slate-900 font-headline text-sm">{col.label}</h4>
                  <span className="text-xs bg-white border border-slate-150 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200/50 rounded-xl">
                      Empty column
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const linkedSub = getSubjectInfo(task.subjectId);
                      const colorHex = getSubjectColorHex(task.subjectId);

                      return (
                        <div 
                          key={task.id}
                          className="bg-white border border-slate-150 p-4 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colorHex }} />

                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span 
                                className="font-mono text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider"
                                style={{ 
                                  color: colorHex, 
                                  border: `1px solid ${colorHex}50`, 
                                  backgroundColor: `${colorHex}08` 
                                }}
                              >
                                {linkedSub?.code || 'GEN'}
                              </span>
                              
                              <p className="text-[10px] text-slate-400 font-sans">{formatDateSafe(task.dueDate)}</p>
                            </div>

                            <h5 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{task.title}</h5>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 italic font-sans">{task.description || 'No instruction notes listed.'}</p>
                          </div>

                          {/* Grade scores panel builder */}
                          {task.status === 'Graded' && (
                            <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 uppercase font-bold font-sans">Assignment Grade</span>
                                <span className="font-bold text-emerald-600">({Math.round(((task.score || 0) / task.maxScore) * 100)}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-sans">Score:</span>
                                <input
                                  type="number"
                                  value={task.score !== undefined ? task.score : ''}
                                  onChange={(e) => handleScoreGradeDirect(task.id, e.target.value, task.maxScore)}
                                  className="w-14 bg-white border border-slate-200 focus:border-emerald-500 outline-none p-1 rounded font-mono font-bold text-xs"
                                  placeholder="Score"
                                  min="0"
                                />
                                <span className="text-xs text-slate-400 font-sans">/ {task.maxScore}</span>
                              </div>
                            </div>
                          )}

                          <div className="border-t border-slate-50 pt-2.5 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-sans">Weight: <strong className="font-bold text-slate-600 font-mono">{task.weight}%</strong></span>
                            
                            <div className="flex gap-1">
                              {/* Workflow advance controller block */}
                              <button
                                onClick={() => advanceStatus(task.id, task.status)}
                                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                title="Move to next workflow phase"
                              >
                                <ExternalLink size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => onDeleteAssignment(task.id)}
                                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
