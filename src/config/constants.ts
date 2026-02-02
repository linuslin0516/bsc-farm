// App Mode Configuration
// Set VITE_COMING_SOON=true to show coming soon page instead of game
export const COMING_SOON_MODE = import.meta.env.VITE_COMING_SOON === 'true';

// BSC Network Configuration
export const BSC_MAINNET = {
  chainId: 56,
  chainIdHex: '0x38',
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

export const BSC_TESTNET = {
  chainId: 97,
  chainIdHex: '0x61',
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// Use testnet for development, mainnet for production
// Control via VITE_USE_MAINNET environment variable
export const USE_MAINNET = import.meta.env.VITE_USE_MAINNET === 'true';
export const NETWORK = USE_MAINNET ? BSC_MAINNET : BSC_TESTNET;

// $FARM Token Configuration
export const FARM_TOKEN = {
  address: '', // TODO: Fill in your token contract address
  symbol: 'FARM',
  name: 'Farm Token',
  decimals: 18,
};

// ERC20 ABI (minimal for token interactions)
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// Game Configuration
export const GAME_CONFIG = {
  INITIAL_LAND_SIZE: 3,
  MAX_LAND_SIZE: 6,
  INITIAL_FARM_BALANCE: 0, // Starting GOLD for new players (must deposit FARM to play)
  EXP_PER_LEVEL: 100,
  MAX_LEVEL: 50,
};

// Exchange Configuration
// 目標：100,000 FARM = 100 GOLD
export const EXCHANGE_CONFIG = {
  GOLD_PER_FARM: 0.001,       // 1 FARM = 0.001 GOLD (100,000 FARM = 100 GOLD)
  EXCHANGE_FEE: 0.05,         // 5% fee
  DAILY_LIMIT_FARM: 999999999,// Essentially unlimited
  MIN_GOLD_EXCHANGE: 100,     // Minimum GOLD to exchange
  MIN_FARM_EXCHANGE: 100000,  // Minimum 100,000 FARM to exchange (= 100 GOLD before fee)
};

// Experience required for each level
export const getExpForLevel = (level: number): number => {
  return Math.floor(GAME_CONFIG.EXP_PER_LEVEL * Math.pow(1.5, level - 1));
};

// Storage keys
export const STORAGE_KEYS = {
  PLAYER_DATA: 'bsc_farm_player',
  FARM_STATE: 'bsc_farm_state',
  TRANSACTIONS: 'bsc_farm_transactions',
};
