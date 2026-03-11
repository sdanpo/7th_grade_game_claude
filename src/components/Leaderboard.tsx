import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface LeaderRow {
  player_name: string;
  total_coins: number;
  level: number;
  total_solved: number;
  streak: number;
  avatar: string;
}

interface Props {
  onBack: () => void;
  myName: string;
}

export function Leaderboard({ onBack, myName }: Props) {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    if (!isSupabaseEnabled) {
      setError('לוח התוצאות דורש חיבור לאינטרנט ו-Supabase מוגדר.');
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase!
      .from('leaderboard')
      .select('player_name,total_coins,level,total_solved,streak,avatar')
      .order('total_coins', { ascending: false })
      .limit(50);

    if (err) { setError('שגיאה בטעינת הנתונים'); }
    else { setRows((data ?? []) as LeaderRow[]); }
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const medalFor = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`;

  return (
    <div className="min-h-screen pb-8 pt-16"
      style={{ background: 'linear-gradient(180deg, #0d0a1e, #0a0518)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-purple text-sm font-bold shrink-0">
          <ArrowLeft size={15} />
          <span>חזרה</span>
        </button>
        <div className="flex-1">
          <h2 className="text-gold-glow font-black text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
            🏆 לוח התוצאות
          </h2>
          <p className="text-gray-400 text-xs">Top 50 שחקנים עולמיים</p>
        </div>
        <button onClick={fetchLeaderboard} className="w-9 h-9 rounded-xl flex items-center justify-center btn-purple">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">טוען...</p>
        </div>
      ) : error ? (
        <div className="mx-4 p-6 rounded-2xl text-center glass-card">
          <div className="text-4xl mb-3">🔌</div>
          <p className="text-gray-400 text-sm">{error}</p>
          {!isSupabaseEnabled && (
            <p className="text-yellow-400 text-xs mt-2">הגדר VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY</p>
          )}
        </div>
      ) : rows.length === 0 ? (
        <div className="mx-4 p-6 rounded-2xl text-center glass-card">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-400 text-sm">עדיין אין שחקנים. היה הראשון!</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {rows.map((row, i) => {
            const isMe = row.player_name === myName;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: isMe
                    ? 'rgba(255,215,0,0.15)'
                    : i < 3
                    ? 'rgba(124,58,237,0.15)'
                    : 'rgba(255,255,255,0.03)',
                  border: isMe
                    ? '2px solid rgba(255,215,0,0.6)'
                    : i < 3
                    ? '1px solid rgba(124,58,237,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Rank */}
                <span className="text-xl w-8 text-center shrink-0">{medalFor(i)}</span>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl shrink-0 level-badge">
                  {row.avatar}
                </div>

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                    {row.player_name} {isMe && '(אתה)'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    רמה {row.level} · {row.total_solved} חידות · {row.streak}🔥
                  </p>
                </div>

                {/* Coins */}
                <div className="shrink-0 text-right">
                  <p className="text-yellow-400 font-black">{row.total_coins.toLocaleString()}</p>
                  <p className="text-gray-600 text-xs">🪙</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
