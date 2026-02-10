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
    title: 'Space Farm',
    subtitle: 'Start your space farming journey, grow cosmic crops and earn',
    tokenName: 'GOLD',
    tokens: 'rewards!',
    twitterLogin: 'Login with X (Twitter)',
    walletLogin: '',
    selectWallet: '',
    or: '',
    saveHint: 'Your game progress will be automatically saved after login',
    features: {
      plant: 'Grow Crops',
      earn: 'Earn GOLD',
      grow: 'Level Up',
    },
    errors: {
      walletFailed: 'Login failed. Please try again.',
      switchNetwork: '',
    },
  },

  // Setup Page
  setup: {
    welcome: 'Welcome, Space Explorer!',
    subtitle: 'Set up your profile and start your space farming journey',
    twitterConnected: 'Connected to X (Twitter)',
    needsWallet: '',
    needsWalletDesc: '',
    connectWallet: '',
    walletConnected: '',
    yourId: 'Your Unique ID',
    shareIdHint: 'Share this ID with friends to add each other!',
    farmName: 'Space Station Name',
    farmNamePlaceholder: 'Enter your space station name...',
    startFarming: 'Start Exploring!',
    starterPack: 'Starter Pack',
    starterPackItems: {
      land: 'Space Station',
      plots: 'plots',
      gold: 'GOLD',
      cropsUnlocked: 'Basic crops unlocked',
      uniqueId: 'Unique 6-digit ID',
    },
    loadingData: 'Loading your space station data...',
    errors: {
      walletFailed: 'Login failed. Please try again.',
      switchNetwork: '',
      connectWallet: 'Please login first',
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
    wallet: '',
    exchange: '',
    upgrade: 'Upgrade',
  },

  // Game Page - Farm
  farm: {
    plant: 'Grow',
    harvest: 'Harvest',
    water: 'Water',
    fertilize: 'Fertilize',
    empty: 'Empty',
    growing: 'Growing',
    ready: 'Ready',
    withered: 'Withered',
    locked: 'Locked',
    plantAll: 'Grow All',
    harvestAll: 'Harvest All',
    dragHint: 'Drag to move | Scroll to zoom | Click to grow/harvest',
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    logoutDesc: 'Your progress is automatically saved. Login with the same account to continue playing.',
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
    steal: 'Raid',
    online: 'Online',
    offline: 'Offline',
    noFriends: 'No friends yet',
    addFriendHint: 'Enter 6-digit ID to add friend',
    requestSent: 'Friend request sent',
    requestAccepted: 'Friend request accepted',
  },

  // Exchange (removed - kept for type compatibility)
  exchange: {
    title: '',
    currentRate: '',
    fee: '',
    goldToFarm: '',
    farmToGold: '',
    amount: '',
    youWillReceive: '',
    minGold: '',
    minFarm: '',
    goldToFarmDesc: '',
    farmToGoldDesc: '',
    feeDesc: '',
  },

  // Notifications
  notifications: {
    plantSuccess: 'Grown successfully',
    harvestSuccess: 'Harvested successfully',
    levelUp: 'Level Up!',
    newAchievement: 'New Achievement',
    taskComplete: 'Task Complete',
    stealSuccess: 'Raid successful',
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

  // Crops (space themed)
  crops: {
    radish: 'Space Sprout',
    cabbage: 'Moonlight Grass',
    corn: 'Stardust Mushroom',
    tomato: 'Comet Fruit',
    potato: 'Meteor Tuber',
    carrot: 'Plasma Berry',
    wheat: 'Galaxy Wheat',
    strawberry: 'Pulsar Fruit',
    watermelon: 'Quantum Crystal Melon',
    pumpkin: 'Black Hole Pumpkin',
  },
};
