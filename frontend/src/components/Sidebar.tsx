import { LayoutDashboard, CalendarDays, BookOpen, FileText, GraduationCap, BarChart3, Bell, User, Settings, LogOut, X } from 'lucide-react';

export const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Semesters', icon: CalendarDays },
  { name: 'Subjects', icon: BookOpen },
  { name: 'Assignments', icon: FileText },
  { name: 'Exams', icon: GraduationCap },
  { name: 'GPA & Analytics', icon: BarChart3 },
  { name: 'Notifications', icon: Bell },
];

export const accountItems = [
  { name: 'Profile', icon: User },
  { name: 'Settings', icon: Settings },
  { name: 'Logout', icon: LogOut },
];

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  isOpen, 
  onClose 
}: { 
  activeView: string; 
  setActiveView: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Dynamic mobile background mask overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide drawer responsive box container */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col py-6 px-4 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="px-4 mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-headline text-blue-700">Gradify</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Academic Management</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
              title="Close System Navigation Menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveView(item.name);
                  if (onClose) onClose();
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-blue-700 bg-blue-50 font-bold border-l-2 border-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-sans text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1 pt-6 border-t border-slate-200">
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveView(item.name);
                  if (onClose) onClose();
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'text-blue-700 bg-blue-50 font-bold border-l-2 border-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-sans text-sm">{item.name}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
