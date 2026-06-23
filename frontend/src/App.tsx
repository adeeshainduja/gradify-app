import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SemestersView } from './components/SemestersView';
import { SubjectsView } from './components/SubjectsView';
import { AssignmentsView } from './components/AssignmentsView';
import { ExamsView } from './components/ExamsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { NotificationsPanel } from './components/NotificationsPanel';
import { NotificationCenterView } from './components/NotificationCenterView';
import { LoginView } from './components/LoginView';

import { 
  UserProfile, 
  Semester, 
  Subject, 
  Assignment, 
  Exam, 
  NotificationItem, 
  AcademicGoal, 
  ActivityLog 
} from './types';

import { 
  INITIAL_PROFILE, 
  INITIAL_SEMESTERS, 
  INITIAL_SUBJECTS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_EXAMS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_GOALS, 
  INITIAL_LOGS 
} from './data';

export default function App() {
  // --- Persistent Local Database State ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gradify_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('gradify_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('gradify_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('gradify_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('gradify_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('gradify_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [goals, setGoals] = useState<AcademicGoal[]>(() => {
    const saved = localStorage.getItem('gradify_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('gradify_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Active View Tab and Semester Context
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentSemesterId, setCurrentSemesterId] = useState('sem-5');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ssp_is_logged_in') === 'true';
  });

  // --- Sync database to localStorage on modifications ---
  useEffect(() => {
    localStorage.setItem('gradify_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('gradify_semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('gradify_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('gradify_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('gradify_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('gradify_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('gradify_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('gradify_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // --- Dynamic GPAs & Statistics Recalculator engine ---
  useEffect(() => {
    // 1. Calculate SGPA of Active/Simulated Term
    const termSubjects = subjects.filter(sub => sub.semesterId === currentSemesterId);
    if (termSubjects.length === 0) return;

    let totalCredits = 0;
    let earnedHonorPoints = 0;

    const translateToPoint = (val: number): number => {
      if (val >= 93) return 4.0;
      if (val >= 90) return 3.7;
      if (val >= 87) return 3.3;
      if (val >= 83) return 3.0;
      if (val >= 80) return 2.7;
      if (val >= 77) return 2.3;
      if (val >= 73) return 2.0;
      if (val >= 70) return 1.7;
      return 1.0;
    };

    termSubjects.forEach(s => {
      const point = translateToPoint(s.score);
      earnedHonorPoints += point * s.credits;
      totalCredits += s.credits;
    });

    const calculatedSgpa = totalCredits > 0 ? (earnedHonorPoints / totalCredits) : 0.0;
    const roundedSgpa = Math.round(calculatedSgpa * 100) / 100;

    // 2. Update current Semester SGPA in semesters list
    let updatedSemesters = semesters.map(sem => {
      if (sem.id === currentSemesterId) {
        return {
          ...sem,
          sgpa: roundedSgpa,
          totalCredits: totalCredits,
          creditsEarned: termSubjects.filter(sub => sub.score >= 50).reduce((sm, sb) => sm + sb.credits, 0)
        };
      }
      return sem;
    });

    // 3. Compute overall Cumulative GP (CGPA) from completed + active semesters list
    const activeCompletedSemesters = updatedSemesters.filter(s => s.status === 'completed' || s.id === currentSemesterId);
    let sumSgpa = 0;
    let countedTerms = 0;
    activeCompletedSemesters.forEach(s => {
      if (s.sgpa > 0) {
        sumSgpa += s.sgpa;
        countedTerms += 1;
      }
    });

    const calculatedCgpa = countedTerms > 0 ? Math.round((sumSgpa / countedTerms) * 100) / 100 : 3.78;

    // Update state synchronously
    setSemesters(updatedSemesters);
    setProfile(prev => ({
      ...prev,
      gpa: roundedSgpa,
      cgpa: calculatedCgpa
    }));

  }, [subjects, currentSemesterId]);

  // --- Dynamic Actions Helpers ---

  const addLog = (title: string, description: string, type: 'gpa' | 'submission' | 'preference' | 'exam') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title,
      description,
      timestamp: "Just now",
      type
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  const triggerNotification = (title: string, message: string, category: 'assignments' | 'exams' | 'gpa' | 'goals' | 'system', priority: 'low' | 'high' | 'critical') => {
    const newNotification: NotificationItem = {
      id: `not-${Date.now()}`,
      title,
      message,
      timeLabel: "Just now",
      priority,
      category,
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // 1. Semester View Actions
  const handleAddSemester = (
    name: string, 
    duration: string, 
    totalCredits: number, 
    expectedSgpa: number, 
    status: 'completed' | 'active' | 'upcoming',
    academicYear?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      name,
      duration,
      status,
      subjectsCount: 0,
      creditsEarned: status === 'completed' ? totalCredits : 0,
      sgpa: expectedSgpa,
      totalCredits,
      completionRate: status === 'completed' ? 100 : 0,
      academicYear: academicYear || new Date().getFullYear().toString(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      isArchived: false
    };
    setSemesters(prev => [...prev, newSem]);
    addLog("Semester Added", `Registered ${name} inside the portal.`, "preference");
    triggerNotification("Semester Scheduled", `Successfully added ${name} trajectory goals.`, "system", "low");
  };

  const handleUpdateSemester = (updatedSem: Semester) => {
    setSemesters(prev => prev.map(s => s.id === updatedSem.id ? updatedSem : s));
    addLog("Semester Updated", `Updated ${updatedSem.name} details successfully.`, "preference");
  };

  const handleDeleteSemester = (id: string) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
    addLog("Semester Deleted", `Removed semester context allocation.`, "preference");
  };

  // 2. Course View Actions
  const handleAddSubject = (
    code: string, 
    name: string, 
    credits: number, 
    lecturer: string, 
    score: number, 
    status: 'active' | 'completed' | 'upcoming',
    targetSemesterId?: string,
    description?: string
  ) => {
    const trans = (val: number): string => {
      if (val >= 93) return 'A';
      if (val >= 90) return 'A-';
      if (val >= 87) return 'B+';
      if (val >= 83) return 'B';
      if (val >= 80) return 'B-';
      return 'C';
    };
    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      code,
      name,
      credits,
      lecturer,
      grade: trans(score),
      score,
      progress: status === 'completed' ? 100 : 85,
      status,
      semesterId: targetSemesterId || currentSemesterId,
      assignmentsProgress: status === 'completed' ? 100 : 85,
      quizzesProgress: status === 'completed' ? 100 : 80,
      midExamProgress: status === 'completed' ? 100 : 90,
      description: description || ""
    };
    setSubjects(prev => [...prev, newSub]);
    addLog("Course Added", `Added course ${code} under designated semester.`, "preference");
    triggerNotification("Course Assigned", `Registered ${code}: ${name} to your tracking portfolio.`, "system", "low");
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    addLog("Course Removed", `Archived course metrics successfully.`, "preference");
  };

  const handleUpdateSubjectGrade = (id: string, score: number, grade: string, assignmentsProgress: number, quizzesProgress: number, midExamProgress: number) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          score,
          grade,
          assignmentsProgress,
          quizzesProgress,
          midExamProgress
        };
      }
      return sub;
    }));
    addLog("Grade Simulated", `Slid evaluation metric inputs to forecast overall scores.`, "gpa");
  };

  // 3. Assignment View Actions
  const handleAddAssignment = (title: string, subjectId: string, dueDate: string, priority: 'low' | 'medium' | 'high' | 'critical', isGroup: boolean) => {
    const subject = subjects.find(s => s.id === subjectId);
    const newAsm: Assignment = {
      id: `asm-${Date.now()}`,
      title,
      subjectId,
      subjectName: subject ? subject.name : "Unassigned",
      dueDate,
      progress: 0,
      status: 'pending',
      priority,
      isGroup
    };
    setAssignments(prev => [newAsm, ...prev]);
    addLog("Assignment Created", `Assembled homework assignment titled: ${title}`, "submission");
    triggerNotification("New Task Added", `Deadline set for ${dueDate}. Keep active!`, "assignments", "high");
  };

  const handleUpdateAssignmentStatus = (id: string, status: 'pending' | 'in_progress' | 'completed' | 'overdue', progress: number) => {
    setAssignments(prev => prev.map(asm => {
      if (asm.id === id) {
        return { ...asm, status, progress };
      }
      return asm;
    }));
    addLog("Task State Modified", `Transferred homework assignment checkpoints.`, "submission");
    if (status === 'completed') {
      triggerNotification("Task Completed 🎉", `Pushed assignment goals to finished. Good work!`, "assignments", "low");
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    addLog("Task Archived", `Dropped planned task.`, "submission");
  };

  // 4. Exam Calendar Actions
  const handleAddExam = (subjectId: string, type: string, date: string, timeRange: string, venue: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      subjectId,
      subjectName: subject ? subject.name : "Elective Course",
      subjectCode: subject ? subject.code : "EL-000",
      type,
      date,
      timeRange,
      venue,
      status: 'upcoming'
    };
    setExams(prev => [...prev, newExam]);
    addLog("Exam Allocated", `Scheduled ${type} calendar slot.`, "exam");
    triggerNotification("Exam Slated", `Set schedule countdown for ${subject ? subject.code : 'test'}.`, "exams", "high");
  };

  const handleUpdateExamGrade = (id: string, score: number, grade: string) => {
    setExams(prev => prev.map(ex => {
      if (ex.id === id) {
        return {
          ...ex,
          score,
          grade,
          status: 'completed'
        };
      }
      return ex;
    }));
    addLog("Exam Score Filed", `Assigned grade score of ${score}% to closed test slot.`, "gpa");
    triggerNotification("Score Evaluated", `Closed exam slot tracking. Overall term stats updated!`, "exams", "low");
  };

  const handleDeleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    addLog("Exam Drop", `Cleared scheduled exam slot.`, "exam");
  };

  // 5. Goal Planner Actions
  const handleAddGoal = (title: string, current: number, target: number, subtitle: string) => {
    const newGoal: AcademicGoal = {
      id: `goal-${Date.now()}`,
      title,
      currentPercent: current,
      targetPercent: target,
      subtitle,
      category: 'general'
    };
    setGoals(prev => [...prev, newGoal]);
    addLog("Goal Registered", `Slated target: ${title}`, "preference");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    addLog("Goal Cleared", `Archived configured milestone.`, "preference");
  };

  const handleUpdateGoalProgress = (id: string, current: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, currentPercent: current };
      }
      return g;
    }));
  };

  // 6. User Profile Actions
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
    addLog("Profile Saved", "Saved updated enrollment characteristics.", "preference");
  };

  const handleClearLogs = () => {
    setActivityLogs([]);
  };

  // 7. Notification general helpers
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- View router switch ---
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            semesters={semesters}
            subjects={subjects}
            assignments={assignments}
            exams={exams}
            goals={goals}
            profile={profile}
            currentSemesterId={currentSemesterId}
            setActiveTab={setActiveTab}
            onAddQuickAssignment={handleAddAssignment}
          />
        );
      case 'semesters':
        return (
          <SemestersView 
            semesters={semesters}
            subjects={subjects}
            currentSemesterId={currentSemesterId}
            setCurrentSemesterId={setCurrentSemesterId}
            onAddSemester={handleAddSemester}
            onDeleteSemester={handleDeleteSemester}
            onUpdateSemester={handleUpdateSemester}
            setActiveTab={setActiveTab}
          />
        );
      case 'subjects':
        return (
          <SubjectsView 
            subjects={subjects}
            semesters={semesters}
            currentSemesterId={currentSemesterId}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onUpdateSubjectGrade={handleUpdateSubjectGrade}
            setSubjects={setSubjects}
            setActiveTab={setActiveTab}
          />
        );
      case 'assignments':
        return (
          <AssignmentsView 
            assignments={assignments}
            subjects={subjects}
            semesters={semesters}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignmentStatus={handleUpdateAssignmentStatus}
            onDeleteAssignment={handleDeleteAssignment}
            setAssignments={setAssignments}
            setActiveTab={setActiveTab}
          />
        );
      case 'exams':
        return (
          <ExamsView 
            exams={exams}
            subjects={subjects}
            onAddExam={handleAddExam}
            onUpdateExamGrade={handleUpdateExamGrade}
            onDeleteExam={handleDeleteExam}
            setActiveTab={setActiveTab}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView 
            semesters={semesters}
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            setActiveTab={setActiveTab}
          />
        );
      case 'profile':
        return (
          <ProfileView 
            profile={profile}
            activityLogs={activityLogs}
            onUpdateProfile={handleUpdateProfile}
            onClearLogs={handleClearLogs}
            setActiveTab={setActiveTab}
          />
        );
      case 'notifications':
        return (
          <NotificationCenterView 
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAll={handleClearNotifications}
            setActiveTab={setActiveTab}
          />
        );
      default:
        return <div className="text-center py-12 text-slate-400">View not constructed yet.</div>;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div id="gradify-viewport" className="flex h-screen bg-[#fafbfc] overflow-hidden antialiased">
      
      {/* 1. Left Vertical Nav Bar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        profile={profile} 
        unreadCount={unreadCount}
        onLogout={() => {
          localStorage.removeItem('ssp_is_logged_in');
          setIsLoggedIn(false);
        }}
      />

      {/* 2. Main content flow (Header + active viewport view) */}
      <div id="gradify-window-canvas" className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic header row */}
        <Header 
          currentSemesterId={currentSemesterId}
          setCurrentSemesterId={setCurrentSemesterId}
          semesters={semesters}
          unreadCount={unreadCount}
          activeTab={activeTab}
          profile={profile}
          setNotificationOpen={setNotificationOpen}
          setActiveTab={setActiveTab}
        />

        {/* View Layout context */}
        <main id="gradify-viewport-flow" className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
            {renderActiveView()}
          </div>
        </main>

      </div>

      {/* 3. Notifications sliding tray panel */}
      <NotificationsPanel 
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearNotifications}
        setActiveTab={setActiveTab}
      />

    </div>
  );
}
