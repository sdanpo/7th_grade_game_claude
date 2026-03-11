import { motion } from 'framer-motion';
import { rooms } from '../data/puzzles';
import type { GameState } from '../types';
import { Lock, Star } from 'lucide-react';

interface Props {
  state: GameState;
  onSelectRoom: (roomId: string) => void;
  onShop: () => void;
  onDaily: () => void;
  onProfile: () => void;
  onLeaderboard: () => void;
  onUnlockRoom: (roomId: string, cost: number) => void;
}

export function GameMap({ state, onSelectRoom, onShop, onDaily, onProfile, onLeaderboard, onUnlockRoom }: Props) {
  const getRoomProgress = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { solved: 0, total: 0 };
    const solved = room.puzzles.filter(p => state.solvedPuzzles.includes(p.id)).length;
    return { solved, total: room.puzzles.length };
  };

  const isUnlocked = (roomId: string) => state.unlockedRooms.includes(roomId);
  const canAfford = (cost: number) => state.coins >= cost;

  return (
    <div className="min-h-screen pb-24 pt-16"
      style={{ background: 'linear-gradient(180deg, #0d0a1e 0%, #0a0518 100%)' }}>
      
      {/* Header */}
      <div className="pt-4 px-4 mb-6">
        <h2 className="text-gold-glow text-2xl font-black text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          🗺️ מפת ההרפתקה
        </h2>
        <p className="text-center text-gray-400 text-sm mt-1">
          רמה {state.level} • {state.xp} XP
        </p>
        <div className="progress-bar mt-2 mx-auto max-w-xs">
          <div className="progress-fill" style={{ width: `${((state.xp % 50) / 50) * 100}%` }} />
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mx-4 mb-4 p-4 rounded-2xl cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #1a0a2e, #0a0518)', border: '2px solid rgba(255,215,0,0.5)' }}
        onClick={onDaily}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-gold-glow font-black" style={{ fontFamily: 'Cinzel, serif' }}>אתגר יומי</span>
              {state.dailyChallengeCompleted && <span className="text-green-400 text-sm">✓ הושלם</span>}
            </div>
            <p className="text-gray-400 text-sm mt-1">+100 מטבעות בונוס!</p>
          </div>
          <div className={`px-4 py-2 rounded-xl font-bold text-sm ${state.dailyChallengeCompleted ? 'opacity-50' : 'btn-gold'}`}
            style={{ borderRadius: '12px' }}>
            {state.dailyChallengeCompleted ? '✓ בוצע' : '🎯 שחק'}
          </div>
        </div>
      </motion.div>

      {/* Room Cards */}
      <div className="px-4 space-y-4">
        {rooms.map((room, idx) => {
          const unlocked = isUnlocked(room.id);
          const progress = getRoomProgress(room.id);
          const completed = progress.solved === progress.total;
          const affordable = canAfford(room.unlockCost);

          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer ${!unlocked ? 'opacity-80' : ''}`}
              style={{ border: unlocked ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => {
                if (unlocked) onSelectRoom(room.id);
                else if (room.unlockCost > 0 && affordable) {
                  if (window.confirm(`לפתוח את "${room.nameHe}" עבור ${room.unlockCost} מטבעות?`)) {
                    onUnlockRoom(room.id, room.unlockCost);
                  }
                }
              }}
              whileHover={{ scale: unlocked ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${room.bgGradient} opacity-40`} />

              <div className="relative p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{room.icon}</span>
                    <div>
                      <h3 className="font-black text-white text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                        {room.nameHe}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5 max-w-48 leading-relaxed">{room.description}</p>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    {!unlocked ? (
                      <div className="flex items-center gap-1">
                        <Lock size={16} className="text-gray-400" />
                        <span className="text-gray-400 text-sm font-bold">{room.unlockCost}🪙</span>
                      </div>
                    ) : completed ? (
                      <span className="text-green-400 text-xl">✓</span>
                    ) : (
                      <div className="flex gap-0.5">
                        {room.puzzles.map((p, i) => (
                          <div key={i}
                            className={`w-2 h-2 rounded-full ${state.solvedPuzzles.includes(p.id) ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                        ))}
                      </div>
                    )}
                    
                    {/* Min level */}
                    {room.minLevel > 1 && (
                      <span className="text-xs text-purple-400">רמה {room.minLevel}+</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {unlocked && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{progress.solved}/{progress.total} חידות</span>
                      <span>{Math.round((progress.solved / progress.total) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(progress.solved / progress.total) * 100}%` }} />
                    </div>
                  </div>
                )}

                {/* Lock overlay */}
                {!unlocked && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                      {affordable ? `🔓 לחץ לפתיחה (${room.unlockCost}🪙)` : `❌ דרוש ${room.unlockCost}🪙 (יש לך ${state.coins}🪙)`}
                    </span>
                  </div>
                )}
              </div>

              {/* Completion star */}
              {completed && unlocked && (
                <div className="absolute top-2 right-2">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 z-50"
        style={{ background: 'rgba(13,10,30,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,215,0,0.15)' }}>
        {[
          { icon: '🗺️', label: 'מפה', active: true, onClick: () => {} },
          { icon: '🏪', label: 'חנות', active: false, onClick: onShop },
          { icon: '🏆', label: 'דירוג', active: false, onClick: onLeaderboard },
          { icon: '👤', label: 'פרופיל', active: false, onClick: onProfile },
        ].map(item => (
          <button key={item.label} onClick={item.onClick}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
            style={{ color: item.active ? '#FFD700' : '#6b7280', background: item.active ? 'rgba(255,215,0,0.1)' : 'transparent' }}>
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
