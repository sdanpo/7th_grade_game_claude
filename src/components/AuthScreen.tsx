import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { StarField } from './StarField';

interface Props {
  onAuth: () => void;
  onGuest: () => void;
}

type Mode = 'login' | 'register';

export function AuthScreen({ onAuth, onGuest }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const clearMessages = () => { setError(''); setMessage(''); };

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    clearMessages();

    if (mode === 'login') {
      const { error: err } = await supabase!.auth.signInWithPassword({ email, password });
      if (err) setError(translateError(err.message));
      else onAuth();
    } else {
      const { error: err } = await supabase!.auth.signUp({ email, password });
      if (err) setError(translateError(err.message));
      else setMessage('נשלח מייל אימות 📧 — בדוק את תיבת הדואר ולחץ על הקישור.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    clearMessages();
    const { error: err } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (err) { setError(translateError(err.message)); setGoogleLoading(false); }
    // On success the page redirects — no need to call onAuth() here
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: 'linear-gradient(180deg, #0d0a1e, #0a0518)' }}>
      <StarField />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full"
        style={{ maxWidth: '400px' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl inline-block mb-3"
          >🧩</motion.div>
          <h1 className="text-gold-glow text-3xl font-black" style={{ fontFamily: 'Cinzel, serif' }}>
            MathQuest
          </h1>
          <p className="text-gray-400 text-sm mt-1">חדרי הבריחה • כיתה ז׳</p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl p-1 mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m}
              onClick={() => { setMode(m); clearMessages(); }}
              className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: mode === m ? 'rgba(124,58,237,0.6)' : 'transparent',
                color: mode === m ? '#e9d5ff' : '#6b7280',
                border: 'none',
              }}
            >
              {m === 'login' ? '🔑 כניסה' : '✨ הרשמה'}
            </button>
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl"
          style={{ border: '1px solid rgba(255,215,0,0.2)' }}>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl font-bold text-sm mb-5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'white',
            }}
          >
            {googleLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {mode === 'login' ? 'כניסה עם Google' : 'הרשמה עם Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-gray-600 text-xs">או עם אימייל</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email */}
          <input
            type="email"
            className="answer-input mb-3"
            placeholder="כתובת אימייל"
            value={email}
            onChange={e => setEmail(e.target.value)}
            dir="ltr"
            autoComplete="email"
          />

          {/* Password */}
          <input
            type="password"
            className="answer-input mb-4"
            placeholder={mode === 'register' ? 'סיסמא (לפחות 6 תווים)' : 'סיסמא'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            dir="ltr"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {/* Error / success messages */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm text-center mb-3 leading-relaxed" dir="rtl"
              >⚠️ {error}</motion.p>
            )}
            {message && (
              <motion.p
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-green-400 text-sm text-center mb-3 leading-relaxed" dir="rtl"
              >✅ {message}</motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            onClick={handleEmailAuth}
            disabled={loading || !email || !password}
            className="btn-gold w-full py-3 rounded-xl font-black text-lg disabled:opacity-50"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {loading
              ? <span className="inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : mode === 'login' ? '⚔️ כניסה למשחק' : '🚀 הצטרפות'}
          </button>
        </div>

        {/* Guest option */}
        <div className="text-center mt-5">
          <button
            onClick={onGuest}
            className="text-gray-500 text-sm hover:text-gray-300 transition-colors underline underline-offset-2"
            style={{ border: 'none', background: 'none' }}
          >
            המשך ללא חשבון (ההתקדמות נשמרת רק בדפדפן)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Translate common Supabase auth errors to Hebrew
function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials'))  return 'אימייל או סיסמא שגויים';
  if (msg.includes('Email not confirmed'))         return 'אנא אמת את האימייל שלך קודם';
  if (msg.includes('User already registered'))     return 'כתובת האימייל כבר רשומה במערכת';
  if (msg.includes('Password should be at least')) return 'הסיסמא חייבת לכלול לפחות 6 תווים';
  if (msg.includes('Unable to validate'))          return 'כתובת אימייל לא תקינה';
  if (msg.includes('rate limit'))                  return 'יותר מדי נסיונות, נסה שוב מאוחר יותר';
  return msg;
}
