
export enum TileType {
  START = 'START',
  CITY = 'CITY',
  QUIZ = 'QUIZ',
  PARK = 'PARK', // Resting spot
  DONATION = 'DONATION', // Tax/Donation
  EVENT = 'EVENT', // Random Chance Cards
  AIRPORT = 'AIRPORT' // Fly to any tile
}

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  price: number; // Cost to buy
  rent: number; // Base rent
  ownerId: number | null;
  buildingLevel: number; // 0 = land, 1 = small building, 2 = skyscraper
  description: string;
  icon?: string; // Optional custom icon for the tile
}

export interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  color: string;
  isSkipped: boolean; // Lost a turn
  assets: number[]; // Array of Tile IDs owned
}

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  tiles: Tile[];
  status: 'SETUP' | 'PLAYING' | 'GAME_OVER';
  turnPhase: 'ROLL' | 'ROLLING' | 'MOVING' | 'ACTION' | 'END' | 'CITY_DECISION';
  diceValues: [number, number]; // Changed to support 2 dice
  isDouble: boolean; // Track if the roll was a double
  quizActive: boolean;
  currentQuiz: QuizQuestion | null;
  message: string;
  round: number;
  maxRounds?: number;
  isSpaceTravelActive: boolean;
  // Track what the player is trying to buy when taking a quiz
  pendingCityPurchase: {
    level: number; // 0, 1, 2
    cost: number;
  } | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'MONEY' | 'MOVE' | 'SKIP' | 'TRAVEL';
  value: number; // Amount of money or steps
}

export const PLAYER_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
];

export const INITIAL_MONEY = 2000;
