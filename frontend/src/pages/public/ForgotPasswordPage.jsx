import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { forgotPassword, verifyOtp, resetPasswordWithOtp } from '../../services/authService';

const ForgotPasswordPage = () => {
  // Steps: 'EMAIL' (1) -> 'VERIFY_OTP' (2) -> 'SET_PASSWORD' (3) -> 'SUCCESS' (4)
  const [step, setStep] = useState('EMAIL');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.trim()) {
      setError('Please provide your registered institutional email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setMessage(res.message || `A 6-digit verification code has been sent to ${email}`);
        setStep('VERIFY_OTP');
        setResendTimer(60); // 60 seconds cooldown
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please verify your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resending OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;

    try {
      setResending(true);
      setError('');
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setMessage(`A fresh OTP code has been re-sent to ${email}`);
        setResendTimer(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code sent to your email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await verifyOtp(email.trim(), cleanOtp);
      if (res.success) {
        setMessage('OTP verified successfully! Please enter your new password below.');
        setStep('SET_PASSWORD');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Set New Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await resetPasswordWithOtp(email.trim(), otp.trim(), newPassword);
      if (res.success) {
        setStep('SUCCESS');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please request a new OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password matching indicator
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordLengthValid = newPassword.length >= 6;

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-lg p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-scale-up">
        
        {/* Step Progress Indicators */}
        {step !== 'SUCCESS' && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xs mx-auto relative">
              {/* Connector Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-300"
                style={{
                  width: step === 'EMAIL' ? '0%' : step === 'VERIFY_OTP' ? '50%' : '100%',
                }}
              />

              {/* Step 1 Node */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    step === 'EMAIL'
                      ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-brand-500/30'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {step !== 'EMAIL' ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">Email</span>
              </div>

              {/* Step 2 Node */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    step === 'VERIFY_OTP'
                      ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-brand-500/30'
                      : step === 'SET_PASSWORD'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {step === 'SET_PASSWORD' ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">Verify OTP</span>
              </div>

              {/* Step 3 Node */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    step === 'SET_PASSWORD'
                      ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-brand-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  3
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">Password</span>
              </div>
            </div>
          </div>
        )}

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25 mb-3">
            {step === 'SUCCESS' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : step === 'SET_PASSWORD' ? (
              <Lock className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {step === 'EMAIL' && 'Forgot Password'}
            {step === 'VERIFY_OTP' && 'Verify OTP Code'}
            {step === 'SET_PASSWORD' && 'Create New Password'}
            {step === 'SUCCESS' && 'Password Changed!'}
          </h1>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {step === 'EMAIL' && 'Enter your institutional email address to receive a secure 6-digit verification code.'}
            {step === 'VERIFY_OTP' && `Enter the 6-digit OTP code sent to ${email} to verify your identity.`}
            {step === 'SET_PASSWORD' && 'OTP verified! Enter your new password below to secure your library account.'}
            {step === 'SUCCESS' && 'Your password has been successfully updated. You can now log in.'}
          </p>
        </div>

        {/* Status Messages */}
        {message && step !== 'SUCCESS' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* STEP 1: Request OTP Form */}
        {step === 'EMAIL' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-700 hover:via-indigo-700 hover:to-brand-800 rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send 6-Digit OTP</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP Only (No Password Fields) */}
        {step === 'VERIFY_OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            
            {/* Email pill with edit button */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 truncate">
                  OTP sent to: <strong className="text-slate-900 dark:text-white">{email}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('EMAIL');
                  setError('');
                }}
                className="text-brand-600 dark:text-brand-400 hover:underline font-bold text-[11px] shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            {/* 6-Digit OTP Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter 6-Digit OTP Code *
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resending}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3.5 text-xl font-mono tracking-widest text-center font-extrabold rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-700 hover:via-indigo-700 hover:to-brand-800 rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify OTP Code</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Set New Password Form (Only shown AFTER OTP is verified) */}
        {step === 'SET_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {/* Verified Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Identity verified for <strong>{email}</strong></span>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  autoFocus
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordLengthValid || !passwordsMatch}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-brand-600 to-indigo-600 hover:from-emerald-700 hover:via-brand-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-6 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your password has been securely updated. You can now sign in with your new password.
            </p>

            <Link
              to="/login"
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Back to Login Footer */}
        {step !== 'SUCCESS' && (
          <div className="mt-6 pt-4 text-center border-t border-slate-100 dark:border-slate-800/80">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
