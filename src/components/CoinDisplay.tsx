import { useState, useEffect, useRef } from 'react';

interface Props {
  coins: number;
  level: number;
  streak: number;
  avatar: string;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export function CoinDisplay({ coins, level, streak, avatar, userEmail, onSignOut }: Props) {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [bounce, setBounce] = useState(false);
  const prevCoins = useRef(coins);

  useEffect(() => {
    if (coins !== prevCoins.current) {
      setBounce(true);
      const start = prevCoins.current;
      const end = coins;
      const diff = end - start;
      const steps = 20;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setDisplayCoins(Math.round(start + (diff * step) / steps));
        if (step >= steps) {
          clearInterval(interval);
          setDisplayCoins(end);
        }
      }, 30);
      prevCoins.current = coins;
      setTimeout(() => setBounce(false), 600);
      return () => clearInterval(interval);
    }
  }, [coins]);

  return (
    <div className="fixed top-0 z-50 flex items-center justify-between px-4 py-2"
      style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'rgba(13,10,30,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,215,0,0.2)' }}>
      
      {/* Avatar + Level + optional sign-out */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSignOut}
          disabled={!onSignOut}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl level-badge shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', border: '2px solid #FFD700', cursor: onSignOut ? 'pointer' : 'default' }}
          title={userEmail ? `מחובר: ${userEmail} — לחץ לצאת` : 'אורח'}
        >
          {avatar}
        </button>
        <div>
          <div className="text-xs text-gray-400">רמה</div>
          <div className="font-bold text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>{level}</div>
        </div>
      </div>

      {/* Streak */}
      {streak > 1 && (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,100,0,0.2)', border: '1px solid rgba(255,100,0,0.4)' }}>
          <span className="text-orange-400 text-sm">🔥</span>
          <span className="text-orange-400 font-bold text-sm">{streak}</span>
        </div>
      )}

      {/* Coins */}
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bounce ? 'animate-coin-bounce' : ''}`}
        style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)' }}>
        <span className="text-xl">🪙</span>
        <span className="font-bold text-yellow-400" style={{ fontFamily: 'Exo 2, sans-serif', fontSize: '1.1rem' }}>
          {displayCoins.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
