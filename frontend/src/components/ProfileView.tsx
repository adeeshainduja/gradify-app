import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  BookOpen, 
  Briefcase, 
  Calendar,
  Layers,
  Activity,
  Edit2,
  Check,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ShieldAlert,
  Bell,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  UserCheck,
  Download,
  AlertCircle,
  FileText,
  RotateCcw,
  Sliders,
  TrendingUp,
  Cpu,
  Trophy,
  Flame,
  Globe,
  Settings,
  HelpCircle,
  Clock,
  X,
  CreditCard,
  Hash,
  ChevronRight,
  Printer
} from 'lucide-react';
import { UserProfile, ActivityLog } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  activityLogs: ActivityLog[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClearLogs: () => void;
  setActiveTab?: (tab: string) => void;
}

type SettingsTab = 'general' | 'security' | 'notifications' | 'preferences';

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  activityLogs,
  onUpdateProfile,
  onClearLogs,
  setActiveTab
}) => {
  // Tabs & Views setup
  const [activeTabSetting, setActiveTabSetting] = useState<SettingsTab>('general');
  const [emptyStateActive, setEmptyStateActive] = useState<boolean>(false);
  
  // Custom interactive transient state feedback (toast alerts)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  
  // Modals view states
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showSemesterModal, setShowSemesterModal] = useState<boolean>(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  // General & Academic profile form states
  const [name, setName] = useState(profile.name || 'Kavindu Peiris');
  const [studentId, setStudentId] = useState(profile.studentId || 'SE20230482');
  const [email, setEmail] = useState(profile.email || 'kavindup52@gmail.com');
  const [phone, setPhone] = useState(profile.phone || '+94 77 123 4567');
  const [location, setLocation] = useState(profile.location || 'Colombo, Sri Lanka');
  const [birthDate, setBirthDate] = useState(profile.birthDate || '2002-05-14');
  const [advisor, setAdvisor] = useState(profile.advisor || 'Dr. Samantha Gunawardena');
  const [degree, setDegree] = useState(profile.degree || 'BSc (Hons) Software Engineering');
  const [faculty, setFaculty] = useState(profile.faculty || 'Faculty of Computing & IT');
  const [scholarship, setScholarship] = useState(profile.scholarship || 'Merit-Based (50% Tuition Waiver)');
  const [enrollmentYear, setEnrollmentYear] = useState(profile.enrollmentYear || '2023');
  
  // New extra fields for personal information form
  const [gender, setGender] = useState<string>('Male');
  const [emergencyContact, setEmergencyContact] = useState<string>('+94 71 987 6543');
  const [department, setDepartment] = useState<string>('Department of Software Engineering');
  const [expectedGraduation, setExpectedGraduation] = useState<string>('June 2027');
  const [academicStatus, setAcademicStatus] = useState<string>('Enrolled / Active');

  // Change avatar select images (realistic vectors & premium characters) 
  const availableAvatars = [
    { name: "Default Student Blue", url: profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { name: "Creative Designer", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { name: "SaaS Dev Charcoal", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { name: "Terminal Coder Purple", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
    { name: "Scholastic Orange", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" }
  ];
  
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');

  // Security credentials state
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const [twoFactorActive, setTwoFactorActive] = useState<boolean>(false);

  // Notification Preferences states
  const [notifyAssignments, setNotifyAssignments] = useState<boolean>(true);
  const [notifyExams, setNotifyExams] = useState<boolean>(true);
  const [notifyGpaUpdates, setNotifyGpaUpdates] = useState<boolean>(true);
  const [notifyGoalProgress, setNotifyGoalProgress] = useState<boolean>(false);

  // Preference tab states
  const [accentColor, setAccentColor] = useState<string>('indigo');
  const [gradeScaleFormat, setGradeScaleFormat] = useState<string>('gpa-four-point');
  const [weekendAlerts, setWeekendAlerts] = useState<boolean>(true);

  // Profile Analytics Widget details
  const accountCreatedDate = "September 1, 2023";
  const lastLoginTime = "Today, 09:49 AM";
  const totalPlatformUsage = "142 hours";
  const mostActiveSemester = "Semester 4";

  // Dynamic calculations of profile completion (Max 100 points based on completed fields)
  const getProfileCompletionPercentage = () => {
    let score = 0;
    if (name) score += 15;
    if (email) score += 15;
    if (phone) score += 10;
    if (location) score += 10;
    if (birthDate) score += 10;
    if (gender) score += 10;
    if (emergencyContact) score += 10;
    if (profile.avatar) score += 10;
    if (studentId) score += 10;
    return Math.min(score, 100);
  };

  const profileCompletion = getProfileCompletionPercentage();

  // Show customized transient notifications helper
  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Submit profile general update handler
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      studentId,
      email,
      phone,
      location,
      birthDate,
      advisor,
      degree,
      faculty,
      scholarship,
      enrollmentYear
    });
    triggerToast("Administrative registry file updated successfully!", "success");
  };

  // Simulated password change verification
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      triggerToast("Please populate all credential inputs.", "error");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      triggerToast("New passwords do not match confirmation coordinates.", "error");
      return;
    }
    if (newPassword.length < 6) {
      triggerToast("Password parameters must contain at least 6 characters.", "error");
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    triggerToast("Account password revised. Standard session remains authenticated.", "success");
  };

  // Static list of Achievements and Milestones
  const academicAchievements = [
    { id: "ach-1", title: "Dean's List Status", desc: "Recognized for maintaining cumulative SGPA >= 3.65 for consecutive term folders", status: "Active Badge", color: "from-amber-400 to-amber-600", stroke: "border-amber-200" },
    { id: "ach-2", title: "High Performer Award", desc: "Exceed academic averages with GPA parameters above 3.5 in key modules", status: "Unlocked", color: "from-indigo-500 to-indigo-700", stroke: "border-indigo-200" },
    { id: "ach-3", title: "Semester 1 Finished", desc: "Lock in core computing foundation courses with pass division standing", status: "Verified", color: "from-emerald-500 to-emerald-600", stroke: "border-emerald-250" },
    { id: "ach-4", title: "Semester 2 Finished", desc: "Lock in complex object-oriented structure course databases successfully", status: "Verified", color: "from-blue-500 to-blue-600", stroke: "border-blue-250" },
    { id: "ach-5", title: "Database Systems Specialization", desc: "Earn perfect grade score in system queries and table management models", status: "Top Grade Award", color: "from-purple-500 to-purple-600", stroke: "border-purple-200" }
  ];

  // Static list of Goal items matching Profile requirements
  const defaultGoalsList = [
    { id: "goal-1", title: "Maintain GPA above 3.8", target: "3.80 GPA", progress: "92%", color: "bg-indigo-600" },
    { id: "goal-2", title: "Graduate with First Class", target: "First Class Distinction", progress: "85%", color: "bg-blue-600" },
    { id: "goal-3", title: "Complete Degree on Time", target: "120 Total Credits", progress: "70%", color: "bg-purple-600" }
  ];

  // Dynamic generation of downloadable JSON registry summary
  const triggerRegistryDownload = () => {
    const registryData = {
      student_meta: {
        fullname: name,
        id_number: studentId,
        degree_track: degree,
        faculty_label: faculty,
        administrative_contact: { email, phone, location }
      },
      academic_indicators: {
        current_gpa: 3.72,
        cgpa: 3.68,
        credits_earned: 78,
        total_target: 120,
        standing: "First Class"
      },
      timestamp: new Date().toISOString()
    };
    
    const fileBlob = new Blob([JSON.stringify(registryData, null, 2)], { type: 'application/json' });
    const virtualLink = document.createElement('a');
    virtualLink.href = URL.createObjectURL(fileBlob);
    virtualLink.download = `Student_Success_Metadata_${studentId}.json`;
    document.body.appendChild(virtualLink);
    virtualLink.click();
    document.body.removeChild(virtualLink);
    triggerToast("Dynamic administrative JSON exported successfully!", "success");
  };

  // Re-populate standard profile indicators to clear empty states
  const handlePopulateStandardMock = () => {
    setEmptyStateActive(false);
    setName("Kavindu Peiris");
    setStudentId("SE20230482");
    setEmail("kavindup52@gmail.com");
    setPhone("+94 77 123 4567");
    setLocation("Colombo, Sri Lanka");
    setBirthDate("2002-05-14");
    setAdvisor("Dr. Samantha Gunawardena");
    setDegree("BSc (Hons) Software Engineering");
    setFaculty("Faculty of Computing & IT");
    setScholarship("Merit-Based (50% Tuition Waiver)");
    setEnrollmentYear("2023");
    triggerToast("Standard demo characteristics restored.", "info");
  };

  return (
    <div id="profile-view-workspace-context" className="space-y-6 text-slate-800 font-sans pb-12 animate-fade-in relative z-10">
      
      {/* 1. DYNAMIC FLOATING SUCCESS TOAST NOTIFICATE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white rounded-2xl px-4 py-3.5 shadow-xl border border-white/10 flex items-center gap-3 animate-slide-in-right z-50 transition-all max-w-sm">
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastType === 'error' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <div className="text-xs">
            <strong className="block font-black leading-tight text-white mb-0.5">Administrative Alert</strong>
            <span className="text-slate-300 font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. TOP HEADER SUMMARY GRID */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full border border-indigo-100">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500 fill-indigo-50" /> Student Records Management
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Manage your personal information, academic profile, account settings, and educational details.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Empty State Switch helper */}
          <button
            id="btn-toggle-profile-state"
            onClick={() => setEmptyStateActive(!emptyStateActive)}
            className={`font-semibold text-xs py-2 px-3.5 rounded-xl border transition-all cursor-pointer ${
              emptyStateActive 
                ? 'bg-amber-50 text-amber-700 border-amber-200 font-black' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {emptyStateActive ? "Show Live Student Data" : "Preview Pure Empty State"}
          </button>

          <button
            onClick={() => setShowSummaryModal(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl border border-slate-200 shadow-3xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" /> Export Dossier
          </button>
        </div>
      </div>

      {emptyStateActive ? (
        
        /* ================= EMPTY STATE CONTAINER ================= */
        <div id="profile-empty-state-screen" className="bg-white border border-slate-200 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-6 shadow-xs my-10">
          <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900">Complete your profile records.</h4>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed text-balance">
              Complete your profile to unlock personalized academic insights, degree completion percentage ratios, and progress tracking alerts!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={handlePopulateStandardMock}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4.5 rounded-lg shadow-xs cursor-pointer transition-all"
            >
              Populate kavindu's profile
            </button>
            <button
              onClick={() => setEmptyStateActive(false)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 text-xs py-2 px-4 rounded-lg transition-all"
            >
              Dismiss Preview
            </button>
          </div>
        </div>

      ) : (

        /* ================= POPULATED MAIN CONTENT FLOW ================= */
        <>
          
          {/* PROFILE HEADER SECTION: Large Profile Card & Avatar & Completion Ring */}
          <div id="large-profile-header-card" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs relative overflow-hidden group">
            {/* Background design accents */}
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-indigo-50/40 rounded-full select-none -z-10 pointer-events-none group-hover:scale-105 transition-all" />
            <div className="absolute left-1/3 bottom-0 translate-y-12 w-48 h-48 bg-purple-50/20 rounded-full select-none -z-10 pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
              
              {/* Photo & Identity descriptors */}
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left select-none">
                <div className="relative group/avatar">
                  <img 
                    id="user-profile-avatar-banner"
                    src={profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={name} 
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md group-hover/avatar:brightness-90 transition-all cursor-pointer"
                    referrerPolicy="no-referrer"
                    onClick={() => setShowAvatarPicker(true)}
                  />
                  {/* Small change overlay tag */}
                  <span 
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full p-1.5 border border-white cursor-pointer hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 id="student-main-id-name" className="text-xl font-black text-slate-850 tracking-tight">{name}</h3>
                    <span className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 uppercase">
                      First Class Standing
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-500 font-semibold space-y-0.5 leading-normal">
                    <p id="student-degree-degree">{degree}</p>
                    <p id="faculty-institutional-details" className="text-slate-400 font-medium">{faculty} • Apex Tech University</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono font-medium">
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-indigo-400" /> ID: {studentId}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" /> Year 3, Semester 5</span>
                    <span>|</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-400" /> {location}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons list & Dynamic Circular Progress Ring */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-5 lg:pt-0 shrink-0">
                
                {/* SVG Progress Ring */}
                <div id="profile-ring-loader" className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
                  <div className="relative h-14 w-14 shrink-0">
                    <svg transform="rotate(-90)" viewBox="0 0 40 40" className="w-14 h-14">
                      {/* Grey background circle */}
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                      {/* Interactive Indigo Circle indicator */}
                      <circle 
                        cx="20" 
                        cy="20" 
                        r="16" 
                        fill="none" 
                        stroke="#4f46e5" 
                        strokeWidth="3.5" 
                        strokeDasharray="100.5" 
                        strokeDashoffset={100.5 * (1 - (profileCompletion / 100))}
                        strokeLinecap="round" 
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <strong className="text-xs font-black font-mono text-indigo-950">{profileCompletion}%</strong>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">PROFILE INTEGRITY</span>
                    <strong className="text-xs font-black text-slate-700 block leading-none">Record Complete</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTabSetting('general');
                      const formPos = document.getElementById('account-settings-module-container');
                      if (formPos) formPos.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md shadow-indigo-100 cursor-pointer text-center block transition-all hover:scale-102"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveTabSetting('security');
                      const formPos = document.getElementById('account-settings-module-container');
                      if (formPos) formPos.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 px-3.5 rounded-xl border border-slate-200 cursor-pointer text-center"
                  >
                    Change Password
                  </button>
                </div>

              </div>

            </div>

            {/* Change Avatar selector tray overlay drop */}
            {showAvatarPicker && (
              <div className="mt-5 p-4.5 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in relative">
                <button 
                  onClick={() => setShowAvatarPicker(false)}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <h4 className="text-xs font-black text-slate-900 tracking-tight mb-2.5 uppercase">Choose a beautiful Avatar</h4>
                <div className="flex flex-wrap items-center gap-4">
                  {availableAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onUpdateProfile({ avatar: av.url });
                        setShowAvatarPicker(false);
                        triggerToast("Identity avatar coordinate adjusted!", "success");
                      }}
                      className="group flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <img 
                        src={av.url} 
                        alt={av.name} 
                        className={`w-12 h-12 rounded-xl object-cover ring-2 hover:ring-indigo-500 transition-all ${profile.avatar === av.url ? 'ring-indigo-600' : 'ring-transparent'}`}
                      />
                      <span className="text-[8px] text-slate-400 font-bold font-mono group-hover:text-indigo-600">{av.name}</span>
                    </button>
                  ))}

                  <div className="flex-1 min-w-[140px] pl-2 border-l border-slate-200">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">OR ENTER AVATAR URL</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="url" 
                        placeholder="https://..."
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        className="bg-white border border-slate-205 rounded-lg px-2.5 py-1 text-[10px] w-full outline-indigo-500"
                      />
                      <button
                        onClick={() => {
                          if (customAvatarUrl) {
                            onUpdateProfile({ avatar: customAvatarUrl });
                            setCustomAvatarUrl('');
                            setShowAvatarPicker(false);
                            triggerToast("Custom avatar coordinate loaded!", "info");
                          }
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[9px] px-2 py-1 rounded-lg"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* SUMMARY STATISTICS CARDS: 6 Cards Bento Layout */}
          <div id="student-summary-statistics-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Stat 1: Current GPA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
              <div>
                <dt className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Current GPA</span>
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                </dt>
                <dd className="text-2xl font-black font-mono text-slate-900 mt-2">3.72</dd>
              </div>
              <p className="text-[9px] text-emerald-600 mt-2 font-mono font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +0.12 trend
              </p>
            </div>

            {/* Stat 2: Cumulative GPA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
              <div>
                <dt className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">CGPA</span>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-505" />
                </dt>
                <dd className="text-2xl font-black font-mono text-slate-900 mt-2">3.68</dd>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 font-mono font-semibold">First Class forecast</p>
            </div>

            {/* Stat 3: Credits Ratio */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
              <div>
                <dt className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Credits Earned</span>
                  <Layers className="w-3.5 h-3.5 text-pink-500" />
                </dt>
                <dd className="text-2xl font-black font-mono text-slate-900 mt-2">78 <span className="text-xs text-slate-400">/ 120</span></dd>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-pink-500 h-1 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            {/* Stat 4: Assignments Completed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
              <div>
                <dt className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Assignments</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                </dt>
                <dd className="text-xl font-black font-mono text-slate-900 mt-1.5">42 <span className="text-xs text-slate-400 font-semibold">Done</span></dd>
              </div>
              <p className="text-[9px] text-indigo-600 mt-2 font-semibold">94% compliance rate</p>
            </div>

            {/* Stat 5: Subjects Completed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
              <div>
                <dt className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Subjects Done</span>
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                </dt>
                <dd className="text-2xl font-black font-mono text-slate-900 mt-2">24</dd>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 font-mono">18 graded syllabus units</p>
            </div>

            {/* Stat 6: Academic Goals Achieved */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
              <div>
                <dt className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Goals Achieved</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                </dt>
                <dd className="text-2xl font-black font-mono text-slate-900 mt-2">5 <span className="text-xs text-slate-400">Targeted</span></dd>
              </div>
              <p className="text-[9px] text-emerald-600 mt-2 font-medium font-mono">✔ 3 goals on track</p>
            </div>

          </div>

          {/* THREE-COLUMN STATS GRID: Progress Ring, Academic Badges, Goals Status, Recent timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Col: Academic Progress Progress Ring & Milestones (4 units) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-3xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4.5 h-4.5 text-indigo-500" /> Academic Progress Metrics
                </h4>
                <p className="text-[11px] text-slate-400">Dynamic course outline completion ratios calculated dynamically.</p>
              </div>

              {/* Progress Ring Card Segment */}
              <div className="flex items-center justify-center gap-6 py-5 border-y border-dashed border-slate-150 my-4 bg-slate-50/50 rounded-2xl p-3">
                <div className="relative h-24 w-24 shrink-0">
                  <svg transform="rotate(-90)" viewBox="0 0 100 100" className="w-24 h-24">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="8" 
                      strokeDasharray="263.89" 
                      strokeDashoffset={263.89 * (1 - 0.65)} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <strong className="text-lg font-black font-mono text-slate-900 leading-none">65%</strong>
                    <span className="text-[7.5px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Completed</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none">CREDITS EARNED</span>
                    <strong className="text-sm font-extrabold text-slate-800">78 Credits</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none">REMAINING TARGET</span>
                    <strong className="text-sm font-extrabold text-slate-700">42 Credits</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold leading-none font-mono">DEGREE ACCORD</span>
                    <span className="text-indigo-650 font-bold text-[11px]">BSc Software Eng.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PROGRESS BENCHMARK</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "65%" }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Enrolled: 2023</span>
                  <span>Expected Graduation: 2027</span>
                </div>
              </div>

            </div>

            {/* Middle Col: Achievements & Milestones Badges (4 units) */}
            <div id="academic-milestones-card" className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-3xs flex flex-col justify-between">
              
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Trophy className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Achievements & Milestones
                </h4>
                <p className="text-[11px] text-slate-400">Dean's checklist rewards won and semester credentials issued.</p>
              </div>

              {/* Badges Container list */}
              <div className="space-y-3.5 my-4">
                {academicAchievements.map((item, keyIdx) => (
                  <div key={item.id} className="flex gap-2.5 items-center group">
                    <span className={`h-8 w-8 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shrink-0`}>
                      {keyIdx === 0 ? (
                        <Trophy className="w-4 h-4 text-white" />
                      ) : keyIdx === 1 ? (
                        <Award className="w-4 h-4 text-white" />
                      ) : keyIdx === 4 ? (
                        <Flame className="w-4 h-4 text-white" />
                      ) : (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1 leading-none">
                        <strong className="text-xs font-black text-slate-705 group-hover:text-indigo-650 transition-colors">{item.title}</strong>
                        <span className="text-[8px] font-mono font-bold uppercase text-slate-400">{item.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-410 truncate leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] text-indigo-500 font-mono font-bold leading-none bg-indigo-50/50 p-2 rounded-xl">
                🌟 Faculty Dean Honor Roll certified on portal files
              </div>

            </div>

            {/* Right Academic Goals Tracker widget (4 units) */}
            <div id="profile-goals-card" className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-3xs flex flex-col justify-between">
              
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                  <Bookmark className="w-4.5 h-4.5 text-purple-600" /> Academic Goals
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">Verify your target metrics coordinates progress.</p>
              </div>

              {/* Goal bars list details */}
              <div className="space-y-4 my-4">
                {defaultGoalsList.map((gObj) => (
                  <div key={gObj.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-slate-800 font-bold">{gObj.title}</strong>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{gObj.progress}</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${gObj.color} h-2 rounded-full`} style={{ width: gObj.progress }} />
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                      <span>Target: {gObj.target}</span>
                      <span className="text-indigo-500 font-semibold block">In Progress</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  if (setActiveTab) setActiveTab('analytics');
                }}
                className="w-full border border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:bg-indigo-50/30 text-xs py-2 px-3.5 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" /> Adjust Goals in Analytics
              </button>

            </div>

          </div>

          {/* DYNAMIC ACCOUNT SETTINGS TABS & EDITABLE SYSTEM FORMS MODULE */}
          <div id="account-settings-module-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Tab controllers list (3 systems) */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4.5 shadow-2xs space-y-2">
              
              <div className="pb-3 border-b border-slate-100 mb-2">
                <span className="text-[9px] font-bold text-indigo-650 block uppercase tracking-widest font-mono">SETTINGS ENGINE</span>
                <strong className="text-xs text-slate-800 block font-black">Control Preferences Panel</strong>
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'general', label: 'General & Personal', desc: 'Personal details form setup', icon: User },
                  { id: 'security', label: 'Security & Integrity', desc: 'Change password & active logs', icon: Lock },
                  { id: 'notifications', label: 'System notifications', desc: 'Reminders & GPA updates', icon: Bell },
                  { id: 'preferences', label: 'Accent & Theme Config', desc: 'Workspace visuals colors', icon: Settings }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isCurrent = activeTabSetting === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTabSetting(item.id as SettingsTab)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-indigo-50/70 text-indigo-900 border-indigo-200/80 font-black shadow-3xs' 
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-transparent font-semibold'
                      }`}
                    >
                      <span className={`p-2 rounded-lg ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <IconComp className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <strong className="text-xs block leading-none">{item.label}</strong>
                        <span className="text-[9px] text-slate-400 block font-medium leading-none mt-1">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Account Analytics inside tab column */}
              <div className="pt-4.5 border-t border-slate-150 mt-4 space-y-2.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SYSTEM TELEMETRY</h5>
                
                <div className="text-[11px] space-y-1.5 font-medium text-slate-505">
                  <div className="flex justify-between">
                    <span>Activated:</span>
                    <strong className="text-slate-800 font-mono text-[10px]">{accountCreatedDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last session:</span>
                    <strong className="text-slate-800 font-mono text-[10px]">{lastLoginTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage Logs:</span>
                    <span className="text-indigo-600 font-mono text-[10px] font-bold">{totalPlatformUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Active:</span>
                    <strong className="text-slate-800">{mostActiveSemester}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Dynamic Form render panel (9 systems) */}
            <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
              
              {/* TAB CONTENT A DEFAULT: General Form */}
              {activeTabSetting === 'general' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  
                  {/* Form section header info */}
                  <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                        <User className="text-indigo-500 w-5 h-5" /> General & Academic Information
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Edit credentials parameters safely. Submissions saved to local persistent database.</p>
                    </div>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer text-center block"
                    >
                      Save Standard Profile Details
                    </button>
                  </div>

                  {/* personal indicators subgroup */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest font-mono border-l-2 border-indigo-600 pl-2">
                      Personal Information Section
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Your complete full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-indigo-650 font-semibold text-slate-700"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Student Registration Number</label>
                        <input 
                          type="text" 
                          placeholder="SE2023XXXX"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-indigo-650 font-semibold text-slate-700 font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="example@student.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-indigo-650 font-semibold text-slate-700"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Mobile Number</label>
                        <input 
                          type="text" 
                          placeholder="+94 77 XXX XXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-indigo-650 font-semibold text-slate-700 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Date of Birth</label>
                          <input 
                            type="date" 
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 font-semibold text-center outline-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold">Gender</label>
                          <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white text-slate-700 font-bold"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Declined">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Location Address</label>
                          <input 
                            type="text" 
                            placeholder="City, Country"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 font-semibold outline-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Emergency Contact</label>
                          <input 
                            type="text" 
                            value={emergencyContact}
                            onChange={(e) => setEmergencyContact(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 font-semibold font-mono outline-indigo-500"
                          />
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* academic indicators subgroup */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h5 className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest font-mono border-l-2 border-indigo-600 pl-2">
                      Academic Information Section
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold text-slate-450 uppercase tracking-wider text-[10px]">University Name</label>
                        <input 
                          type="text" 
                          value="Apex Tech University"
                          disabled
                          title="System default institution parameters cannot be customized"
                          className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-3.5 py-2 text-xs cursor-not-allowed font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold text-slate-450 uppercase tracking-wider text-[10px]">Department Track</label>
                        <input 
                          type="text" 
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-650 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Degree Program Coordinate</label>
                        <input 
                          type="text" 
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-650 font-extrabold text-indigo-950"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Faculty Umbrella</label>
                        <input 
                          type="text" 
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-650 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Enrollment Year</label>
                          <input 
                            type="text" 
                            value={enrollmentYear}
                            onChange={(e) => setEnrollmentYear(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 font-semibold text-center outline-indigo-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Expected Graduation</label>
                          <input 
                            type="text" 
                            value={expectedGraduation}
                            onChange={(e) => setExpectedGraduation(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 font-semibold text-center outline-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Scholarship Standing</label>
                          <input 
                            type="text" 
                            value={scholarship}
                            onChange={(e) => setScholarship(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-700 font-semibold outline-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-650 font-extrabold block">Academic Enrollment Status</label>
                          <input 
                            type="text" 
                            value={academicStatus}
                            onChange={(e) => setAcademicStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full text-slate-750 font-bold block bg-emerald-50 text-emerald-800 border-emerald-150"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-xs text-slate-650 font-extrabold">Registered Faculty Advisor</label>
                        <input 
                          type="text" 
                          value={advisor}
                          onChange={(e) => setAdvisor(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white text-indigo-700 font-bold"
                        />
                      </div>

                    </div>

                  </div>

                </form>
              )}

              {/* TAB CONTENT B: Security & Authentication */}
              {activeTabSetting === 'security' && (
                <div className="space-y-6">
                  
                  <div>
                    <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <Lock className="text-indigo-500 w-5 h-5" /> Security & Account Credentials
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Verify login security components and multi-factor authorization codes.</p>
                  </div>

                  {/* Password Change Form card */}
                  <form onSubmit={handlePasswordChangeSubmit} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-4">
                    <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <Lock className="w-4 h-4 text-indigo-500" /> Change Device Password
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1 relative">
                        <label className="text-xs text-slate-650 font-extrabold">Old Password</label>
                        <input 
                          type={showPasswords ? "text" : "password"} 
                          placeholder="••••••••"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-600 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">New Password</label>
                        <input 
                          type={showPasswords ? "text" : "password"} 
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-600 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-650 font-extrabold">Confirm New Password</label>
                        <input 
                          type={showPasswords ? "text" : "password"} 
                          placeholder="••••••••"
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-600 font-mono"
                        />
                      </div>

                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPasswords ? "Mask coordinates" : "Reveal input passwords"}
                      </button>

                      <button
                        type="submit"
                        className="bg-indigo-620 hover:bg-indigo-700 text-slate-900 bg-indigo-100 hover:bg-indigo-200 font-extrabold text-xs py-2 px-4.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      >
                        Update Account Password
                      </button>
                    </div>

                  </form>

                  {/* Two Factor Authentication segments */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                          <Smartphone className="w-4 h-4 text-emerald-500" /> Two-Factor Authentication (2FA)
                        </h5>
                        <p className="text-[11px] text-slate-400">Add an extra layer of biometric identity status protection using custom standard Authenticator Apps (Google Authenticator, etc.).</p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input 
                          type="checkbox" 
                          checked={twoFactorActive} 
                          onChange={(e) => {
                            setTwoFactorActive(e.target.checked);
                            triggerToast(e.target.checked ? "2FA authentication challenge turned on!" : "Biometric 2FA turned off", "info");
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {twoFactorActive && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-2 animate-fade-in text-[11px] text-emerald-800">
                        <p className="font-semibold">Your device registration files are secured. Write down your dynamic backup recovery keys below:</p>
                        <div className="grid grid-cols-4 gap-2 font-mono text-[9.5px] text-emerald-950 font-black tracking-tight text-center py-1">
                          <span className="bg-white border border-emerald-200 rounded py-0.5 shadow-2xs">SE23X-8902</span>
                          <span className="bg-white border border-emerald-200 rounded py-0.5 shadow-2xs">KVP82-4411</span>
                          <span className="bg-white border border-emerald-200 rounded py-0.5 shadow-2xs">APX11-3000</span>
                          <span className="bg-white border border-emerald-200 rounded py-0.5 shadow-2xs">SEC99-0418</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Login Activity & Sessions List */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4">
                    <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <Clock className="w-4 h-4 text-indigo-500" /> Active Registry Sessions
                    </h5>

                    <div className="space-y-3 font-mono text-[11px]">
                      {[
                        { device: "MacBook Pro M3", browser: "Chrome 126", location: "Colombo, LK (Current)", ip: "192.168.1.102", icon: Cpu, active: true },
                        { device: "iPhone 15 Pro", browser: "Safari Mobile", location: "Colombo, LK", ip: "112.55.24.91", icon: Smartphone, active: false }
                      ].map((sess, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <div className="flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                              <sess.icon className="w-4 h-4 text-slate-500" />
                            </span>
                            <div>
                              <strong className="text-slate-800 font-sans block leading-none font-bold text-xs">{sess.device}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{sess.browser} • {sess.location}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block">{sess.ip}</span>
                            {sess.active ? (
                              <span className="inline-block text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-150 rounded px-1 text-center font-bold font-sans uppercase">Active session</span>
                            ) : (
                              <span className="inline-block text-[8px] text-slate-400 font-bold font-sans">2 hours ago</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB CONTENT C: Notifications Settings */}
              {activeTabSetting === 'notifications' && (
                <div className="space-y-6">
                  
                  <div>
                    <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <Bell className="text-indigo-500 w-5 h-5" /> Notification Preferences
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle notification coordinate triggers to ensure optimal updates across assignments and quizzes.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'notify-assignments', title: 'Assignment Reminder Logs', desc: 'Alert student folder 48 hours prior to any assignment closing coordinate', state: notifyAssignments, setter: setNotifyAssignments, icon: BookOpen },
                      { id: 'notify-exams', title: 'Exam Calendar Reminders', desc: 'Sync mid-and-final term examination schedules with calendar layers', state: notifyExams, setter: setNotifyExams, icon: Calendar },
                      { id: 'notify-gpa', title: 'Dynamic GPA recalculation updates', desc: 'Simulate instant recalculated stats and CGPA forecasts on exam log changes', state: notifyGpaUpdates, setter: setNotifyGpaUpdates, icon: Award },
                      { id: 'notify-goal', title: 'Goal milestone achievement alarms', desc: 'Push congratulations banner once target credits or SGPA targets cross 90%', state: notifyGoalProgress, setter: setNotifyGoalProgress, icon: Trophy }
                    ].map((notif, idx) => {
                      const IconComp = notif.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-4.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl transition-all">
                          <div className="flex gap-3.5 items-start">
                            <span className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                              <IconComp className="w-4.5 h-4.5" />
                            </span>
                            <div>
                              <strong className="text-xs font-black text-slate-800 block">{notif.title}</strong>
                              <span className="text-[11px] text-slate-400 block font-medium leading-normal mt-0.5">{notif.desc}</span>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-4">
                            <input 
                              type="checkbox" 
                              checked={notif.state} 
                              onChange={(e) => {
                                notif.setter(e.target.checked);
                                triggerToast(`${notif.title} toggled.`, "info");
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-650"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-150 text-[11px] text-indigo-805 leading-relaxed font-semibold">
                    💡 Custom system alerts are synced to browser local database layers. Enable <strong>Biometric authentications</strong> under security to unlock instant push alerts.
                  </div>

                </div>
              )}

              {/* TAB CONTENT D: Theme & visual preferences */}
              {activeTabSetting === 'preferences' && (
                <div className="space-y-6">
                  
                  <div>
                    <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <Sliders className="text-indigo-500 w-5 h-5" /> Workspace Theme Settings
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Choose your dashboard branding accent points. Customizes visual elements instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Select Accent Color */}
                    <div className="p-4.5 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">WORKSPACE ACCENT BRAND</h5>
                      
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold font-mono">
                        {[
                          { id: 'indigo', name: 'Navy Indigo', color: 'bg-indigo-600' },
                          { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-600' },
                          { id: 'purple', name: 'Cosmic Purple', color: 'bg-purple-600' },
                          { id: 'pink', name: 'Chic Pink', color: 'bg-pink-600' }
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setAccentColor(c.id);
                              triggerToast(`Accent brand is now: ${c.name}`, "info");
                            }}
                            className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              accentColor === c.id 
                                ? 'bg-white border-indigo-250 ring-2 ring-indigo-100 shadow-sm' 
                                : 'bg-transparent border-transparent text-slate-500'
                            }`}
                          >
                            <span className={`h-6 w-6 rounded-full block ${c.color} shrink-0`} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Numeric GPA Format Selection */}
                    <div className="p-4.5 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">GPA DECIMALS INTERPRETATION</h5>
                      
                      <div className="space-y-2">
                        {[
                          { id: 'gpa-four-point', name: 'GPA Scale 4.0 Standard' },
                          { id: 'gpa-percentage', name: 'Percentage Ratio Scores (0 - 100%)' }
                        ].map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input 
                              type="radio" 
                              name="grd-radio"
                              checked={gradeScaleFormat === item.id}
                              onChange={() => {
                                setGradeScaleFormat(item.id);
                                triggerToast(`Grade format altered.`, "info");
                              }}
                              className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>{item.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Weekend Reminders Switch item */}
                  <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-black text-slate-800 block">Weekend Analytics Notifications</strong>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Toggle alert updates during Saturday, Sunday intervals.</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-4">
                      <input 
                        type="checkbox" 
                        checked={weekendAlerts} 
                        onChange={(e) => {
                          setWeekendAlerts(e.target.checked);
                          triggerToast(e.target.checked ? "Weekend alerts enabled" : "Weekend alerts silenced", "info");
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-650"></div>
                    </label>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* RECENT ACTIVITY TIMELINE GRAPH & QUICK ACTIONS METER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Activity feed (7 units) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-indigo-500 animate-pulse" /> Recent administrative transactions logs
                  </h4>
                  <p className="text-[11px] text-slate-400">Time-stamped registry processes audited officially by security system.</p>
                </div>

                {activityLogs.length > 0 && (
                  <button 
                    onClick={onClearLogs}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-650 font-mono pl-3"
                  >
                    Clear History Logs
                  </button>
                )}
              </div>

              {/* Activity item components */}
              <div id="timeline-box" className="space-y-4 max-h-[220px] overflow-y-auto pr-2 mt-4.5">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-relaxed group">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 border border-white group-hover:scale-125 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-extrabold text-slate-800 truncate">{log.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-405 text-[11px] font-semibold truncate leading-none mt-0.5">{log.description}</p>
                    </div>
                  </div>
                ))}

                {activityLogs.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 font-mono">
                    No recent administrative transactions logged.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center mt-4">
                Record sequence tracking starts on: September 1, 2023.
              </div>

            </div>

            {/* Right: Quick actions menu shortcuts (5 units) */}
            <div id="profile-quick-actions" className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">University Quick Actions</h4>
                <p className="text-[11px] text-slate-400 mt-1">Convenient links to execute standard administrative processes.</p>
              </div>

              {/* Action buttons items */}
              <div className="space-y-2.5 my-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTabSetting('general');
                    const formPos = document.getElementById('account-settings-module-container');
                    if (formPos) formPos.scrollIntoView({ behavior: 'smooth' });
                    triggerToast("Adjust the academic fields below", "info");
                  }}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-150 p-2.5 rounded-xl text-xs font-bold text-slate-705 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><Edit2 className="w-4 h-4 text-indigo-500" /> Edit Academic Profile</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSemesterModal(true)}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-150 p-2.5 rounded-xl text-xs font-bold text-slate-705 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Update Semester Information</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (setActiveTab) {
                      setActiveTab('analytics');
                    } else {
                      triggerToast("Use sidebar to navigate to Analytics views.", "info");
                    }
                  }}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-150 p-2.5 rounded-xl text-xs font-bold text-slate-705 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> View GPA Analytics Page</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSummaryModal(true)}
                  className="w-full text-left bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-xs font-black text-indigo-800 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> Download Academic Summary</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>

                <button
                  type="button"
                  onClick={triggerRegistryDownload}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-150 p-2.5 rounded-xl text-xs font-bold text-slate-705 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><Download className="w-4 h-4 text-purple-500" /> Export Profile Metadata (.JSON)</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono text-center">
                Verified cryptographically via Apex Student Registry APIs
              </div>

            </div>

          </div>

        </>
      )}

      {/* ================= MODAL OVERLAYS VIEWPORTS ================= */}

      {/* A. Floating Detailed Academic Summary / Report modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs font-sans">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-2xl w-full shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowSummaryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-wider block">OFFICIAL DOSSIER SUMMARY</span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Apex Tech University Transcript Preview</h3>
              <p className="text-xs text-slate-400">Registry folder check: kavindu Peiris (SE20230482)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-4 text-[11px] leading-tight text-slate-600 pb-2 border-b border-dashed border-slate-200">
                <div>
                  Student Name: <strong className="text-slate-800 font-sans">{name}</strong>
                </div>
                <div>
                  Registration ID: <strong className="text-slate-800">{studentId}</strong>
                </div>
                <div>
                  Curriculum Track: <strong className="text-slate-800 font-sans">{degree}</strong>
                </div>
                <div>
                  Expected Division: <strong className="text-emerald-700 font-sans">First Class Honours</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-650">
                <div className="flex justify-between">
                  <span>Cumulative Course credits log:</span>
                  <strong className="text-slate-800">78 of 120 Credits Completed</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current Cumulative GPA (CGPA):</span>
                  <strong className="text-slate-800 text-indigo-600 font-bold block">3.68 Cumulative Core</strong>
                </div>
                <div className="flex justify-between">
                  <span>Enrollment Status:</span>
                  <strong className="text-emerald-700">ACTIVE / Merit Scholarship Division</strong>
                </div>
                <div className="flex justify-between">
                  <span>Administrative Faculty Advisor:</span>
                  <strong className="text-slate-800 font-sans">{advisor}</strong>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed text-center block pt-2">
              📜 This dashboard viewport acts as a digital copy of active database registries. Click print below to export formatted records layout.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / System Save PDF
              </button>
              
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  triggerToast("Registry summary snapshot closed successfully.", "info");
                }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Close Viewport
              </button>
            </div>

          </div>
        </div>
      )}

      {/* B. Update Semester Information Modal popup */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs font-sans">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative space-y-4">
            
            <button 
              onClick={() => setShowSemesterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">SEMESTER SHIFTER</span>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Modify Current Semester coordinates</h3>
              <p className="text-xs text-slate-400">Shift academic parameters instantly.</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-650 font-bold block">Current Semester folder</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white text-slate-700 font-bold">
                  <option value="Semester 5">Semester 5 (Active Spring Term)</option>
                  <option value="Semester 6">Semester 6 (Upcoming Autumn Term)</option>
                  <option value="Semester 4">Semester 4 (Archived Completion)</option>
                  <option value="Graduated">Completed Course Curriculum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-650 font-bold block">Academic Year status</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white text-slate-700 font-bold">
                  <option value="Year 3">Year 3 (Active juniors level)</option>
                  <option value="Year 4">Year 4 (Seniors Dissertation capstone)</option>
                  <option value="Year 2">Year 2 (Sophomore general logs)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSemesterModal(false);
                triggerToast("Dynamic semester shift logged successfully!", "success");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Update Registration Coordinates
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
