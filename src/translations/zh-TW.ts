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
    title: 'BSC Farm',
    subtitle: '開始你的農場之旅，種植作物賺取',
    tokenName: '$FARM',
    tokens: '代幣！',
    twitterLogin: '使用 X (Twitter) 登入',
    walletLogin: '連接 Web3 錢包',
    selectWallet: '選擇錢包',
    or: '或',
    saveHint: '連接錢包後，你的遊戲進度將會自動儲存',
    features: {
      plant: '種植作物',
      earn: '賺取 $FARM',
      grow: '升級成長',
    },
    errors: {
      walletFailed: '錢包連接失敗，請重試',
      switchNetwork: '請在錢包中切換到 BSC 網路',
    },
  },

  // Setup Page
  setup: {
    welcome: '歡迎，農夫！',
    subtitle: '設定你的資料，開始你的農場之旅',
    twitterConnected: '已連接 X (Twitter)',
    needsWallet: '需要綁定錢包',
    needsWalletDesc: '請連接 MetaMask 錢包以儲存你的遊戲進度。綁定後可在不同裝置上遊玩。',
    connectWallet: '連接 MetaMask 錢包',
    walletConnected: '已連接錢包',
    yourId: '你的專屬 ID',
    shareIdHint: '分享這個 ID 讓朋友加你好友！',
    farmName: '農場名稱',
    farmNamePlaceholder: '輸入你的農場名稱...',
    startFarming: '開始種田！',
    starterPack: '新手禮包',
    starterPackItems: {
      land: '農地',
      plots: '格',
      gold: 'GOLD',
      cropsUnlocked: '基本作物已解鎖',
      uniqueId: '專屬 6 位數 ID',
    },
    loadingData: '正在載入你的農場資料...',
    errors: {
      walletFailed: '錢包連接失敗，請重試',
      switchNetwork: '請在錢包中切換到 BSC 網路',
      connectWallet: '請先連接錢包',
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
    wallet: '錢包',
    exchange: '兌換',
    upgrade: '升級',
  },

  // Game Page - Farm
  farm: {
    plant: '種植',
    harvest: '收成',
    water: '澆水',
    fertilize: '施肥',
    empty: '空地',
    growing: '生長中',
    ready: '可收成',
    withered: '枯萎',
    locked: '未解鎖',
    plantAll: '全部種植',
    harvestAll: '全部收成',
    dragHint: '拖曳移動視角 | 滾輪縮放 | 點擊種植/收成',
  },

  // Settings
  settings: {
    title: '設定',
    language: '語言',
    logout: '登出',
    logoutConfirm: '確定要登出嗎？',
    logoutDesc: '你的遊戲進度已自動儲存，下次用相同錢包登入即可繼續遊玩。',
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
    steal: '偷菜',
    online: '在線',
    offline: '離線',
    noFriends: '還沒有好友',
    addFriendHint: '輸入 6 位數 ID 加好友',
    requestSent: '好友請求已發送',
    requestAccepted: '好友請求已接受',
  },

  // Exchange
  exchange: {
    title: '代幣兌換',
    currentRate: '當前匯率',
    fee: '手續費',
    goldToFarm: '兌換 $FARM (提現)',
    farmToGold: '兌換 GOLD (充值)',
    amount: '數量',
    youWillReceive: '你將獲得',
    minGold: '最少 100 GOLD',
    minFarm: '最少 100,000 FARM',
    goldToFarmDesc: 'GOLD → FARM: 將遊戲金幣兌換成鏈上代幣',
    farmToGoldDesc: 'FARM → GOLD: 將鏈上代幣充值到遊戲中使用',
    feeDesc: '兌換需要支付手續費',
  },

  // Notifications
  notifications: {
    plantSuccess: '種植成功',
    harvestSuccess: '收成成功',
    levelUp: '升級了！',
    newAchievement: '獲得新成就',
    taskComplete: '任務完成',
    stealSuccess: '偷菜成功',
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

  // Crops
  crops: {
    radish: '蘿蔔',
    cabbage: '白菜',
    corn: '玉米',
    tomato: '番茄',
    potato: '馬鈴薯',
    carrot: '胡蘿蔔',
    wheat: '小麥',
    strawberry: '草莓',
    watermelon: '西瓜',
    pumpkin: '南瓜',
  },
};
