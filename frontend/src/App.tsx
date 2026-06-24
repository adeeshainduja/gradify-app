import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SemestersView from './components/SemestersView';
import SubjectsView from './components/SubjectsView';
import AssignmentsView from './components/AssignmentsView';
import ExamsView from './components/ExamsView';
import GpaAnalyticsView from './components/GpaAnalyticsView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import { useAuth } from './context/AuthContext';

// Import baseline preloaded data & types
import {
  Semester,
  Subject,
  Assignment,
  Exam,
  UserProfile,
  Notification,
  INITIAL_PROFILE,
  INITIAL_SEMESTERS,
  INITIAL_SUBJECTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EXAMS,
  INITIAL_NOTIFICATIONS,
  AssignmentStatus
} from './types';

// Icons for custom widgets when needed
import { Bell, Search, Star, LogOut, CheckCircle2, Sun, Moon, Menu } from 'lucide-react';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch {}
  }
};

export default function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = safeStorage.getItem('gradify_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeStorage.setItem('gradify_theme', theme);
  }, [theme]);

  // SAFE INITIALIZATION HANDLERS FOR LOCAL STORAGE PERSISTENCE
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = safeStorage.getItem('gradify_semesters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SEMESTERS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = safeStorage.getItem('gradify_subjects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_SUBJECTS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = safeStorage.getItem('gradify_assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_ASSIGNMENTS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = safeStorage.getItem('gradify_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_EXAMS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = safeStorage.getItem('gradify_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && typeof parsed.name === 'string') {
          return {
            name: parsed.name,
            major: parsed.major || INITIAL_PROFILE.major,
            university: parsed.university || INITIAL_PROFILE.university,
            targetGpa: typeof parsed.targetGpa === 'number' ? parsed.targetGpa : INITIAL_PROFILE.targetGpa,
            gpaScale: (parsed.gpaScale === 4.0 || parsed.gpaScale === 5.0) ? parsed.gpaScale : INITIAL_PROFILE.gpaScale,
            avatarUrl: parsed.avatarUrl
          };
        }
      }
    } catch {}
    return INITIAL_PROFILE;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = safeStorage.getItem('gradify_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // State to control prompt when quick-add is initiated on dashboard
  const [forceOpenAssignmentForm, setForceOpenAssignmentForm] = useState(false);

  // CACHING SYNC EFFECTS
  useEffect(() => {
    safeStorage.setItem('gradify_semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    safeStorage.setItem('gradify_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    safeStorage.setItem('gradify_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    safeStorage.setItem('gradify_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    safeStorage.setItem('gradify_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    safeStorage.setItem('gradify_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // SYSTEM LOG UTILITY FOR NOTIFICATION TRIGGERS
  const triggerNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const alert: Notification = {
      id: `sys-${Math.random().toString()}`,
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [alert, ...prev]);
  };

  // ----- SEMESTERS CRUDS -----
  const handleAddSemester = (name: string, year: number, isCurrent: boolean) => {
    const newSem: Semester = {
      id: `sem-${Math.random().toString()}`,
      name,
      year,
      isCurrent: false // Will set cleanly below if true
    };

    let updatedSemesters = [...semesters, newSem];
    if (isCurrent) {
      updatedSemesters = updatedSemesters.map(s => s.id === newSem.id ? { ...s, isCurrent: true } : { ...s, isCurrent: false });
    }
    setSemesters(updatedSemesters);
    triggerNotification('Semester Created', `Semester ${name} was added to curriculum ledger.`, 'success');
  };

  const handleUpdateSemester = (id: string, name: string, year: number, isCurrent: boolean) => {
    setSemesters(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, name, year, isCurrent } : s);
      if (isCurrent) {
        return updated.map(s => s.id === id ? { ...s, isCurrent: true } : { ...s, isCurrent: false });
      }
      return updated;
    });
    triggerNotification('Semester Updated', `Semester details for ${name} were revised.`, 'info');
  };

  const handleDeleteSemester = (id: string) => {
    const target = semesters.find(s => s.id === id);
    setSemesters(prev => prev.filter(s => s.id !== id));
    // Cascade erase subjects, assignments, and exams mapping to this semester
    const targetSubIds = subjects.filter(s => s.semesterId === id).map(s => s.id);
    setSubjects(prev => prev.filter(s => s.semesterId !== id));
    setAssignments(prev => prev.filter(a => !targetSubIds.includes(a.subjectId)));
    setExams(prev => prev.filter(e => !targetSubIds.includes(e.subjectId)));
    
    triggerNotification('Semester Wiped', `Erase operations deleted ${target?.name || 'semester'} and its course credentials cascading.`, 'warning');
  };

  const handleSetCurrentSemester = (id: string) => {
    const target = semesters.find(s => s.id === id);
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, isCurrent: true } : { ...s, isCurrent: false }));
    triggerNotification('Active Period Changed', `Active workbook pointer switched to ${target?.name || 'selected semester'}.`, 'info');
  };

  // ----- SUBJECTS CRUDS -----
  const handleAddSubject = (newSub: Omit<Subject, 'id'>) => {
    const payload: Subject = {
      ...newSub,
      id: `sub-${Math.random().toString()}`
    };
    setSubjects(prev => [...prev, payload]);
    triggerNotification('Course Registered', `Curricular record for ${newSub.code}: ${newSub.name} created.`, 'success');
  };

  const handleUpdateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    triggerNotification('Course Adjusted', `Specifications for course ${updated.code || 'selected template'} updated.`, 'info');
  };

  const handleDeleteSubject = (id: string) => {
    const target = subjects.find(s => s.id === id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    // Cascade erase assignments & exams referencing this course
    setAssignments(prev => prev.filter(a => a.subjectId !== id));
    setExams(prev => prev.filter(e => e.subjectId !== id));

    triggerNotification('Course Deleted', `Removed course ${target?.code || ''} and its associated graded credentials.`, 'warning');
  };

  // ----- ASSIGNMENTS CRUDS -----
  const handleAddAssignment = (newAssign: Omit<Assignment, 'id'>) => {
    const payload: Assignment = {
      ...newAssign,
      id: `assign-${Math.random().toString()}`
    };
    setAssignments(prev => [payload, ...prev]);
    triggerNotification('Task Scheduled', `Assignment "${newAssign.title}" logged in tasks workbook.`, 'info');
  };

  const handleUpdateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleDeleteAssignment = (id: string) => {
    const target = assignments.find(a => a.id === id);
    setAssignments(prev => prev.filter(a => a.id !== id));
    triggerNotification('Task Cleared', `Wiped item "${target?.title}" from curricular registry.`, 'warning');
  };

  const handleQuickToggleAssignment = (id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        let nextStatus: AssignmentStatus = 'Pending';
        let updatedScore = a.score;
        if (a.status === 'Pending') {
          nextStatus = 'Submitted';
          triggerNotification('Task Completed', `Submitted assignment "${a.title}". Nice progress!`, 'success');
        } else if (a.status === 'Submitted') {
          nextStatus = 'Graded';
          updatedScore = a.maxScore; // Default to max points for quick toggles
          triggerNotification('Grade Scored', `Assignment "${a.title}" graded. Complete details in Assignments panel.`, 'success');
        } else {
          nextStatus = 'Pending';
          updatedScore = undefined;
        }
        return { ...a, status: nextStatus, score: updatedScore };
      }
      return a;
    }));
  };

  // ----- EXAMS CRUDS -----
  const handleAddExam = (newExam: Omit<Exam, 'id'>) => {
    const payload: Exam = {
      ...newExam,
      id: `exam-${Math.random().toString()}`
    };
    setExams(prev => [...prev, payload]);
    triggerNotification('Exam Listed', `Scheduled: ${newExam.title}. Ready for preparation checks.`, 'success');
  };

  const handleUpdateExam = (id: string, updated: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    if (updated.status === 'Completed' && updated.score !== undefined) {
      const exam = exams.find(ex => ex.id === id);
      triggerNotification('Exam Completed', `Recorded score ${updated.score}/${exam?.maxScore || 100} for ${exam?.title}.`, 'success');
    }
  };

  const handleDeleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    triggerNotification('Exam Cancelled', 'Cleared examination event parameters.', 'info');
  };

  // ----- PROFILE SETTINGS -----
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    triggerNotification('Academic Identity Upgraded', 'System variables compiled to your new student targets.', 'success');
  };

  // ----- NOTIFICATIONS CRUDS -----
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    triggerNotification('Directory Cleared', 'Marked all system alerts as read.', 'info');
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ----- GLOBAL DATA CONTROL UTILITIES -----
  const handleResetData = () => {
    setSemesters(INITIAL_SEMESTERS);
    setSubjects(INITIAL_SUBJECTS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setExams(INITIAL_EXAMS);
    setProfile(INITIAL_PROFILE);
    setNotifications(INITIAL_NOTIFICATIONS);
    triggerNotification('System Restoration', 'Database has been wiped back to preloaded curriculums.', 'info');
  };

  const handleExportData = () => {
    const exportPacket = {
      semesters,
      subjects,
      assignments,
      exams,
      profile,
      notifications
    };
    return JSON.stringify(exportPacket, null, 2);
  };

  const handleRestoreImportData = (rawJson: string): boolean => {
    try {
      const parsed = JSON.parse(rawJson);
      
      // Structural integrity validations
      if (
        Array.isArray(parsed.semesters) &&
        Array.isArray(parsed.subjects) &&
        Array.isArray(parsed.assignments) &&
        Array.isArray(parsed.exams) &&
        parsed.profile
      ) {
        setSemesters(parsed.semesters);
        setSubjects(parsed.subjects);
        setAssignments(parsed.assignments);
        setExams(parsed.exams);
        setProfile(parsed.profile);
        if (Array.isArray(parsed.notifications)) {
          setNotifications(parsed.notifications);
        }
        triggerNotification('Database Swapped', 'Restored complete database parameters successfully.', 'success');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Dashboard quick triggers redirect to Assignments + force Open form
  const handleAddAssignmentQuickTrigger = () => {
    setForceOpenAssignmentForm(true);
    setActiveView('Assignments');
  };

  // Render the currently selected sub-view
  const renderContentView = () => {
    switch (activeView) {
      case 'Dashboard':
        return (
          <DashboardView
            semesters={semesters}
            subjects={subjects}
            assignments={assignments}
            exams={exams}
            profile={profile}
            setActiveView={setActiveView}
            onQuickToggleAssignment={handleQuickToggleAssignment}
            onAddAssignmentQuick={handleAddAssignmentQuickTrigger}
          />
        );
      case 'Semesters':
        return (
          <SemestersView
            semesters={semesters}
            subjects={subjects}
            onAddSemester={handleAddSemester}
            onUpdateSemester={handleUpdateSemester}
            onDeleteSemester={handleDeleteSemester}
            onSetCurrentSemester={handleSetCurrentSemester}
          />
        );
      case 'Subjects':
        return (
          <SubjectsView
            semesters={semesters}
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        );
      case 'Assignments':
        return (
          <AssignmentsView
            subjects={subjects}
            assignments={assignments}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            initialOpenAddForm={forceOpenAssignmentForm}
          />
        );
      case 'Exams':
        return (
          <ExamsView
            subjects={subjects}
            exams={exams}
            onAddExam={handleAddExam}
            onUpdateExam={handleUpdateExam}
            onDeleteExam={handleDeleteExam}
          />
        );
      case 'GPA & Analytics':
        return (
          <GpaAnalyticsView
            semesters={semesters}
            subjects={subjects}
            profile={profile}
          />
        );
      case 'Notifications':
        return (
          <NotificationsView
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClearAll={handleClearAll}
            onDeleteNotification={handleDeleteNotification}
          />
        );
      case 'Profile':
      case 'Settings':
        return (
          <ProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onRestoreImportData={handleRestoreImportData}
            onExportData={handleExportData}
          />
        );
      case 'Logout':
        return (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 max-w-lg mx-auto shadow-sm">
            <LogOut className="text-red-500 mx-auto mb-3" size={40} />
            <h3 className="text-xl font-bold font-headline text-slate-900 mb-2">Simulate Exit session</h3>
            <p className="text-xs text-slate-400 font-sans mb-6">
              Logout clears temporary memory caches. Because persistent state is cached, your local changes are saved on this client.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  safeStorage.clear();
                  window.location.reload();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Clear Cache &amp; Reset App
              </button>
              <button
                onClick={() => setActiveView('Dashboard')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return <div className="p-4">Under Construction</div>;
    }
  };

  // Sync state variables whenever redirected from other views
  useEffect(() => {
    if (activeView !== 'Assignments') {
      setForceOpenAssignmentForm(false);
    }
  }, [activeView]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Auth gate — show login/register until JWT user is loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading Gradify...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <RegisterView onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginView onNavigateRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Pane */}
      <main className="flex-1 ml-0 md:ml-64 p-4 sm:p-8 min-h-screen max-w-7xl w-full overflow-x-hidden">
        
        {/* Real-time Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-slate-950">{activeView}</h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Welcome back to your academic workbook tracker.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0 cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon size={20} className="text-slate-500" /> : <Sun size={20} className="text-amber-400 hover:text-amber-300" />}
            </button>

            {/* Direct alert icons helper */}
            <button
              onClick={() => setActiveView('Notifications')}
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Notifications Center"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white select-none animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveView('Profile')}
              className="flex items-center gap-2.5 text-left hover:bg-slate-100/50 p-1 px-2 rounded-xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block font-sans">
                  {user ? `${user.firstName} ${user.lastName}` : profile.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans truncate max-w-[120px]">
                  {user ? user.role?.name : profile.major}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border border-blue-200 flex items-center justify-center font-black text-white text-sm shrink-0 shadow-xs">
                {user
                  ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
                  : profile.name.substring(0, 2).toUpperCase()
                }
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic visual view rendering */}
        <section className="animate-fadeIn">
          {renderContentView()}
        </section>

      </main>
    </div>
  );
}
