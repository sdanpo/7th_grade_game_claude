import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState } from '../types';
import { supabase, getSessionId, isSupabaseEnabled } from '../lib/supabase';

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
    const today = new Date().toDateString();
    if (parsed.lastDailyDate !== today) {
      parsed.dailyChallengeCompleted = false;
    }
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveLocal(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Map camelCase GameState ↔ snake_case DB columns
function toDbRow(state: GameState, sessionId: string) {
  return {
    session_id:                sessionId,
    player_name:               state.playerName,
    coins:                     state.coins,
    total_coins:               state.totalCoins,
    xp:                        state.xp,
    level:                     state.level,
    streak:                    state.streak,
    last_play_date:            state.lastPlayDate,
    solved_puzzles:            state.solvedPuzzles,
    unlocked_rooms:            state.unlockedRooms,
    purchased_rewards:         state.purchasedRewards,
    achievements:              state.achievements,
    avatar:                    state.avatar,
    total_solved:              state.totalSolved,
    perfect_solves:            state.perfectSolves,
    daily_challenge_completed: state.dailyChallengeCompleted,
    last_daily_date:           state.lastDailyDate,
    updated_at:                new Date().toISOString(),
  };
}

function fromDbRow(row: Record<string, unknown>): GameState {
  const today = new Date().toDateString();
  const dailyDone = row.last_daily_date === today
    ? Boolean(row.daily_challenge_completed)
    : false;
  return {
    playerName:               String(row.player_name ?? ''),
    coins:                    Number(row.coins ?? 50),
    totalCoins:               Number(row.total_coins ?? 50),
    xp:                       Number(row.xp ?? 0),
    level:                    Number(row.level ?? 1),
    streak:                   Number(row.streak ?? 0),
    lastPlayDate:             String(row.last_play_date ?? ''),
    solvedPuzzles:            (row.solved_puzzles as string[]) ?? [],
    unlockedRooms:            (row.unlocked_rooms as string[]) ?? ['ancient-library', 'pharaoh-tomb'],
    purchasedRewards:         (row.purchased_rewards as string[]) ?? [],
    achievements:             (row.achievements as string[]) ?? [],
    avatar:                   String(row.avatar ?? '🧠'),
    totalSolved:              Number(row.total_solved ?? 0),
    perfectSolves:            Number(row.perfect_solves ?? 0),
    dailyChallengeCompleted:  dailyDone,
    lastDailyDate:            String(row.last_daily_date ?? ''),
  };
}

function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const [syncing, setSyncing] = useState(false);
  const sessionId = useRef(getSessionId());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: pull latest from Supabase if available
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    setSyncing(true);
    supabase!
      .from('game_states')
      .select('*')
      .eq('session_id', sessionId.current)
      .maybeSingle()
      .then(({ data, error }) => {
        setSyncing(false);
        if (error || !data) return;
        const remote = fromDbRow(data as Record<string, unknown>);
        // Take whichever has more progress (higher totalCoins)
        const local = loadState();
        const winner = remote.totalCoins >= local.totalCoins ? remote : local;
        setState(winner);
        saveLocal(winner);
      });
  }, []);

  // Debounced Supabase upsert — fires 2s after last state change
  const scheduleSave = useCallback((nextState: GameState) => {
    if (!isSupabaseEnabled) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase!
        .from('game_states')
        .upsert(toDbRow(nextState, sessionId.current), { onConflict: 'session_id' });
    }, 2000);
  }, []);

  const update = useCallback((updater: (s: GameState) => GameState) => {
    setState(prev => {
      const next = updater(prev);
      saveLocal(next);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

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
    if (isSupabaseEnabled) {
      supabase!.from('game_states').delete().eq('session_id', sessionId.current);
    }
  }, []);

  const hasDoubleCoins = state.purchasedRewards.includes('booster-double');

  return {
    state,
    syncing,
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
