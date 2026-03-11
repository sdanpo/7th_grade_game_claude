import { useState, useCallback } from 'react';
import type { GameState } from '../types';

const DEFAULT_STATE: GameState = {
  playerName: '',
  coins: 50,
  totalCoins: 50,
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayDate: '',
  solvedPuzzles: [],
  unlockedRooms: ['ancient-library', 'pharaoh-tomb'],
  purchasedRewards: [],
  achievements: [],
  avatar: '🧠',
  totalSolved: 0,
  perfectSolves: 0,
  dailyChallengeCompleted: false,
  lastDailyDate: '',
};

const STORAGE_KEY = 'mathquest_gamestate_v2';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Check daily reset
    const today = new Date().toDateString();
    if (parsed.lastDailyDate !== today) {
      parsed.dailyChallengeCompleted = false;
    }
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  const update = useCallback((updater: (s: GameState) => GameState) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setPlayerName = useCallback((name: string) => {
    update(s => ({ ...s, playerName: name }));
  }, [update]);

  const addCoins = useCallback((amount: number, isDouble = false) => {
    const actual = isDouble ? amount * 2 : amount;
    update(s => ({ ...s, coins: s.coins + actual, totalCoins: s.totalCoins + actual }));
    return actual;
  }, [update]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    update(s => {
      if (s.coins >= amount) {
        success = true;
        return { ...s, coins: s.coins - amount };
      }
      return s;
    });
    return success;
  }, [update]);

  const addXP = useCallback((amount: number) => {
    update(s => {
      const newXP = s.xp + amount;
      const newLevel = calcLevel(newXP);
      return { ...s, xp: newXP, level: newLevel };
    });
  }, [update]);

  const markPuzzleSolved = useCallback((puzzleId: string, perfect: boolean) => {
    const today = new Date().toDateString();
    update(s => {
      const streak = s.lastPlayDate === new Date(Date.now() - 86400000).toDateString()
        ? s.streak + 1
        : s.lastPlayDate === today ? s.streak : 1;
      return {
        ...s,
        solvedPuzzles: [...new Set([...s.solvedPuzzles, puzzleId])],
        totalSolved: s.totalSolved + 1,
        perfectSolves: perfect ? s.perfectSolves + 1 : s.perfectSolves,
        lastPlayDate: today,
        streak,
      };
    });
  }, [update]);

  const unlockRoom = useCallback((roomId: string, cost: number) => {
    const ok = spendCoins(cost);
    if (ok) {
      update(s => ({ ...s, unlockedRooms: [...new Set([...s.unlockedRooms, roomId])] }));
    }
    return ok;
  }, [spendCoins, update]);

  const purchaseReward = useCallback((rewardId: string, cost: number) => {
    const ok = spendCoins(cost);
    if (ok) {
      update(s => ({ ...s, purchasedRewards: [...new Set([...s.purchasedRewards, rewardId])] }));
    }
    return ok;
  }, [spendCoins, update]);

  const setAvatar = useCallback((avatar: string) => {
    update(s => ({ ...s, avatar }));
  }, [update]);

  const completeDaily = useCallback(() => {
    const today = new Date().toDateString();
    update(s => ({ ...s, dailyChallengeCompleted: true, lastDailyDate: today }));
  }, [update]);

  const unlockAchievement = useCallback((id: string) => {
    update(s => ({
      ...s,
      achievements: s.achievements.includes(id) ? s.achievements : [...s.achievements, id],
    }));
  }, [update]);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  const hasDoubleCoins = state.purchasedRewards.includes('booster-double');

  return {
    state,
    setPlayerName,
    addCoins,
    spendCoins,
    addXP,
    markPuzzleSolved,
    unlockRoom,
    purchaseReward,
    setAvatar,
    completeDaily,
    unlockAchievement,
    resetGame,
    hasDoubleCoins,
    calcLevel,
  };
}
