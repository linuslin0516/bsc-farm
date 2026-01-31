// Player types
export interface Player {
  oderId: string; // 6-digit unique ID
  walletAddress?: string; // Optional wallet address
  twitterUid?: string; // Twitter UID from Firebase Auth
  twitterHandle?: string; // Twitter username/handle
  avatarUrl?: string; // Profile picture URL (from Twitter)
  name: string;
  level: number;
  experience: number;
  landSize: 3 | 4 | 5 | 6;
  createdAt: number;
  lastOnline?: number;
  farmBalance: number;
}

// Firebase user data (stored in Firestore)
export interface FirebaseUser {
  oderId: string;
  walletAddress?: string;
  twitterUid?: string;
  twitterHandle?: string;
  avatarUrl?: string;
  name: string;
  level: number;
  experience: number;
  landSize: 3 | 4 | 5 | 6;
  farmCells: FarmCell[];
  farmBalance: number;
  createdAt: number;
  lastOnline: number;
}

// Friend system types
export interface FriendData {
  oderId: string;
  friendList: string[]; // Array of userIds
  pendingRequests: string[]; // Requests received
  sentRequests: string[]; // Requests sent
}

export interface FriendInfo {
  oderId: string;
  name: string;
  level: number;
  lastOnline: number;
  isOnline: boolean;
}

// Steal record
export interface StealRecord {
  oderId: string; // thief
  targetId: string; // victim
  position: Position;
  cropId: string;
  amount: number;
  stolenAt: number;
}

// Visit mode
export interface VisitState {
  isVisiting: boolean;
  targetId: string | null;
  targetName: string | null;
  targetFarm: FarmCell[];
  canSteal: boolean;
}

// Crop rarity system
export type CropRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_COLORS: Record<CropRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-400', text: 'text-gray-300', glow: '' },
  uncommon: { bg: 'bg-green-500/20', border: 'border-green-400', text: 'text-green-400', glow: 'shadow-[0_0_10px_rgba(74,222,128,0.5)]' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.6)]' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.7)]' },
  legendary: { bg: 'bg-yellow-500/20', border: 'border-yellow-400', text: 'text-yellow-400', glow: 'shadow-[0_0_25px_rgba(250,204,21,0.8)]' },
};

export const RARITY_NAMES: Record<CropRarity, string> = {
  common: '普通',
  uncommon: '優良',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

// Crop definitions
export interface CropDefinition {
  id: string;
  name: string;
  nameCn: string;
  cost: number;
  growthTime: number; // in seconds
  sellPrice: number;
  experience: number;
  stages: CropStage[];
  unlockLevel: number;
  rarity: CropRarity;
  emoji: string;
  description: string;
}

export type CropStage = 'seed' | 'sprout' | 'growing' | 'mature';

// Planted crop instance
export interface PlantedCrop {
  id: string;
  cropId: string;
  plantedAt: number;
  position: Position;
  stage: CropStage;
  wateredAt?: number;
  fertilizedAt?: number;
}

export interface Position {
  x: number;
  y: number;
}

// Farm land cell
export interface FarmCell {
  position: Position;
  plantedCrop?: PlantedCrop;
  isUnlocked: boolean;
}

// Shop items
export interface ShopItem {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  price: number;
  type: 'seed' | 'tool' | 'land' | 'boost';
  icon: string;
  effect?: ItemEffect;
}

export interface ItemEffect {
  type: 'speed' | 'yield' | 'auto_water' | 'auto_harvest';
  value: number;
  duration?: number;
}

// Inventory
export interface InventoryItem {
  itemId: string;
  quantity: number;
}

// Transaction types
export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'land_upgrade';
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
}

// Game state
export interface GameState {
  player: Player | null;
  farmCells: FarmCell[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  selectedCrop: string | null;
  selectedTool: string | null;
}

// Wallet state
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
  farmBalance: string;
  isCorrectNetwork: boolean;
}

// UI state
export interface UIState {
  currentPage: 'login' | 'setup' | 'game' | 'shop';
  isLoading: boolean;
  showShop: boolean;
  showInventory: boolean;
  notification: Notification | null;
}

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// ============ Achievement System ============
export type AchievementCategory = 'farming' | 'social' | 'collection' | 'milestone';

export interface Achievement {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  category: AchievementCategory;
  icon: string;
  requirement: number;
  rewardXp: number;
  rewardTokens: number;
  rarity: CropRarity;
}

export interface PlayerAchievement {
  oderId: string;
  unlockedAchievements: string[]; // achievement IDs
  progress: Record<string, number>; // achievement ID -> current progress
  totalHarvests: number;
  totalPlants: number;
  totalSteals: number;
  totalEarnings: number;
  consecutiveLogins: number;
  lastLoginDate: string; // YYYY-MM-DD format
  cropsDiscovered: string[]; // crop IDs
}

// ============ Daily Task System ============
export type DailyTaskType = 'plant' | 'harvest' | 'steal' | 'earn' | 'visit';

export interface DailyTask {
  id: string;
  type: DailyTaskType;
  nameCn: string;
  descriptionCn: string;
  icon: string;
  requirement: number;
  rewardXp: number;
  rewardTokens: number;
}

export interface PlayerDailyTasks {
  oderId: string;
  date: string; // YYYY-MM-DD
  tasks: {
    taskId: string;
    progress: number;
    completed: boolean;
    claimed: boolean;
  }[];
}

// ============ Leaderboard System ============
export interface LeaderboardEntry {
  oderId: string;
  name: string;
  avatarUrl?: string;
  level: number;
  score: number;
  rank: number;
}

export interface LeaderboardData {
  type: 'score' | 'level' | 'harvests' | 'achievements';
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

// Player stats for leaderboard calculation
export interface PlayerStats {
  oderId: string;
  totalHarvests: number;
  totalPlants: number;
  totalSteals: number;
  totalEarnings: number;
  achievementCount: number;
  score: number; // Calculated: (level * 100) + (harvests * 10) + (steals * 5)
}

// ============ Dual Token System ============
export interface DualTokenBalance {
  gold: number;      // In-game soft currency (off-chain)
  farm: string;      // On-chain hard currency (as string for BigNumber)
}

// Web3 Wallet State
export interface Web3WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  bnbBalance: string;
  farmBalance: string;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Token Exchange
export interface ExchangeRate {
  goldPerFarm: number;       // How much GOLD you get for 1 FARM
  farmPerGold: number;       // How much FARM you get for 1 GOLD (very small)
  exchangeFee: number;       // Fee percentage (e.g., 0.05 = 5%)
  lastUpdated: number;
  dailyExchangeLimit: number; // Max FARM per day per user
}

export interface ExchangeTransaction {
  id: string;
  oderId: string;
  type: 'gold_to_farm' | 'farm_to_gold';
  goldAmount: number;
  farmAmount: string;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

export interface UserExchangeData {
  oderId: string;
  dailyExchanged: number;      // FARM exchanged today
  lastExchangeDate: string;    // YYYY-MM-DD
  totalGoldExchanged: number;
  totalFarmExchanged: string;
  pendingTransactions: ExchangeTransaction[];
}

// ============ Supply/Demand Market System ============
export interface CropSupplyDemand {
  cropId: string;
  plantedLast24h: number;
  harvestedLast24h: number;
  soldLast24h: number;
  currentMultiplier: number;  // 0.7 to 1.3
  trend: 'up' | 'down' | 'stable';
  lastCalculated: number;
}

export interface GlobalMarketStats {
  totalPlayers: number;
  activePlayers24h: number;
  totalGoldCirculating: number;
  totalFarmCirculating: string;
  cropStats: Record<string, CropSupplyDemand>;
  lastUpdated: number;
}
