export type Screen = 'auth' | 'home' | 'map' | 'room' | 'shop' | 'profile' | 'daily' | 'leaderboard';
export type PuzzleType = 'math' | 'logic' | 'sequence' | 'voice' | 'camera' | 'cipher' | 'visual';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface Puzzle {
  id: string;
  type: PuzzleType;
  difficulty: Difficulty;
  question: string;
  hint?: string;
  answer: string | number;
  alternateAnswers?: (string | number)[];
  options?: string[];           // for multiple choice
  reward: number;               // base coins
  timeLimit?: number;           // seconds
  storyText?: string;           // narrative flavor
  imageUrl?: string;
  sequence?: (string | number)[];
  cameraInstruction?: string;   // for camera challenges
  voiceInstruction?: string;    // for voice challenges
}

export interface Room {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  theme: string;
  icon: string;
  bgGradient: string;
  puzzles: Puzzle[];
  unlockCost: number;
  minLevel: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'avatar' | 'theme' | 'booster' | 'badge' | 'special';
  unlocked?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
  reward: number;
}

export interface GameState {
  playerName: string;
  coins: number;
  totalCoins: number;
  xp: number;
  level: number;
  streak: number;
  lastPlayDate: string;
  solvedPuzzles: string[];
  unlockedRooms: string[];
  purchasedRewards: string[];
  achievements: string[];
  avatar: string;
  totalSolved: number;
  perfectSolves: number;  // solved without hints in time
  dailyChallengeCompleted: boolean;
  lastDailyDate: string;
}
