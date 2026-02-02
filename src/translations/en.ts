// English translations
import { Translations } from './zh-CN';

export const en: Translations = {
  // Common
  common: {
    loading: 'Loading...',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied',
  },

  // Login Page
  login: {
    title: 'BSC Farm',
    subtitle: 'Start your farming journey, grow crops and earn',
    tokenName: '$FARM',
    tokens: 'tokens!',
    twitterLogin: 'Login with X (Twitter)',
    walletLogin: 'Connect MetaMask Wallet',
    or: 'or',
    saveHint: 'Your game progress will be automatically saved after connecting wallet',
    features: {
      plant: 'Plant Crops',
      earn: 'Earn $FARM',
      grow: 'Level Up',
    },
    errors: {
      walletFailed: 'Failed to connect wallet. Please try again.',
      switchNetwork: 'Please switch to BSC network in your wallet.',
    },
  },

  // Setup Page
  setup: {
    welcome: 'Welcome, Farmer!',
    subtitle: 'Set up your profile and start your farming journey',
    twitterConnected: 'Connected to X (Twitter)',
    needsWallet: 'Wallet Binding Required',
    needsWalletDesc: 'Please connect MetaMask wallet to save your progress. You can play on different devices after binding.',
    connectWallet: 'Connect MetaMask Wallet',
    walletConnected: 'Wallet Connected',
    yourId: 'Your Unique ID',
    shareIdHint: 'Share this ID with friends to add each other!',
    farmName: 'Farm Name',
    farmNamePlaceholder: 'Enter your farm name...',
    startFarming: 'Start Farming!',
    starterPack: 'Starter Pack',
    starterPackItems: {
      land: 'Farm Land',
      plots: 'plots',
      gold: 'GOLD',
      cropsUnlocked: 'Basic crops unlocked',
      uniqueId: 'Unique 6-digit ID',
    },
    loadingData: 'Loading your farm data...',
    errors: {
      walletFailed: 'Failed to connect wallet. Please try again.',
      switchNetwork: 'Please switch to BSC network in your wallet.',
      connectWallet: 'Please connect wallet first',
      nameTooShort: 'Name must be at least 2 characters',
      nameTooLong: 'Name cannot exceed 20 characters',
      serverError: 'Cannot connect to server. Please try again later.',
      loadError: 'Cannot connect to server. Please refresh the page.',
    },
  },

  // Game Page - HUD
  hud: {
    level: 'Level',
    gold: 'GOLD',
    shop: 'Shop',
    friends: 'Friends',
    achievements: 'Achievements',
    dailyTasks: 'Daily Tasks',
    leaderboard: 'Leaderboard',
    codex: 'Codex',
    wallet: 'Wallet',
    exchange: 'Exchange',
    upgrade: 'Upgrade',
  },

  // Game Page - Farm
  farm: {
    plant: 'Plant',
    harvest: 'Harvest',
    water: 'Water',
    fertilize: 'Fertilize',
    empty: 'Empty',
    growing: 'Growing',
    ready: 'Ready',
    withered: 'Withered',
    locked: 'Locked',
    plantAll: 'Plant All',
    harvestAll: 'Harvest All',
    dragHint: 'Drag to move | Scroll to zoom | Click to plant/harvest',
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    logoutDesc: 'Your progress is automatically saved. Login with the same wallet to continue playing.',
  },

  // Shop
  shop: {
    title: 'Seed Shop',
    price: 'Price',
    growTime: 'Grow Time',
    sellPrice: 'Sell Price',
    levelRequired: 'Level Required',
    buy: 'Buy',
    notEnoughGold: 'Not enough GOLD',
    levelTooLow: 'Level too low',
  },

  // Friends
  friends: {
    title: 'Friends',
    addFriend: 'Add Friend',
    enterFriendId: 'Enter Friend ID',
    visit: 'Visit',
    steal: 'Steal',
    online: 'Online',
    offline: 'Offline',
    noFriends: 'No friends yet',
    addFriendHint: 'Enter 6-digit ID to add friend',
    requestSent: 'Friend request sent',
    requestAccepted: 'Friend request accepted',
  },

  // Exchange
  exchange: {
    title: 'Token Exchange',
    currentRate: 'Current Rate',
    fee: 'Fee',
    goldToFarm: 'Exchange to $FARM (Withdraw)',
    farmToGold: 'Exchange to GOLD (Deposit)',
    amount: 'Amount',
    youWillReceive: 'You will receive',
    minGold: 'Minimum 100 GOLD',
    minFarm: 'Minimum 100,000 FARM',
    goldToFarmDesc: 'GOLD → FARM: Convert game gold to on-chain tokens',
    farmToGoldDesc: 'FARM → GOLD: Deposit on-chain tokens to game',
    feeDesc: 'Exchange fee applies',
  },

  // Notifications
  notifications: {
    plantSuccess: 'Planted successfully',
    harvestSuccess: 'Harvested successfully',
    levelUp: 'Level Up!',
    newAchievement: 'New Achievement',
    taskComplete: 'Task Complete',
    stealSuccess: 'Steal successful',
    goldEarned: 'GOLD earned',
    expEarned: 'XP earned',
  },

  // Time
  time: {
    seconds: 'sec',
    minutes: 'min',
    hours: 'hr',
    days: 'day',
    ago: 'ago',
    remaining: 'remaining',
  },

  // Crops
  crops: {
    radish: 'Radish',
    cabbage: 'Cabbage',
    corn: 'Corn',
    tomato: 'Tomato',
    potato: 'Potato',
    carrot: 'Carrot',
    wheat: 'Wheat',
    strawberry: 'Strawberry',
    watermelon: 'Watermelon',
    pumpkin: 'Pumpkin',
  },
};
