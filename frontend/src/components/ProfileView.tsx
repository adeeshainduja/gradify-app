import { useState, FormEvent, ChangeEvent } from 'react';
import { 
  User, 
  Settings, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertCircle, 
  GraduationCap,
  Scale,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, INITIAL_PROFILE } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  onRestoreImportData: (rawJson: string) => boolean;
  onExportData: () => string;
}

export default function ProfileView({
  profile,
  onUpdateProfile,
  onResetData,
  onRestoreImportData,
  onExportData
}: ProfileViewProps) {
  // Local form states
  const [name, setName] = useState(profile?.name || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [targetGpa, setTargetGpa] = useState<number>(() => {
    const val = parseFloat((profile?.targetGpa ?? 3.8).toString());
    return isNaN(val) ? 3.8 : val;
  });
  const [gpaScale, setGpaScale] = useState<4.0 | 5.0>(() => {
    const scale = profile?.gpaScale;
    return (scale === 4.0 || scale === 5.0) ? scale : 4.0;
  });
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');

  const safeTargetGpa = typeof targetGpa === 'number' && !isNaN(targetGpa) ? targetGpa : 3.8;
  const safeGpaScale = typeof gpaScale === 'number' && !isNaN(gpaScale) ? gpaScale : 4.0;

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveStatus, setSaveStatus] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      major: major.trim(),
      university: university.trim(),
      targetGpa: parseFloat(targetGpa.toString()) || 4.0,
      gpaScale: gpaScale,
      avatarUrl: avatarUrl
    });

    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleExportClick = () => {
    const dataStr = onExportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradify_backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    const outcome = onRestoreImportData(importJsonText);
    if (outcome) {
      setImportStatus('success');
      setImportJsonText('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Profile Form (Takes 2 Columns) */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold font-headline text-slate-900 flex items-center gap-1.5">
                <Settings size={20} className="text-blue-600" />
                <span>Academic Profile Settings</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">Modify personal enrollment specs and analytics scale goals.</p>
            </div>
            
            {saveStatus && (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Profile Saved!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Full Student Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-lg p-2.5"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Enrolled Curricular Major</label>
              <input 
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. B.S. in Software Engineering"
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-lg p-2.5"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600">University / Institution</label>
              <input 
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-lg p-2.5"
                required
              />
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Profile Picture</label>
              <div className="flex items-center gap-4">
                {avatarUrl && (
                  <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                )}
                <label className="flex-1 cursor-pointer">
                  <span className="block w-full text-xs text-center border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-500 py-3 rounded-lg">
                    {avatarUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">GPA Calculation Scale</label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGpaScale(4.0)}
                  className={`flex-1 py-2 font-bold rounded-lg border transition-all ${
                    gpaScale === 4.0 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  4.0 Scale (Standard US)
                </button>
                <button
                  type="button"
                  onClick={() => setGpaScale(5.0)}
                  className={`flex-1 py-2 font-bold rounded-lg border transition-all ${
                    gpaScale === 5.0 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  5.0 Scale (Prestige / AP)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Target GPA Goal</label>
              <input 
                type="number"
                value={targetGpa}
                onChange={(e) => setTargetGpa(parseFloat(e.target.value) || 0)}
                max={gpaScale}
                min="1.0"
                step="0.05"
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-lg p-2.5"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl text-xs transition-transform active:scale-95"
            >
              <Save size={14} />
              <span>Save Academic Profile</span>
            </button>
          </div>
        </form>

        {/* JSON Data Portability controls */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-4">
          <div>
            <h4 className="text-md font-bold font-headline text-slate-900 flex items-center gap-1.5">
              <Upload size={18} className="text-indigo-600" />
              <span>Import backup state</span>
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              Paste a previously exported Gradify JSON string below to restore curricular progress.
            </p>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-3 font-sans">
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='Paste JSON back-string here: e.g. {"semesters": [...], "subjects": [...]}'
              className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 h-16 rounded-xl text-[10px] font-mono resize-none focus:bg-white focus:border-indigo-500"
            />
            
            <div className="flex justify-between items-center pt-2">
              <div>
                {importStatus === 'success' && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Import Restored Successfully! App reloaded.
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    Failed to structural parse JSON. Verify backup string formatting.
                  </span>
                )}
              </div>
              <button 
                type="submit"
                disabled={!importJsonText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold px-4 py-1.5 shrink-0"
              >
                Restore Import
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backup & System utilities (Takes 1 column) */}
      <div className="space-y-6">
        
        {/* Profile Card View */}
        <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-sm text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-black font-headline mx-auto shadow overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.substring(0,2).toUpperCase()
            )}
          </div>

          <div>
            <h4 className="text-md font-bold font-headline leading-tight truncate">{name}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans truncate">{major}</p>
            <p className="text-[10px] text-slate-500 font-sans uppercase tracking-wider">{university}</p>
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-around text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Goal GPA</span>
              <span className="font-mono font-bold text-amber-400">{safeTargetGpa.toFixed(2)}</span>
            </div>
            
            <div className="border-l border-slate-800 h-6" />

            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Sys Config</span>
              <span className="font-mono font-bold text-blue-400">{safeGpaScale.toFixed(1)} Scale</span>
            </div>
          </div>
        </div>

        {/* Data Utilities Portability */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
          <h4 className="text-md font-bold font-headline text-slate-900 flex items-center gap-1.5">
            <Download size={18} className="text-slate-600" />
            <span>Portable Utilities</span>
          </h4>

          <div className="space-y-2 text-xs font-sans">
            <button
              onClick={handleExportClick}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-150 hover:bg-slate-50 transition-colors cursor-pointer text-left font-sans"
              id="btn-export-backup"
            >
              <div>
                <strong className="block text-slate-800 text-xs font-sans">Export academic data</strong>
                <span className="text-[10px] text-slate-400 font-sans">Download JSON backup payload files.</span>
              </div>
              <Download size={16} className="text-slate-400 shrink-0" />
            </button>

            <button
              onClick={() => {
                if (confirm('Are you absolutely sure you want to restore the defaults? This will erase all custom semesters, courses, assignments, and exams currently registered!')) {
                  onResetData();
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition-colors cursor-pointer text-left font-sans"
              id="btn-wipe-reset"
            >
              <div>
                <strong className="block text-amber-800 font-semibold text-xs">Wipe &amp; reload mock data</strong>
                <span className="text-[10px] text-slate-400">Restores preloaded courseworks database.</span>
              </div>
              <RotateCcw size={16} className="text-amber-600 shrink-0" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
