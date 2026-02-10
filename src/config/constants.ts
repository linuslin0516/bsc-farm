// App Mode Configuration
export const COMING_SOON_MODE = import.meta.env.VITE_COMING_SOON === 'true';

// Game Configuration
export const GAME_CONFIG = {
  INITIAL_LAND_SIZE: 3,
  MAX_LAND_SIZE: 6,
  INITIAL_FARM_BALANCE: 500, // Starting GOLD for new players
  EXP_PER_LEVEL: 100,
  MAX_LEVEL: 50,
};

// Experience required for each level
export const getExpForLevel = (level: number): number => {
  return Math.floor(GAME_CONFIG.EXP_PER_LEVEL * Math.pow(1.5, level - 1));
};

// Storage keys
export const STORAGE_KEYS = {
  PLAYER_DATA: 'space_farm_player',
  FARM_STATE: 'space_farm_state',
  TRANSACTIONS: 'space_farm_transactions',
};

// Admin Configuration
export const ADMIN_TWITTER_UIDS = (import.meta.env.VITE_ADMIN_TWITTER_UIDS || '').split(',').filter(Boolean);
