import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rooms } from '../data/puzzles';
import type { GameState, Puzzle } from '../types';
import { ConfettiEffect } from './ConfettiEffect';
import { VoiceChallenge } from './VoiceChallenge';
import { CameraChallenge } from './CameraChallenge';
import { ArrowLeft, HelpCircle, Clock, Zap } from 'lucide-react';

interface Props {
  roomId: string;
  state: GameState;
  onBack: () => void;
  onSolve: (puzzleId: string, reward: number, xp: number, perfect: boolean) => void;
}

const DIFFICULTY_COLORS = {
  easy: '#39ff14',
  medium: '#FFD700',
  hard: '#FF6B35',
  legendary: '#FF00FF',
};

const DIFFICULTY_LABELS = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
  legendary: '⚡ אגדי',
};

function normalizeAnswer(val: string): string {
  return val.trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['"״׳]/g, '');
}

function checkAnswer(userAnswer: string, puzzle: Puzzle): boolean {
  const ua = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(String(puzzle.answer));
  if (ua === correct) return true;
  if (puzzle.alternateAnswers) {
    return puzzle.alternateAnswers.some(a => normalizeAnswer(String(a)) === ua);
  }
  // Allow numeric comparison
  if (!isNaN(Number(ua)) && !isNaN(Number(puzzle.answer))) {
    return Math.abs(Number(ua) - Number(puzzle.answer)) < 0.01;
  }
  return false;
}

export function PuzzleRoom({ roomId, state, onBack, onSolve }: Props) {
  const room = rooms.find(r => r.id === roomId)!;
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintPenalty, setHintPenalty] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voiceAnswer, setVoiceAnswer] = useState('');
  const [cameraCaptured, setCameraCaptured] = useState(false);
  const [bonusActive, setBonusActive] = useState(false);
  const [solvedInRoom, setSolvedInRoom] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const currentPuzzle: Puzzle = room.puzzles[puzzleIndex];
  const isAlreadySolved = state.solvedPuzzles.includes(currentPuzzle.id);

  const startTimer = useCallback((seconds: number) => {
    setTimeLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setShowSolution(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
    setHintPenalty(false);
    setSelectedOption(null);
    setVoiceAnswer('');
    setCameraCaptured(false);
    setWrongAttempts(0);
    setShowSolution(false);
    setAnimClass('animate-slide-up');
    startTimeRef.current = Date.now();
    if (currentPuzzle.timeLimit) startTimer(currentPuzzle.timeLimit);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [puzzleIndex, currentPuzzle.id, currentPuzzle.timeLimit, startTimer]);

  // Bonus: Rapid solver - solve within 20% of time limit for bonus
  useEffect(() => {
    if (timeLeft > 0 && currentPuzzle.timeLimit) {
      const elapsed = (currentPuzzle.timeLimit - timeLeft) / currentPuzzle.timeLimit;
      setBonusActive(elapsed < 0.3);
    }
  }, [timeLeft, currentPuzzle.timeLimit]);

  const handleSubmit = () => {
    const answer = currentPuzzle.options ? selectedOption ?? '' : (voiceAnswer || userAnswer);
    if (!answer) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const correct = checkAnswer(answer, currentPuzzle);

    if (correct) {
      setFeedback('correct');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);

      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      const timeBonus = currentPuzzle.timeLimit
        ? Math.max(0, Math.floor(currentPuzzle.reward * 0.5 * (timeLeft / currentPuzzle.timeLimit)))
        : 0;
      const hintPenaltyAmount = hintPenalty ? Math.floor(currentPuzzle.reward * 0.3) : 0;
      const speedBonus = bonusActive ? Math.floor(currentPuzzle.reward * 0.2) : 0;
      const totalReward = currentPuzzle.reward + timeBonus + speedBonus - hintPenaltyAmount;
      const isPerfect = !hintPenalty && timeTaken < (currentPuzzle.timeLimit ?? 999) * 0.7;

      setSolvedInRoom(prev => [...prev, currentPuzzle.id]);
      onSolve(currentPuzzle.id, Math.max(totalReward, 5), totalReward, isPerfect);

      // Auto advance after 2s
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        if (puzzleIndex < room.puzzles.length - 1) {
          setPuzzleIndex(i => i + 1);
        }
      }, 2000);
    } else {
      setFeedback('wrong');
      setAnimClass('animate-shake');
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      if (newAttempts >= 3) setShowSolution(true);
      setTimeout(() => { setFeedback(null); setAnimClass(''); }, 800);
    }
  };

  const handleHint = () => {
    setShowHint(true);
    setHintPenalty(true);
  };

  const allSolved = room.puzzles.every(p => state.solvedPuzzles.includes(p.id) || solvedInRoom.includes(p.id));

  if (allSolved && solvedInRoom.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: 'linear-gradient(180deg, #0d0a1e, #1a0a2e)' }}>
        <ConfettiEffect active={true} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="glass-card gold-border-glow p-8 max-w-sm"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-gold-glow text-2xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            חדר הושלם!
          </h2>
          <p className="text-gray-300 mb-2">{room.nameHe}</p>
          <p className="text-yellow-400 font-bold">פתרת את כל החידות! 🎉</p>
          <button onClick={onBack} className="btn-gold w-full py-3 rounded-xl font-bold mt-6">
            חזרה למפה
          </button>
        </motion.div>
      </div>
    );
  }

  const timerColor = timeLeft > 30 ? '#39ff14' : timeLeft > 10 ? '#FFD700' : '#FF4444';
  const timerPercent = currentPuzzle.timeLimit ? (timeLeft / currentPuzzle.timeLimit) * 100 : 100;

  return (
    <div className="min-h-screen pb-8 pt-16"
      style={{ background: `linear-gradient(180deg, #0d0a1e 0%, #0a0518 100%)` }}>
      <ConfettiEffect active={showConfetti} />

      {/* Room header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-purple text-sm font-bold shrink-0">
          <ArrowLeft size={15} />
          <span>חזרה</span>
        </button>
        <div className="flex-1">
          <h2 className="font-black text-lg" style={{ fontFamily: 'Cinzel, serif', color: '#FFD700' }}>
            {room.icon} {room.nameHe}
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{puzzleIndex + 1}/{room.puzzles.length} חידות</span>
            {bonusActive && timeLeft > 0 && (
              <span className="text-neon-cyan flex items-center gap-1">
                <Zap size={12} /> בונוס מהירות!
              </span>
            )}
          </div>
        </div>
        {/* Puzzle progress dots */}
        <div className="flex gap-1">
          {room.puzzles.map((p, i) => (
            <div key={i}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                i === puzzleIndex ? 'scale-125' : ''
              }`}
              style={{
                background: state.solvedPuzzles.includes(p.id) || solvedInRoom.includes(p.id) ? '#FFD700' :
                  i === puzzleIndex ? '#7c3aed' : '#374151'
              }}
              onClick={() => { if (!feedback) setPuzzleIndex(i); }}
            />
          ))}
        </div>
      </div>

      {/* Timer */}
      {currentPuzzle.timeLimit && timeLeft > 0 && (
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1" style={{ color: timerColor }}>
              <Clock size={14} />
              <span className="font-bold text-sm">{timeLeft}ש</span>
            </div>
            <span className="text-xs text-gray-400">זמן נותר</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${timerPercent}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)` }} />
          </div>
        </div>
      )}

      {/* Puzzle card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPuzzle.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className={`mx-4 ${animClass}`}
        >
          <div className={`glass-card p-5 rounded-2xl ${
            feedback === 'correct' ? 'correct-flash' :
            feedback === 'wrong' ? 'wrong-flash' : ''
          }`}
            style={{ border: `1px solid ${DIFFICULTY_COLORS[currentPuzzle.difficulty]}44` }}>

            {/* Difficulty + type badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: `${DIFFICULTY_COLORS[currentPuzzle.difficulty]}22`, color: DIFFICULTY_COLORS[currentPuzzle.difficulty] }}>
                {DIFFICULTY_LABELS[currentPuzzle.difficulty]}
              </span>
              <span className="text-xs text-gray-500 capitalize">{currentPuzzle.type}</span>
              {isAlreadySolved && <span className="text-green-400 text-xs">✓ כבר פתרת</span>}
            </div>

            {/* Story text */}
            {currentPuzzle.storyText && (
              <p className="text-purple-300 text-xs italic mb-3 leading-relaxed">{currentPuzzle.storyText}</p>
            )}

            {/* Question */}
            <p className="text-white font-semibold text-lg leading-relaxed mb-4" dir="rtl">
              {currentPuzzle.question}
            </p>

            {/* Hint */}
            {showHint && currentPuzzle.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
              >
                💡 רמז: {currentPuzzle.hint}
                {hintPenalty && <span className="text-red-400 text-xs ml-2">(-30% מטבעות)</span>}
              </motion.div>
            )}

            {/* Solution reveal (after 3 wrong or timeout) */}
            {showSolution && !isAlreadySolved && feedback !== 'correct' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}
              >
                <p className="font-bold mb-1">
                  {timeLeft === 0 && currentPuzzle.timeLimit ? '⏰ הזמן נגמר!' : '💡 אחרי 3 נסיונות —'}
                </p>
                <p>
                  התשובה הנכונה: <span className="font-black text-white">{currentPuzzle.answer}</span>
                </p>
                {currentPuzzle.hint && <p className="mt-1 text-blue-300">הסבר: {currentPuzzle.hint}</p>}
              </motion.div>
            )}

            {/* Answer area */}
            {currentPuzzle.options ? (
              /* Multiple choice */
              <div className="grid grid-cols-2 gap-2 mb-4">
                {currentPuzzle.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className="py-3 px-4 rounded-xl font-semibold text-sm transition-all text-right"
                    dir="rtl"
                    style={{
                      background: selectedOption === opt ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${selectedOption === opt ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                      color: selectedOption === opt ? '#c4b5fd' : '#9ca3af',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : currentPuzzle.type === 'voice' ? (
              <VoiceChallenge
                instruction={currentPuzzle.voiceInstruction || 'אמור את התשובה בקול רם'}
                onResult={text => { setVoiceAnswer(text); setUserAnswer(text); }}
                active={true}
              />
            ) : currentPuzzle.type === 'camera' ? (
              <CameraChallenge
                instruction={currentPuzzle.cameraInstruction || 'השתמש במצלמה כדי לפתור'}
                onCapture={() => setCameraCaptured(true)}
                active={true}
              />
            ) : (
              /* Text/number input */
              <div className="mb-4">
                <input
                  className="answer-input"
                  placeholder={currentPuzzle.type === 'math' ? 'הכנס מספר...' : 'הכנס תשובה...'}
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  dir="rtl"
                  type={currentPuzzle.type === 'math' || currentPuzzle.type === 'sequence' ? 'text' : 'text'}
                />
              </div>
            )}

            {/* Reward preview */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <span>🪙</span>
                <span className="font-bold">{currentPuzzle.reward}</span>
                <span className="text-gray-500">+ בונוסים</span>
              </div>
              {!showHint && currentPuzzle.hint && (
                <button onClick={handleHint}
                  className="flex items-center gap-1 text-gray-500 hover:text-yellow-400 transition-colors text-xs">
                  <HelpCircle size={14} />
                  <span>רמז (-30%)</span>
                </button>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={feedback === 'correct' || (!userAnswer && !selectedOption && !voiceAnswer && !cameraCaptured)}
              className="btn-gold w-full py-3 rounded-xl font-black text-lg"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {feedback === 'correct' ? '🎉 נכון!' : feedback === 'wrong' ? '❌ נסה שוב' : '⚔️ שלח תשובה'}
            </button>

            {/* Feedback messages */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-center mt-3"
                >
                  <p className="text-green-400 font-bold">🌟 מצוין! +{currentPuzzle.reward} מטבעות!</p>
                  {bonusActive && <p className="text-cyan-400 text-sm">⚡ בונוס מהירות!</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation between puzzles */}
      <div className="flex justify-between px-4 mt-4">
        <button
          onClick={() => puzzleIndex > 0 && setPuzzleIndex(i => i - 1)}
          disabled={puzzleIndex === 0}
          className="btn-purple px-4 py-2 rounded-xl text-sm disabled:opacity-30"
        >
          ← קודם
        </button>
        <button
          onClick={() => puzzleIndex < room.puzzles.length - 1 && setPuzzleIndex(i => i + 1)}
            disabled={puzzleIndex === room.puzzles.length - 1}
          className="btn-purple px-4 py-2 rounded-xl text-sm disabled:opacity-30"
        >
          הבא →
        </button>
      </div>
    </div>
  );
}
