import { useState, FormEvent, ChangeEvent } from "react";
import { registerUser } from "../api/authApi";
import {
  GraduationCap, User, Mail, Lock, Eye, EyeOff,
  ArrowRight, Loader2, ArrowLeft, CheckCircle2
} from "lucide-react";

interface RegisterViewProps {
  onNavigateLogin: () => void;
}

export default function RegisterView({ onNavigateLogin }: RegisterViewProps) {

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      setSuccess(true);
    } catch {
      setError("Registration failed. The email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/40 mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your Gradify account is ready. Sign in to access your dashboard.
          </p>
          <button
            onClick={onNavigateLogin}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all"
          >
            <span>Go to Login</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 relative overflow-hidden">

      {/* Background decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gradify</h1>
          <p className="text-sm text-slate-400 mt-1">Create your academic account</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Create account</h2>
            <p className="text-sm text-slate-400 mt-1">Start tracking your academic journey</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">First Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="reg-firstname"
                    type="text"
                    value={form.firstName}
                    onChange={update("firstName")}
                    placeholder="Kavindu"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Last Name</label>
                <input
                  id="reg-lastname"
                  type="text"
                  value={form.lastName}
                  onChange={update("lastName")}
                  placeholder="Peiris"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@university.edu"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <button
              id="goto-login"
              onClick={onNavigateLogin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          © 2026 Gradify · Student Academic Platform
        </p>
      </div>
    </div>
  );
}
