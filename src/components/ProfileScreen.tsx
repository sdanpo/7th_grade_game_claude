import { motion } from 'framer-motion';
import type { GameState } from '../types';
import { rooms } from '../data/puzzles';
import { ArrowLeft, Star, Trophy, Flame, Target } from 'lucide-react';

interface Props {
  state: GameState;
  userEmail?: string | null;
  onBack: () => void;
  onReset: () => void;
  onSignOut?: () => void;
}

function xpToNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const needed = ((level) ** 2) * 50;
  const current = xp - ((level - 1) ** 2) * 50;
  return { current, needed: needed - ((level - 1) ** 2) * 50, level };
}

const achievements = [
  { id: 'first-solve', icon: '🎯', name: 'פותר ראשון', desc: 'פתרת את החידה הראשונה שלך', condition: (s: GameState) => s.totalSolved >= 1 },
  { id: 'speed-demon', icon: '⚡', name: 'שד המהירות', desc: '5 פתרונות מושלמים', condition: (s: GameState) => s.perfectSolves >= 5 },
  { id: 'streak-3', icon: '🔥', name: 'שלהבת', desc: '3 ימים רצופים', condition: (s: GameState) => s.streak >= 3 },
  { id: 'streak-7', icon: '💎', name: 'יהלום', desc: '7 ימים רצופים', condition: (s: GameState) => s.streak >= 7 },
  { id: 'coin-100', icon: '🪙', name: 'עשיר ראשון', desc: '100 מטבעות שנאספו', condition: (s: GameState) => s.totalCoins >= 100 },
  { id: 'coin-1000', icon: '💰', name: 'מיליונר', desc: '1000 מטבעות שנאספו', condition: (s: GameState) => s.totalCoins >= 1000 },
  { id: 'solver-10', icon: '🧩', name: 'פותר חידות', desc: '10 חידות פתורות', condition: (s: GameState) => s.totalSolved >= 10 },
  { id: 'solver-25', icon: '🏆', name: 'אלוף', desc: '25 חידות פתורות', condition: (s: GameState) => s.totalSolved >= 25 },
];

export function ProfileScreen({ state, userEmail, onBack, onReset, onSignOut }: Props) {
  const { current, needed, level } = xpToNextLevel(state.xp);
  const totalPuzzles = rooms.reduce((a, r) => a + r.puzzles.length, 0);
  const completionRate = Math.round((state.solvedPuzzles.length / totalPuzzles) * 100);

  const stats = [
    { icon: <Star size={20} className="text-yellow-400" />, label: 'רמה', value: level },
    { icon: <Trophy size={20} className="text-yellow-400" />, label: 'XP', value: state.xp.toLocaleString() },
    { icon: <Target size={20} className="text-purple-400" />, label: 'חידות פתורות', value: `${state.solvedPuzzles.length}/${totalPuzzles}` },
    { icon: <Flame size={20} className="text-orange-400" />, label: 'רצף', value: `${state.streak} ימים` },
    { icon: <span className="text-lg">🪙</span>, label: 'מטבעות שנאספו', value: state.totalCoins.toLocaleString() },
    { icon: <span className="text-lg">⚡</span>, label: 'פתרונות מושלמים', value: state.perfectSolves },
  ];

  return (
    <div className="min-h-screen pb-8 pt-16"
      style={{ background: 'linear-gradient(180deg, #0d0a1e, #0a0518)' }}>
      
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-purple text-sm font-bold shrink-0">
          <ArrowLeft size={15} />
          <span>חזרה</span>
        </button>
        <h2 className="text-gold-glow font-black text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
          👤 הפרופיל שלי
        </h2>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-6 glass-card gold-border-glow p-6 text-center rounded-2xl"
      >
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-3 animate-float"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', border: '3px solid #FFD700' }}>
          {state.avatar}
        </div>
        <h3 className="text-white font-black text-xl mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
          {state.playerName}
        </h3>
        <p className="text-yellow-400 font-semibold">רמה {level} גיבור</p>
        
        {/* XP bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>XP: {current}</span>
            <span>לרמה הבאה: {needed}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(current / needed) * 100}%` }} />
          </div>
        </div>

        {/* Completion */}
        <div className="mt-3 text-sm text-gray-400">
          השלמת {completionRate}% מהמשחק
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="px-4 mb-6">
        <h3 className="text-yellow-400 font-bold mb-3">📊 סטטיסטיקות</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3 rounded-xl flex items-center gap-3"
            >
              {stat.icon}
              <div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className="font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-6">
        <h3 className="text-yellow-400 font-bold mb-3">🏆 הישגים</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((ach, i) => {
            const earned = ach.condition(state);
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-3 rounded-xl ${!earned ? 'opacity-40' : ''}`}
                style={{ border: earned ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-2xl mb-1">{ach.icon}</div>
                <p className={`font-bold text-sm ${earned ? 'text-yellow-400' : 'text-gray-400'}`}>{ach.name}</p>
                <p className="text-gray-500 text-xs">{ach.desc}</p>
                {earned && <p className="text-green-400 text-xs mt-1">✓ הושג!</p>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Account info + sign out */}
      {(userEmail || onSignOut) && (
        <div className="px-4 mb-4">
          <div className="glass-card p-4 rounded-xl flex items-center justify-between"
            style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
            <div>
              <p className="text-xs text-gray-400">מחובר כ-</p>
              <p className="text-purple-300 text-sm font-semibold truncate">{userEmail ?? 'אורח'}</p>
            </div>
            {onSignOut && (
              <button
                onClick={() => {
                  if (window.confirm('האם לצאת מהחשבון?')) onSignOut();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}
              >
                יציאה
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reset button */}
      <div className="px-4">
        <button
          onClick={() => {
            if (window.confirm('האם אתה בטוח שברצונך לאפס את כל ההתקדמות? פעולה זו בלתי הפיכה!')) {
              onReset();
            }
          }}
          className="w-full py-3 rounded-xl font-bold text-sm text-red-400 transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          🗑️ אפס התקדמות
        </button>
      </div>
    </div>
  );
}
