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
    title: 'BSC Farm',
    subtitle: '开始你的农场之旅，种植作物赚取',
    tokenName: '$FARM',
    tokens: '代币！',
    twitterLogin: '使用 X (Twitter) 登入',
    walletLogin: '连接 Web3 钱包',
    selectWallet: '选择钱包',
    or: '或',
    saveHint: '连接钱包后，你的游戏进度将会自动储存',
    features: {
      plant: '种植作物',
      earn: '赚取 $FARM',
      grow: '升级成长',
    },
    errors: {
      walletFailed: '钱包连接失败，请重试',
      switchNetwork: '请在钱包中切换到 BSC 网络',
    },
  },

  // Setup Page
  setup: {
    welcome: '欢迎，农夫！',
    subtitle: '设定你的资料，开始你的农场之旅',
    twitterConnected: '已连接 X (Twitter)',
    needsWallet: '需要绑定钱包',
    needsWalletDesc: '请连接 MetaMask 钱包以储存你的游戏进度。绑定后可在不同装置上游玩。',
    connectWallet: '连接 MetaMask 钱包',
    walletConnected: '已连接钱包',
    yourId: '你的专属 ID',
    shareIdHint: '分享这个 ID 让朋友加你好友！',
    farmName: '农场名称',
    farmNamePlaceholder: '输入你的农场名称...',
    startFarming: '开始种田！',
    starterPack: '新手礼包',
    starterPackItems: {
      land: '农地',
      plots: '格',
      gold: 'GOLD',
      cropsUnlocked: '基本作物已解锁',
      uniqueId: '专属 6 位数 ID',
    },
    loadingData: '正在加载你的农场资料...',
    errors: {
      walletFailed: '钱包连接失败，请重试',
      switchNetwork: '请在钱包中切换到 BSC 网络',
      connectWallet: '请先连接钱包',
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
    wallet: '钱包',
    exchange: '兑换',
    upgrade: '升级',
  },

  // Game Page - Farm
  farm: {
    plant: '种植',
    harvest: '收成',
    water: '浇水',
    fertilize: '施肥',
    empty: '空地',
    growing: '生长中',
    ready: '可收成',
    withered: '枯萎',
    locked: '未解锁',
    plantAll: '全部种植',
    harvestAll: '全部收成',
    dragHint: '拖曳移动视角 | 滚轮缩放 | 点击种植/收成',
  },

  // Settings
  settings: {
    title: '设定',
    language: '语言',
    logout: '登出',
    logoutConfirm: '确定要登出吗？',
    logoutDesc: '你的游戏进度已自动储存，下次用相同钱包登入即可继续游玩。',
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
    steal: '偷菜',
    online: '在线',
    offline: '离线',
    noFriends: '还没有好友',
    addFriendHint: '输入 6 位数 ID 加好友',
    requestSent: '好友请求已发送',
    requestAccepted: '好友请求已接受',
  },

  // Exchange
  exchange: {
    title: '代币兑换',
    currentRate: '当前汇率',
    fee: '手续费',
    goldToFarm: '兑换 $FARM (提现)',
    farmToGold: '兑换 GOLD (充值)',
    amount: '数量',
    youWillReceive: '你将获得',
    minGold: '最少 100 GOLD',
    minFarm: '最少 100,000 FARM',
    goldToFarmDesc: 'GOLD → FARM: 将游戏金币兑换成链上代币',
    farmToGoldDesc: 'FARM → GOLD: 将链上代币充值到游戏中使用',
    feeDesc: '兑换需要支付手续费',
  },

  // Notifications
  notifications: {
    plantSuccess: '种植成功',
    harvestSuccess: '收成成功',
    levelUp: '升级了！',
    newAchievement: '获得新成就',
    taskComplete: '任务完成',
    stealSuccess: '偷菜成功',
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

  // Crops
  crops: {
    radish: '萝卜',
    cabbage: '白菜',
    corn: '玉米',
    tomato: '番茄',
    potato: '马铃薯',
    carrot: '胡萝卜',
    wheat: '小麦',
    strawberry: '草莓',
    watermelon: '西瓜',
    pumpkin: '南瓜',
  },
};

export type Translations = typeof zhCN;
