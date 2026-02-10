// Traditional Chinese translations
import { Translations } from './zh-CN';

export const zhTW: Translations = {
  // Common
  common: {
    loading: '載入中...',
    confirm: '確認',
    cancel: '取消',
    save: '儲存',
    close: '關閉',
    error: '錯誤',
    success: '成功',
    warning: '警告',
    info: '提示',
    retry: '重試',
    back: '返回',
    next: '下一步',
    submit: '提交',
    delete: '刪除',
    edit: '編輯',
    copy: '複製',
    copied: '已複製',
  },

  // Login Page
  login: {
    title: 'Space Farm',
    subtitle: '開始你的太空農場之旅，培育宇宙作物賺取',
    tokenName: 'GOLD',
    tokens: '獎勵！',
    twitterLogin: '使用 X (Twitter) 登入',
    walletLogin: '',
    selectWallet: '',
    or: '',
    saveHint: '登入後，你的遊戲進度將會自動儲存',
    features: {
      plant: '培育作物',
      earn: '賺取 GOLD',
      grow: '升級成長',
    },
    errors: {
      walletFailed: '登入失敗，請重試',
      switchNetwork: '',
    },
  },

  // Setup Page
  setup: {
    welcome: '歡迎，太空探索者！',
    subtitle: '設定你的資料，開始你的太空農場之旅',
    twitterConnected: '已連接 X (Twitter)',
    needsWallet: '',
    needsWalletDesc: '',
    connectWallet: '',
    walletConnected: '',
    yourId: '你的專屬 ID',
    shareIdHint: '分享這個 ID 讓朋友加你好友！',
    farmName: '太空站名稱',
    farmNamePlaceholder: '輸入你的太空站名稱...',
    startFarming: '開始探索！',
    starterPack: '新手禮包',
    starterPackItems: {
      land: '太空站',
      plots: '格',
      gold: 'GOLD',
      cropsUnlocked: '基本作物已解鎖',
      uniqueId: '專屬 6 位數 ID',
    },
    loadingData: '正在載入你的太空站資料...',
    errors: {
      walletFailed: '登入失敗，請重試',
      switchNetwork: '',
      connectWallet: '請先登入',
      nameTooShort: '名稱至少需要 2 個字元',
      nameTooLong: '名稱不能超過 20 個字元',
      serverError: '無法連接伺服器，請稍後再試',
      loadError: '無法連接伺服器，請重新整理頁面',
    },
  },

  // Game Page - HUD
  hud: {
    level: '等級',
    gold: 'GOLD',
    shop: '商店',
    friends: '好友',
    achievements: '成就',
    dailyTasks: '每日任務',
    leaderboard: '排行榜',
    codex: '圖鑑',
    wallet: '',
    exchange: '',
    upgrade: '升級',
  },

  // Game Page - Farm
  farm: {
    plant: '培育',
    harvest: '採集',
    water: '澆水',
    fertilize: '施肥',
    empty: '空地',
    growing: '生長中',
    ready: '可採集',
    withered: '枯萎',
    locked: '未解鎖',
    plantAll: '全部培育',
    harvestAll: '全部採集',
    dragHint: '拖曳移動視角 | 滾輪縮放 | 點擊培育/採集',
  },

  // Settings
  settings: {
    title: '設定',
    language: '語言',
    logout: '登出',
    logoutConfirm: '確定要登出嗎？',
    logoutDesc: '你的遊戲進度已自動儲存，下次用相同帳號登入即可繼續遊玩。',
  },

  // Shop
  shop: {
    title: '種子商店',
    price: '價格',
    growTime: '生長時間',
    sellPrice: '賣出價格',
    levelRequired: '需要等級',
    buy: '購買',
    notEnoughGold: 'GOLD 不足',
    levelTooLow: '等級不足',
  },

  // Friends
  friends: {
    title: '好友',
    addFriend: '加好友',
    enterFriendId: '輸入好友 ID',
    visit: '拜訪',
    steal: '掠奪',
    online: '在線',
    offline: '離線',
    noFriends: '還沒有好友',
    addFriendHint: '輸入 6 位數 ID 加好友',
    requestSent: '好友請求已發送',
    requestAccepted: '好友請求已接受',
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
    plantSuccess: '培育成功',
    harvestSuccess: '採集成功',
    levelUp: '升級了！',
    newAchievement: '獲得新成就',
    taskComplete: '任務完成',
    stealSuccess: '掠奪成功',
    goldEarned: '獲得 GOLD',
    expEarned: '獲得經驗值',
  },

  // Time
  time: {
    seconds: '秒',
    minutes: '分鐘',
    hours: '小時',
    days: '天',
    ago: '前',
    remaining: '剩餘',
  },

  // Crops (space themed - kept for type compatibility)
  crops: {
    radish: '太空芽',
    cabbage: '月光草',
    corn: '星塵蘑菇',
    tomato: '彗星果',
    potato: '流星薯',
    carrot: '電漿莓',
    wheat: '銀河小麥',
    strawberry: '脈衝星果',
    watermelon: '量子水晶瓜',
    pumpkin: '黑洞南瓜',
  },
};
