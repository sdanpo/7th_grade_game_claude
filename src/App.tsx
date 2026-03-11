import { useState, useCallback, useEffect, useRef } from 'react';
import type { Screen } from './types';
import { useGameState } from './hooks/useGameState';
import { StarField } from './components/StarField';
import { CoinDisplay } from './components/CoinDisplay';
import { HomePage } from './components/HomePage';
import { GameMap } from './components/GameMap';
import { PuzzleRoom } from './components/PuzzleRoom';
import { Shop } from './components/Shop';
import { ProfileScreen } from './components/ProfileScreen';
import { DailyChallenge } from './components/DailyChallenge';
import { Leaderboard } from './components/Leaderboard';
import { AnimatePresence, motion } from 'framer-motion';

// Floating coin reward notification
function CoinToast({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ y: -60, opacity: 0, scale: 0.5 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-2"
      style={{ background: 'linear-gradient(135deg, #1a1040, #0d0a1e)', border: '2px solid #FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)', fontFamily: 'Cinzel, serif' }}
    >
      <span className="text-2xl animate-coin-bounce">🪙</span>
      <span style={{ color: '#FFD700' }}>+{amount}</span>
    </motion.div>
  );
}

// Level up notification
function LevelUpToast({ level, onDone }: { level: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-[300] pointer-events-none"
    >
      <div className="glass-card gold-border-glow p-8 text-center animate-pop-in"
        style={{ background: 'rgba(13,10,30,0.95)' }}>
        <div className="text-5xl mb-2">🌟</div>
        <p className="text-gold-glow text-3xl font-black" style={{ fontFamily: 'Cinzel, serif' }}>עלית רמה!</p>
        <p className="text-white text-xl mt-1">רמה {level}</p>
      </div>
    </motion.div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [coinToast, setCoinToast] = useState<number | null>(null);
  const [levelUpToast, setLevelUpToast] = useState<number | null>(null);
  const prevLevel = useRef(1);

  const {
    state,
    setPlayerName,
    addCoins,
    addXP,
    markPuzzleSolved,
    unlockRoom,
    purchaseReward,
    setAvatar,
    completeDaily,
    resetGame,
    hasDoubleCoins,
  } = useGameState();

  // Detect level up
  useEffect(() => {
    if (state.level > prevLevel.current) {
      setLevelUpToast(state.level);
      prevLevel.current = state.level;
    }
  }, [state.level]);

  const handleStart = useCallback((name: string) => {
    setPlayerName(name);
    setScreen('map');
  }, [setPlayerName]);

  const handleSolvePuzzle = useCallback((puzzleId: string, reward: number, xp: number, perfect: boolean) => {
    const earned = addCoins(reward, hasDoubleCoins);
    setCoinToast(earned);
    addXP(xp);
    markPuzzleSolved(puzzleId, perfect);
  }, [addCoins, addXP, markPuzzleSolved, hasDoubleCoins]);

  const handlePurchase = useCallback((rewardId: string, cost: number) => {
    return purchaseReward(rewardId, cost);
  }, [purchaseReward]);

  const handleDailyComplete = useCallback((reward: number) => {
    const earned = addCoins(reward, hasDoubleCoins);
    setCoinToast(earned);
    addXP(reward);
    completeDaily();
  }, [addCoins, addXP, completeDaily, hasDoubleCoins]);

  const handleUnlockRoom = useCallback((roomId: string, cost: number) => {
    unlockRoom(roomId, cost);
  }, [unlockRoom]);

  const showNav = screen !== 'home';

  return (
    <div className="relative" style={{ background: '#0d0a1e', minHeight: '100vh' }}>
      <StarField />

      {/* Centered content column */}
      <div className="relative mx-auto" style={{ maxWidth: '480px', minHeight: '100vh' }}>

      {/* Global coin display */}
      {showNav && (
        <CoinDisplay
          coins={state.coins}
          level={state.level}
          streak={state.streak}
          avatar={state.avatar}
        />
      )}

      {/* Toast notifications */}
      <AnimatePresence>
        {coinToast !== null && (
          <CoinToast key="coin" amount={coinToast} onDone={() => setCoinToast(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {levelUpToast !== null && (
          <LevelUpToast key="level" level={levelUpToast} onDone={() => setLevelUpToast(null)} />
        )}
      </AnimatePresence>

      {/* Screen routing */}
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomePage onStart={handleStart} playerName={state.playerName} />
          </motion.div>
        )}

        {screen === 'map' && (
          <motion.div key="map" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <GameMap
              state={state}
              onSelectRoom={(roomId) => { setSelectedRoom(roomId); setScreen('room'); }}
              onShop={() => setScreen('shop')}
              onDaily={() => setScreen('daily')}
              onProfile={() => setScreen('profile')}
              onLeaderboard={() => setScreen('leaderboard')}
              onUnlockRoom={handleUnlockRoom}
            />
          </motion.div>
        )}

        {screen === 'room' && selectedRoom && (
          <motion.div key="room" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <PuzzleRoom
              roomId={selectedRoom}
              state={state}
              onBack={() => setScreen('map')}
              onSolve={handleSolvePuzzle}
            />
          </motion.div>
        )}

        {screen === 'shop' && (
          <motion.div key="shop" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Shop
              state={state}
              onBack={() => setScreen('map')}
              onPurchase={handlePurchase}
              onSetAvatar={setAvatar}
            />
          </motion.div>
        )}

        {screen === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ProfileScreen
              state={state}
              onBack={() => setScreen('map')}
              onReset={() => { resetGame(); setScreen('home'); }}
            />
          </motion.div>
        )}

        {screen === 'daily' && (
          <motion.div key="daily" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <DailyChallenge
              state={state}
              onBack={() => setScreen('map')}
              onComplete={handleDailyComplete}
            />
          </motion.div>
        )}

        {screen === 'leaderboard' && (
          <motion.div key="leaderboard" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Leaderboard onBack={() => setScreen('map')} myName={state.playerName} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>{/* end centered column */}
    </div>
  );
}

export default App;
