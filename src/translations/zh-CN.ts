// Simplified Chinese translations (default)
export const zhCN = {
  // Common
  common: {
    loading: '加载中...',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    close: '关闭',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '提示',
    retry: '重试',
    back: '返回',
    next: '下一步',
    submit: '提交',
    delete: '删除',
    edit: '编辑',
    copy: '复制',
    copied: '已复制',
  },

  // Login Page
  login: {
    title: 'Space Farm',
    subtitle: '开始你的太空农场之旅，培育宇宙作物赚取',
    tokenName: 'GOLD',
    tokens: '奖励！',
    twitterLogin: '使用 X (Twitter) 登入',
    walletLogin: '',
    selectWallet: '',
    or: '',
    saveHint: '登入后，你的游戏进度将会自动储存',
    features: {
      plant: '培育作物',
      earn: '赚取 GOLD',
      grow: '升级成长',
    },
    errors: {
      walletFailed: '登入失败，请重试',
      switchNetwork: '',
    },
  },

  // Setup Page
  setup: {
    welcome: '欢迎，太空探索者！',
    subtitle: '设定你的资料，开始你的太空农场之旅',
    twitterConnected: '已连接 X (Twitter)',
    needsWallet: '',
    needsWalletDesc: '',
    connectWallet: '',
    walletConnected: '',
    yourId: '你的专属 ID',
    shareIdHint: '分享这个 ID 让朋友加你好友！',
    farmName: '太空站名称',
    farmNamePlaceholder: '输入你的太空站名称...',
    startFarming: '开始探索！',
    starterPack: '新手礼包',
    starterPackItems: {
      land: '太空站',
      plots: '格',
      gold: 'GOLD',
      cropsUnlocked: '基本作物已解锁',
      uniqueId: '专属 6 位数 ID',
    },
    loadingData: '正在加载你的太空站资料...',
    errors: {
      walletFailed: '登入失败，请重试',
      switchNetwork: '',
      connectWallet: '请先登入',
      nameTooShort: '名称至少需要 2 个字元',
      nameTooLong: '名称不能超过 20 个字元',
      serverError: '无法连接服务器，请稍后再试',
      loadError: '无法连接服务器，请重新整理页面',
    },
  },

  // Game Page - HUD
  hud: {
    level: '等级',
    gold: 'GOLD',
    shop: '商店',
    friends: '好友',
    achievements: '成就',
    dailyTasks: '每日任务',
    leaderboard: '排行榜',
    codex: '图鉴',
    wallet: '',
    exchange: '',
    upgrade: '升级',
  },

  // Game Page - Farm
  farm: {
    plant: '培育',
    harvest: '采集',
    water: '浇水',
    fertilize: '施肥',
    empty: '空地',
    growing: '生长中',
    ready: '可采集',
    withered: '枯萎',
    locked: '未解锁',
    plantAll: '全部培育',
    harvestAll: '全部采集',
    dragHint: '拖曳移动视角 | 滚轮缩放 | 点击培育/采集',
  },

  // Settings
  settings: {
    title: '设定',
    language: '语言',
    logout: '登出',
    logoutConfirm: '确定要登出吗？',
    logoutDesc: '你的游戏进度已自动储存，下次用相同帐号登入即可继续游玩。',
  },

  // Shop
  shop: {
    title: '种子商店',
    price: '价格',
    growTime: '生长时间',
    sellPrice: '卖出价格',
    levelRequired: '需要等级',
    buy: '购买',
    notEnoughGold: 'GOLD 不足',
    levelTooLow: '等级不足',
  },

  // Friends
  friends: {
    title: '好友',
    addFriend: '加好友',
    enterFriendId: '输入好友 ID',
    visit: '拜访',
    steal: '掠夺',
    online: '在线',
    offline: '离线',
    noFriends: '还没有好友',
    addFriendHint: '输入 6 位数 ID 加好友',
    requestSent: '好友请求已发送',
    requestAccepted: '好友请求已接受',
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
    harvestSuccess: '采集成功',
    levelUp: '升级了！',
    newAchievement: '获得新成就',
    taskComplete: '任务完成',
    stealSuccess: '掠夺成功',
    goldEarned: '获得 GOLD',
    expEarned: '获得经验值',
  },

  // Time
  time: {
    seconds: '秒',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    ago: '前',
    remaining: '剩余',
  },

  // Crops (space themed - kept for type compatibility)
  crops: {
    radish: '太空芽',
    cabbage: '月光草',
    corn: '星尘蘑菇',
    tomato: '彗星果',
    potato: '流星薯',
    carrot: '电浆莓',
    wheat: '银河小麦',
    strawberry: '脉冲星果',
    watermelon: '量子水晶瓜',
    pumpkin: '黑洞南瓜',
  },
};

export type Translations = typeof zhCN;
