import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarField } from './StarField';

interface Props {
  onStart: (name: string) => void;
  playerName: string;
}

export function HomePage({ onStart, playerName }: Props) {
  const [name, setName] = useState(playerName);
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!name.trim()) { setError('הכנס שם כדי להתחיל!'); return; }
    onStart(name.trim());
  };

  // Remove unused variants - use inline animate instead

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center stars-bg overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d0a1e 0%, #1a0a2e 50%, #0d0a1e 100%)' }}>
      <StarField />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 animate-float"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', animationDelay: '0s' }} />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-15 animate-float"
        style={{ background: 'radial-gradient(circle, #00f5ff, transparent)', animationDelay: '1.5s' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 max-w-lg w-full">
        {/* Logo */}
        <motion.div
          animate={{ y: [-12, 12, -12] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center"
        >
          <div className="text-7xl mb-2">🧩</div>
          <h1 className="text-gold-glow text-4xl font-black mb-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
            MathQuest
          </h1>
          <p className="text-2xl text-gold-glow font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
            חדרי הבריחה
          </p>
          <p className="text-gray-400 text-sm mt-2">חשבון · לוגיקה · הרפתקה</p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {['🏆 נקודות ופרסים', '📷 אתגרי מצלמה', '🎤 זיהוי קול', '🔥 רצף יומי', '🧠 50+ חידות'].map(feat => (
            <span key={feat} className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', color: '#c4b5fd' }}>
              {feat}
            </span>
          ))}
        </motion.div>

        {/* Name input card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="glass-card gold-border-glow w-full p-6"
        >
          <p className="text-center text-gray-300 mb-4 font-semibold">
            {playerName ? `ברוך שובך, ${playerName}! 👋` : 'מי אתה, גיבור?'}
          </p>
          <input
            className="answer-input"
            placeholder="הכנס את שמך..."
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            dir="rtl"
            maxLength={20}
          />
          {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}

          <button
            onClick={handleStart}
            className="btn-gold w-full mt-4 py-4 rounded-xl text-xl font-black animate-pulse-gold"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
          >
            {playerName ? '🚀 המשך הרפתקה' : '⚔️ התחל הרפתקה'}
          </button>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-3 w-full text-center"
        >
          {[
            { icon: '🏰', label: '5 חדרים', sub: 'להתגלות' },
            { icon: '💰', label: '₪ מטבעות', sub: 'לאיסוף' },
            { icon: '🎁', label: '15 פרסים', sub: 'לרכישה' },
          ].map(item => (
            <div key={item.label} className="glass-card p-3 rounded-xl">
              <div className="text-2xl">{item.icon}</div>
              <div className="text-gold-glow font-bold text-sm">{item.label}</div>
              <div className="text-gray-500 text-xs">{item.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
