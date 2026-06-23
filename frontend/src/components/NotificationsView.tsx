import { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Notification, formatDateSafe } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onDeleteNotification
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-amber-600 shrink-0" size={18} />;
      case 'success': return <CheckCircle className="text-emerald-600 shrink-0" size={18} />;
      default: return <Info className="text-blue-600 shrink-0" size={18} />;
    }
  };

  const getColorClass = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Helper to format dates nicely
  const formatDateAgo = (dateStr: string) => {
    return formatDateSafe(dateStr, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* Action controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All Notifications ({notifications.length})</span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'unread' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Unread ({notifications.filter(n => !n.read).length})</span>
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={onMarkAllRead}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold px-3.5 py-2"
              id="btn-mark-all-read"
            >
              <CheckCheck size={14} />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={onClearAll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold px-3.5 py-2"
              id="btn-clear-all"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* List content */}
      {filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center text-slate-400 shadow-sm max-w-xl mx-auto">
          <Bell className="mx-auto text-slate-100 mb-2" size={48} />
          <h3 className="font-bold text-slate-900 mb-1 font-headline">Zero Alerts Here</h3>
          <p className="text-xs text-slate-400 font-sans">
            You&rsquo;re all caught up! No active notifications registered in this directory path.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-w-3xl mx-auto font-sans">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${
                item.read 
                  ? 'bg-white border-slate-200 text-slate-600 opacity-75' 
                  : `shadow-xs border-l-4 ${getColorClass(item.type)}`
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {getIcon(item.type)}
                </div>
                
                <div>
                  <h4 className={`text-sm font-bold leading-tight ${item.read ? 'text-slate-800' : 'text-slate-950 font-sans'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 shadow-none lead-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono inline-block mt-2">
                    {formatDateAgo(item.date)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center">
                {!item.read && (
                  <button
                    onClick={() => onMarkRead(item.id)}
                    className="p-1 hover:bg-slate-100 rounded-md text-[10px] uppercase font-bold text-blue-700 bg-white border border-slate-200 px-2 select-none"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(item.id)}
                  className="p-1 text-slate-300 hover:text-red-500 rounded-md"
                  title="Remove"
                >
                  <X size={15} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
