import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dailyChallenges } from '../data/puzzles';
import type { GameState } from '../types';
import { ConfettiEffect } from './ConfettiEffect';
import { ArrowLeft } from 'lucide-react';

interface Props {
  state: GameState;
  onBack: () => void;
  onComplete: (reward: number) => void;
}

function getTodayChallenge() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return dailyChallenges[dayOfYear % dailyChallenges.length];
}

export function DailyChallenge({ state, onBack, onComplete }: Props) {
  const challenge = getTodayChallenge();
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const showSolution = wrongAttempts >= 3 && result !== 'correct';

  const handleSubmit = () => {
    const ua = answer.trim();
    const correct = String(challenge.answer).trim();
    if (ua === correct || Number(ua) === Number(challenge.answer)) {
      setResult('correct');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      onComplete(challenge.reward);
    } else {
      setResult('wrong');
      setWrongAttempts(w => w + 1);
      setTimeout(() => setResult(null), 1000);
    }
  };

  const daysLeft = (() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = Math.floor((midnight.getTime() - now.getTime()) / 3600000);
    return `${diff} שעות`;
  })();

  return (
    <div className="min-h-screen pb-8 pt-16 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0d0a1e, #1a0a2e)' }}>
      <ConfettiEffect active={showConfetti} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-purple text-sm font-bold shrink-0">
          <ArrowLeft size={15} />
          <span>חזרה</span>
        </button>
        <div>
          <h2 className="text-gold-glow font-black text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
            ⚡ אתגר יומי
          </h2>
          <p className="text-gray-400 text-xs">מתחדש בעוד {daysLeft}</p>
        </div>
      </div>

      <div className="flex-1 px-4">
        {state.dailyChallengeCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass-card gold-border-glow p-8 text-center rounded-2xl"
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-gold-glow font-black text-xl mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              הצלחת היום!
            </h3>
            <p className="text-gray-400">חזור מחר לאתגר חדש</p>
            <p className="text-yellow-400 font-bold mt-2">+{challenge.reward} מטבעות נצברו 🪙</p>
            <div className="mt-6 p-4 rounded-xl text-sm text-gray-300"
              style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.1)' }}>
              <p className="font-semibold mb-1">השאלה של היום:</p>
              <p>{challenge.question}</p>
              <p className="text-green-400 mt-2 font-bold">תשובה: {challenge.answer}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Prize display */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl animate-pulse-gold"
                style={{ background: 'rgba(255,215,0,0.15)', border: '2px solid rgba(255,215,0,0.5)' }}>
                <span className="text-3xl">🪙</span>
                <span className="text-gold-glow font-black text-3xl" style={{ fontFamily: 'Cinzel, serif' }}>
                  +{challenge.reward}
                </span>
                <span className="text-gray-400 text-sm">בונוס</span>
              </div>
            </div>

            {/* Challenge card */}
            <div className={`glass-card p-6 rounded-2xl mb-4 ${result === 'correct' ? 'correct-flash' : result === 'wrong' ? 'wrong-flash' : ''}`}
              style={{ border: '1px solid rgba(255,215,0,0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
                  ⚡ אתגר יומי
                </span>
              </div>

              <p className="text-white font-semibold text-xl leading-relaxed mb-4" dir="rtl">
                {challenge.question}
              </p>

              {showHint && (
                <div className="mb-4 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                  💡 רמז: {challenge.hint}
                </div>
              )}

              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}
                >
                  <p className="font-bold mb-1">💡 אחרי 3 נסיונות — הנה הפתרון:</p>
                  <p>התשובה הנכונה: <span className="font-black text-white">{challenge.answer}</span></p>
                  <p className="mt-1 text-blue-300">הסבר: {challenge.hint}</p>
                </motion.div>
              )}

              <input
                className="answer-input"
                placeholder="הכנס את תשובתך..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                dir="rtl"
                disabled={result === 'correct'}
              />
            </div>

            <div className="flex gap-3">
              {!showHint && (
                <button onClick={() => setShowHint(true)}
                  className="btn-purple flex-shrink-0 py-3 px-4 rounded-xl font-semibold text-sm">
                  💡 רמז
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!answer || result === 'correct'}
                className="btn-gold flex-1 py-3 rounded-xl font-black text-lg"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                {result === 'correct' ? '🎉 נכון!' : '⚔️ שלח'}
              </button>
            </div>

            <AnimatePresence>
              {result === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mt-4 p-4 rounded-2xl"
                  style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)' }}
                >
                  <p className="text-green-400 font-black text-xl">🌟 מדהים!</p>
                  <p className="text-white">+{challenge.reward} מטבעות</p>
                  <button onClick={onBack} className="btn-gold mt-3 px-6 py-2 rounded-xl font-bold">
                    חזרה
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
