import { motion } from 'framer-motion';
import { shopRewards } from '../data/rewards';
import type { GameState } from '../types';
import { ArrowLeft, Check } from 'lucide-react';

interface Props {
  state: GameState;
  onBack: () => void;
  onPurchase: (rewardId: string, cost: number) => void;
  onSetAvatar: (avatar: string) => void;
}

const typeLabels: Record<string, string> = {
  avatar: '🎭 אווטאר',
  booster: '⚡ חיזוק',
  badge: '🏅 תג',
  theme: '🌌 ערכת נושא',
  special: '💎 מיוחד',
};

const avatarOptions = ['🧠', '🧙‍♂️', '🤖', '🥷', '👨‍🚀', '👑', '🦁', '🐲', '🦊', '⚡'];

export function Shop({ state, onBack, onPurchase, onSetAvatar }: Props) {
  const groupedRewards = shopRewards.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, typeof shopRewards>);

  const handleBuy = (rewardId: string, cost: number) => {
    if (state.purchasedRewards.includes(rewardId)) return;
    if (state.coins < cost) {
      alert(`אין מספיק מטבעות! יש לך ${state.coins}🪙 ונדרשים ${cost}🪙`);
      return;
    }
    if (window.confirm(`לרכוש עבור ${cost} מטבעות?`)) {
      onPurchase(rewardId, cost);
      // Check if avatar
      const reward = shopRewards.find(r => r.id === rewardId);
      if (reward?.type === 'avatar') {
        onSetAvatar(reward.icon);
      }
    }
  };

  return (
    <div className="min-h-screen pb-8 pt-16"
      style={{ background: 'linear-gradient(180deg, #0d0a1e, #0a0518)' }}>
      
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center btn-purple">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-gold-glow font-black text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
            🏪 חנות הגיבורים
          </h2>
          <p className="text-gray-400 text-sm">יש לך: {state.coins.toLocaleString()} 🪙</p>
        </div>
      </div>

      {/* Avatar picker */}
      <div className="mx-4 mb-6 glass-card p-4 rounded-2xl">
        <h3 className="text-yellow-400 font-bold mb-3">🎭 בחר אווטאר</h3>
        <div className="flex flex-wrap gap-2">
          {avatarOptions.map(a => (
            <button
              key={a}
              onClick={() => onSetAvatar(a)}
              className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
              style={{
                background: state.avatar === a ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${state.avatar === a ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: state.avatar === a ? '0 0 15px rgba(255,215,0,0.4)' : 'none',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Reward categories */}
      <div className="px-4 space-y-6">
        {Object.entries(groupedRewards).map(([type, rewards]) => (
          <div key={type}>
            <h3 className="text-yellow-400 font-bold mb-3">{typeLabels[type] || type}</h3>
            <div className="grid grid-cols-1 gap-3">
              {rewards.map((reward, idx) => {
                const owned = state.purchasedRewards.includes(reward.id);
                const affordable = state.coins >= reward.cost;

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 rounded-2xl flex items-center gap-4"
                    style={{ border: owned ? '1px solid rgba(57,255,20,0.4)' : '1px solid rgba(255,215,0,0.15)' }}
                  >
                    <span className="text-4xl shrink-0">{reward.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white">{reward.name}</p>
                      <p className="text-gray-400 text-sm">{reward.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {owned ? (
                        <div className="flex items-center gap-1 text-green-400 text-sm font-bold">
                          <Check size={16} />
                          <span>בבעלותך</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuy(reward.id, reward.cost)}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${affordable ? 'btn-gold' : 'opacity-40 cursor-not-allowed'}`}
                          disabled={!affordable}
                          style={{ borderRadius: '12px' }}
                        >
                          {reward.cost} 🪙
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Low coins notice */}
      {state.coins < 100 && (
        <div className="mx-4 mt-6 p-4 rounded-2xl text-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-red-400 font-semibold text-sm">💡 פתור עוד חידות כדי לקבל מטבעות!</p>
        </div>
      )}
    </div>
  );
}
