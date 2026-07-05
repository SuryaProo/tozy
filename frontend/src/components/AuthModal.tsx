import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import VerifySuccess from './VerifySuccess';
import './AuthModal.css';

type Mode = 'login' | 'register' | 'mobile';

const AuthModal: React.FC = () => {
  const { isLoginOpen, closeLogin, login, register, requestOtp, verifyOtp, emailVerifyOpen, setEmailVerifyOpen, refreshUser } = useAuth();
  const [mode, setMode]         = useState<Mode>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Mobile/OTP specific state ──
  const [phone, setPhone]       = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [otpCode, setOtpCode]   = useState('');
  const [otpName, setOtpName]   = useState('');
  const [devOtp, setDevOtp]     = useState('');
  const [smsSent, setSmsSent]   = useState(false);
  const [emailHint, setEmailHint] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [emailOtp, setEmailOtp]               = useState('');
  const [verifyLoading, setVerifyLoading]     = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);

  useEffect(() => {
    document.body.style.overflow = isLoginOpen ? 'hidden' : '';
    if (isLoginOpen) setTimeout(() => inputRef.current?.focus(), 120);
    return () => { document.body.style.overflow = ''; };
  }, [isLoginOpen]);

  // Auto-show email verification screen when opened from cart
  useEffect(() => {
    if (emailVerifyOpen && isLoginOpen) {
      setShowEmailVerify(true);
      setEmailVerifyOpen(false);
    }
  }, [emailVerifyOpen, isLoginOpen, setEmailVerifyOpen]);

  // Reset everything when switching modes or closing
  useEffect(() => {
    setError(''); setSuccess('');
    setName(''); setEmail(''); setPassword('');
    setPhone(''); setOtpSent(false); setOtpCode(''); setOtpName(''); setDevOtp('');
  }, [mode, isLoginOpen]);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLogin(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [closeLogin]);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ── Email login/register submit ──
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.ok) setError(res.error ?? 'Login failed.');
        else {
          setSuccess('Welcome back!');
          setTimeout(() => closeLogin(), 1200);
        }
      } else {
        if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        const res = await register(name, email, password);
        if (!res.ok) setError(res.error ?? 'Registration failed.');
        else {
          // Backend already sent email verification OTP during register
          setSuccess('Account created! Check your email for OTP.');
          setShowEmailVerify(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await requestOtp(phone);
      if (!res.ok) {
        setError(res.error ?? 'Failed to send OTP.');
        return;
      }
      setOtpSent(true);
      setResendTimer(30);
      setSmsSent(res.smsSent ?? false);
      setEmailHint(res.emailHint ?? '');
      if (res.devOtp) setDevOtp(res.devOtp);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await verifyOtp(phone, otpCode, otpName || undefined);
      if (!res.ok) setError(res.error ?? 'Invalid OTP.');
      else setSuccess('Signed in successfully!');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError(''); setLoading(true);
    try {
      const res = await requestOtp(phone);
      if (res.ok) {
        setResendTimer(30);
        if (res.devOtp) setDevOtp(res.devOtp);
      } else {
        setError(res.error ?? 'Failed to resend OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      {(isLoginOpen || showEmailVerify) && (
        <motion.div
          className="auth-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => { if (!showEmailVerify) closeLogin(); }}
        >
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button className="auth-close" onClick={() => { if (showEmailVerify) { setShowEmailVerify(false); } closeLogin(); }} aria-label="Close">✕</button>

            <div className="auth-brand">
              <span className="auth-logo-t">TOZY</span>
              <span className="auth-logo-c">COZY</span>
            </div>

            {/* Email verification step — shows after register */}
            {showEmailVerify ? (
              <div className="auth-verify-wrap">
                <div className="auth-verify-icon">📧</div>
                <h3 className="auth-verify-title">Verify your email</h3>
                <p className="auth-verify-sub">
                  We sent a 6-digit OTP to <strong>{email}</strong>.<br />
                  Enter it below to verify your account.
                </p>
                {error   && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}
                <input
                  className="auth-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={emailOtp}
                  onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />
                <button
                  className="auth-submit"
                  disabled={verifyLoading || emailOtp.length !== 6}
                  onClick={async () => {
                    setError(''); setVerifyLoading(true);
                    try {
                      const res = await api.post('/auth/email/verify', { code: emailOtp });
                      if (res.success) {
                        // Refresh user so emailVerified becomes true
                        await refreshUser();
                        // Close modal, show 3D success popup
                        setShowEmailVerify(false);
                        closeLogin();
                        setShowSuccess(true);
                      } else {
                        setError(res.message || 'Invalid OTP.');
                      }
                    } catch {
                      setError('Verification failed. Try again.');
                    } finally {
                      setVerifyLoading(false);
                    }
                  }}
                >
                  {verifyLoading ? 'Verifying…' : 'Verify Email →'}
                </button>
                <button
                  className="auth-skip-verify"
                  onClick={() => { setShowEmailVerify(false); closeLogin(); }}
                >
                  Skip for now (verify later)
                </button>
              </div>
            ) : (
            <>
            {/* Tabs */}
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
                Sign In
              </button>
              <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
                Create Account
              </button>
              <button className={`auth-tab ${mode === 'mobile' ? 'active' : ''}`} onClick={() => setMode('mobile')}>
                Mobile OTP
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* ═══ EMAIL LOGIN / REGISTER ═══ */}
              {(mode === 'login' || mode === 'register') && (
                <motion.form
                  key={mode}
                  className="auth-form"
                  onSubmit={handleEmailSubmit}
                  initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {mode === 'register' && (
                    <div className="auth-field">
                      <label className="auth-label">Full Name</label>
                      <input
                        ref={inputRef}
                        className="auth-input"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                      ref={mode === 'login' ? inputRef : undefined}
                      className="auth-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                      className="auth-input"
                      type="password"
                      placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {mode === 'login' && (
                    <button type="button" className="auth-forgot">Forgot password?</button>
                  )}

                  {error && <motion.div className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}
                  {success && <motion.div className="auth-success" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>✓ {success}</motion.div>}

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                  </button>
                </motion.form>
              )}

              {/* ═══ MOBILE + OTP ═══ */}
              {mode === 'mobile' && (
                <motion.div
                  key="mobile"
                  className="auth-form"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {!otpSent ? (
                    /* Step 1 — enter phone number */
                    <form onSubmit={handleSendOtp} className="auth-form" style={{ gap: 16 }}>
                      <div className="auth-field">
                        <label className="auth-label">Mobile Number</label>
                        <div className="phone-input-row">
                          <span className="phone-prefix">+91</span>
                          <input
                            ref={inputRef}
                            className="auth-input phone-input"
                            type="tel"
                            inputMode="numeric"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            required
                            pattern="[6-9][0-9]{9}"
                            maxLength={10}
                          />
                        </div>
                      </div>

                      {error && <motion.div className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}

                      <button type="submit" className="auth-submit" disabled={loading || phone.length !== 10}>
                        {loading ? <span className="auth-spinner" /> : 'Send OTP →'}
                      </button>
                      <p className="auth-demo-hint">We'll text a 6-digit code to verify it's you.</p>
                    </form>
                  ) : (
                    /* Step 2 — enter OTP code */
                    <form onSubmit={handleVerifyOtp} className="auth-form" style={{ gap: 16 }}>
                      <button type="button" className="checkout-back-link" onClick={() => setOtpSent(false)}>
                        ← Change number
                      </button>

                      <div className="auth-field">
                        {/* Show where OTP was sent */}
                        {smsSent ? (
                          <label className="auth-label">Enter OTP sent to +91 {phone}</label>
                        ) : emailHint ? (
                          <div className="auth-sms-fallback">
                            <span>📱 SMS could not be delivered</span>
                            <span>📧 OTP sent to <strong>{emailHint}</strong> instead</span>
                          </div>
                        ) : (
                          <label className="auth-label">Enter OTP sent to +91 {phone}</label>
                        )}
                        <input
                          className="auth-input otp-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="––––––"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          maxLength={6}
                          autoFocus
                        />
                      </div>

                      {devOtp && (
                        <div className="auth-dev-otp">
                          🧪 Dev mode — your OTP is <strong>{devOtp}</strong> (check server console too)
                        </div>
                      )}

                      {/* Name field only shown for first-time mobile users — harmless to always show */}
                      <div className="auth-field">
                        <label className="auth-label">Your Name (optional, for new accounts)</label>
                        <input
                          className="auth-input"
                          type="text"
                          placeholder="e.g. Surya"
                          value={otpName}
                          onChange={e => setOtpName(e.target.value)}
                        />
                      </div>

                      {error && <motion.div className="auth-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}
                      {success && <motion.div className="auth-success" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>✓ {success}</motion.div>}

                      <button type="submit" className="auth-submit" disabled={loading || otpCode.length !== 6}>
                        {loading ? <span className="auth-spinner" /> : 'Verify & Sign In →'}
                      </button>

                      <button type="button" className="auth-resend" onClick={handleResend} disabled={resendTimer > 0 || loading}>
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {mode !== 'mobile' && (
              <>
                <div className="auth-divider"><span>or</span></div>
                <div className="auth-socials">
                  <button className="auth-social-btn" type="button" onClick={() => setMode('mobile')}>
                    <span>📱</span> Continue with Mobile OTP
                  </button>
                </div>
              </>
            )}

            <p className="auth-switch">
              {mode === 'login' && <> Don't have an account? <button type="button" onClick={() => setMode('register')}>Sign up</button></>}
              {mode === 'register' && <> Already have an account? <button type="button" onClick={() => setMode('login')}>Sign in</button></>}
              {mode === 'mobile' && <> Prefer email? <button type="button" onClick={() => setMode('login')}>Sign in with email</button></>}
            </p>
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 3D Success celebration */}
    <VerifySuccess
      show={showSuccess}
      onDone={() => setShowSuccess(false)}
    />
    </>
  );
};

export default AuthModal;
