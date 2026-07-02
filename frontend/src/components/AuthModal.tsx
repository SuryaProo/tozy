import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

type Mode = 'login' | 'register' | 'mobile';

const AuthModal: React.FC = () => {
  const { isLoginOpen, closeLogin, login, register, requestOtp, verifyOtp } = useAuth();
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
  const [otpName, setOtpName]   = useState('');     // asked only for brand-new mobile users
  const [devOtp, setDevOtp]     = useState('');      // shown in dev mode for easy testing
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isLoginOpen ? 'hidden' : '';
    if (isLoginOpen) setTimeout(() => inputRef.current?.focus(), 120);
    return () => { document.body.style.overflow = ''; };
  }, [isLoginOpen]);

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
        else setSuccess('Welcome back!');
      } else {
        if (!name.trim()) { setError('Name is required.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        const res = await register(name, email, password);
        if (!res.ok) setError(res.error ?? 'Registration failed.');
        else setSuccess('Account created! Welcome to TozYcozY.');
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
      if (res.devOtp) setDevOtp(res.devOtp); // dev convenience — backend only sends this outside production
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
    <AnimatePresence>
      {isLoginOpen && (
        <motion.div
          className="auth-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeLogin}
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
            <button className="auth-close" onClick={closeLogin} aria-label="Close">✕</button>

            <div className="auth-brand">
              <span className="auth-logo-t">TOZY</span>
              <span className="auth-logo-c">COZY</span>
            </div>

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
                        <label className="auth-label">Enter OTP sent to +91 {phone}</label>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
