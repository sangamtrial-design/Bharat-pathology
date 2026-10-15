import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../lib/adminAuth';
import {
  Lock,
  Mail,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LAB_DETAILS } from '../../data';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const AdminLoginPage: React.FC = () => {
  const { login, accessDenied, logout, user, resetPassword } = useAdminAuth();

  // Email and password start with default admin credentials ready for the laboratory
  const [email, setEmail] = useState('admin@bharatpathology.com');
  const [password, setPassword] = useState('Bharat@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Anti-Brute-Force & Security Lockout
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('bp_admin_fails');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutExpiry, setLockoutExpiry] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('bp_admin_lockout');
      if (stored) {
        const expiry = parseInt(stored, 10);
        if (expiry > Date.now()) return expiry;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutExpiry) {
      setRemainingSeconds(0);
      return;
    }

    const checkLockout = () => {
      const diff = Math.max(0, Math.ceil((lockoutExpiry - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0) {
        setLockoutExpiry(null);
        setFailedAttempts(0);
        try {
          localStorage.removeItem('bp_admin_lockout');
          localStorage.removeItem('bp_admin_fails');
        } catch {
          // ignore
        }
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [lockoutExpiry]);

  const recordFailedAttempt = () => {
    const nextFails = failedAttempts + 1;
    setFailedAttempts(nextFails);
    try {
      localStorage.setItem('bp_admin_fails', String(nextFails));
    } catch {
      // ignore
    }

    if (nextFails >= MAX_FAILED_ATTEMPTS) {
      const expiry = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutExpiry(expiry);
      try {
        localStorage.setItem('bp_admin_lockout', String(expiry));
      } catch {
        // ignore
      }
    }
  };

  const clearFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutExpiry(null);
    try {
      localStorage.removeItem('bp_admin_fails');
      localStorage.removeItem('bp_admin_lockout');
    } catch {
      // ignore
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (lockoutExpiry && Date.now() < lockoutExpiry) {
      setErrorMessage(`Terminal is locked for security. Please wait ${remainingSeconds} seconds.`);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your laboratory email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      clearFailedAttempts();
    } catch (err: any) {
      recordFailedAttempt();
      const currentFails = failedAttempts + 1;
      const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - currentFails);

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        if (attemptsLeft > 0) {
          setErrorMessage(`Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before security lockout.`);
        } else {
          setErrorMessage('Too many failed attempts. Terminal temporarily locked for 5 minutes.');
        }
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed requests. Access temporarily locked for security.');
      } else {
        setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const targetEmail = (email || 'sangamtrial@gmail.com').trim();
    if (!targetEmail) {
      setErrorMessage('Please enter your email above to receive a reset link.');
      return;
    }
    setIsResetting(true);
    setResetMessage('');
    setErrorMessage('');
    try {
      await resetPassword(targetEmail);
      setResetMessage(`Password reset link sent to ${targetEmail}! Please check your Gmail inbox / spam folder.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send reset email. Please verify the email address.');
    } finally {
      setIsResetting(false);
    }
  };

  // Access Denied screen
  if (accessDenied && user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Access Restricted</h2>
            <p className="text-xs text-rose-300 font-medium mt-1">
              Account ({user.email}) is not an authorized laboratory administrator.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="font-semibold text-slate-200">Security Policy:</div>
            <p className="text-slate-400">
              Only authorized personnel listed in the internal laboratory registry can access patient diagnostics and booking data.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-colors"
            >
              Sign out and try authorized account
            </button>
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white py-2 transition-colors block"
            >
              Return to public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = Boolean(lockoutExpiry && remainingSeconds > 0);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.18),rgba(255,255,255,0))] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-teal-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Public Website</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950/80 border border-teal-800/60 text-teal-300 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span>Protected Terminal</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Header Banner */}
        <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-800/40 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/25 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {LAB_DETAILS.name}
              </h1>
              <p className="text-xs text-teal-400 font-medium">
                Laboratory Operations & Booking Console
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restricted diagnostic administration portal. Unauthorized access attempts are monitored and logged.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* Lockout Banner */}
          {isLocked && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <ShieldX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300">Terminal Locked for Security</div>
                <p className="mt-0.5 text-rose-200/90 leading-relaxed">
                  Too many consecutive failed login attempts detected. Entry is locked for{' '}
                  <strong className="text-white font-mono">{remainingSeconds}s</strong> to prevent unauthorized brute-force attempts.
                </p>
              </div>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {resetMessage && (
              <div className="p-3.5 rounded-2xl bg-teal-950/70 border border-teal-800/80 text-teal-200 text-xs flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            )}

            {errorMessage && !isLocked && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  disabled={isLocked}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bharatpathology.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  disabled={isResetting || isLocked}
                  onClick={handleResetPassword}
                  className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <span>Forgot password?</span>
                  )}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/20 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Terminal</span>
              )}
            </button>

            {/* Quick Helper Credentials Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-teal-400 font-semibold text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Default Laboratory Credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@bharatpathology.com');
                    setPassword('Bharat@2026');
                    setErrorMessage('');
                    setResetMessage('');
                  }}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-medium hover:underline cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-200 font-medium select-all">admin@bharatpathology.com</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Password:</span>
                  <span className="text-teal-300 font-bold tracking-wider select-all">Bharat@2026</span>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 leading-normal">
                Registered Owner: <span className="text-slate-400">sangamtrial@gmail.com</span> (Click "Forgot password?" to send a direct reset link to your Gmail).
              </div>
            </div>
          </form>

        </div>

        {/* Footer Security Badge */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>256-bit Encrypted Session</span>
          </div>
          <span>Brute-force Protected</span>
        </div>

      </div>

    </div>
  );
};

