import { CropDefinition, CropRarity } from '../types';

// Growth time configuration (in seconds):
// Common: 3-5 minutes
// Uncommon: 5-10 minutes
// Rare: 10-20 minutes
// Epic: 25-35 minutes
// Legendary: 45-60 minutes

// ROI configuration (after fee deduction):
// Common: 20-25%
// Uncommon: 30-35%
// Rare: 40-45%
// Epic: 50-60%
// Legendary: 70-80%

export const CROPS: CropDefinition[] = [
  // ============ Common (普通) - Gray ============
  // Growth: 3-5 minutes, ROI: 20-25%
  {
    id: 'carrot',
    name: 'Carrot',
    nameCn: '胡蘿蔔',
    description: '最基本的農作物，適合新手種植',
    cost: 50,
    growthTime: 180, // 3 minutes
    sellPrice: 61, // ROI: 22%
    experience: 10,
    unlockLevel: 1,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'common',
    emoji: '🥕',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    nameCn: '番茄',
    description: '多汁的番茄，收益穩定',
    cost: 100,
    growthTime: 240, // 4 minutes
    sellPrice: 125, // ROI: 25%
    experience: 20,
    unlockLevel: 1,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'common',
    emoji: '🍅',
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    nameCn: '高麗菜',
    description: '耐寒的蔬菜，生長穩定',
    cost: 70,
    growthTime: 210, // 3.5 minutes
    sellPrice: 85, // ROI: 21%
    experience: 15,
    unlockLevel: 1,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'common',
    emoji: '🥬',
  },
  {
    id: 'onion',
    name: 'Onion',
    nameCn: '洋蔥',
    description: '地下生長的調味蔬菜',
    cost: 80,
    growthTime: 300, // 5 minutes
    sellPrice: 100, // ROI: 25%
    experience: 18,
    unlockLevel: 2,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'common',
    emoji: '🧅',
  },

  // ============ Uncommon (優良) - Green ============
  // Growth: 5-10 minutes, ROI: 30-35%
  {
    id: 'corn',
    name: 'Corn',
    nameCn: '玉米',
    description: '金黃飽滿的玉米粒',
    cost: 300,
    growthTime: 300, // 5 minutes
    sellPrice: 390, // ROI: 30%
    experience: 35,
    unlockLevel: 2,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'uncommon',
    emoji: '🌽',
  },
  {
    id: 'potato',
    name: 'Potato',
    nameCn: '馬鈴薯',
    description: '地下的金礦，產量豐富',
    cost: 500,
    growthTime: 420, // 7 minutes
    sellPrice: 660, // ROI: 32%
    experience: 50,
    unlockLevel: 3,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'uncommon',
    emoji: '🥔',
  },
  {
    id: 'pepper',
    name: 'Bell Pepper',
    nameCn: '彩椒',
    description: '色彩繽紛的健康蔬菜',
    cost: 400,
    growthTime: 360, // 6 minutes
    sellPrice: 520, // ROI: 30%
    experience: 45,
    unlockLevel: 3,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'uncommon',
    emoji: '🫑',
  },
  {
    id: 'eggplant',
    name: 'Eggplant',
    nameCn: '茄子',
    description: '紫色光澤的高級蔬菜',
    cost: 550,
    growthTime: 480, // 8 minutes
    sellPrice: 730, // ROI: 33%
    experience: 55,
    unlockLevel: 4,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'uncommon',
    emoji: '🍆',
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    nameCn: '花椰菜',
    description: '營養價值極高的蔬菜',
    cost: 600,
    growthTime: 600, // 10 minutes
    sellPrice: 810, // ROI: 35%
    experience: 60,
    unlockLevel: 4,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'uncommon',
    emoji: '🥦',
  },

  // ============ Rare (稀有) - Blue ============
  // Growth: 10-20 minutes, ROI: 40-45%
  {
    id: 'strawberry',
    name: 'Strawberry',
    nameCn: '草莓',
    description: '甜蜜的紅寶石，廣受歡迎',
    cost: 1000,
    growthTime: 600, // 10 minutes
    sellPrice: 1400, // ROI: 40%
    experience: 80,
    unlockLevel: 5,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'rare',
    emoji: '🍓',
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    nameCn: '西瓜',
    description: '夏日消暑的大型水果',
    cost: 2000,
    growthTime: 900, // 15 minutes
    sellPrice: 2840, // ROI: 42%
    experience: 120,
    unlockLevel: 5,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'rare',
    emoji: '🍉',
  },
  {
    id: 'grapes',
    name: 'Grapes',
    nameCn: '葡萄',
    description: '可釀造美酒的高級水果',
    cost: 1500,
    growthTime: 720, // 12 minutes
    sellPrice: 2100, // ROI: 40%
    experience: 100,
    unlockLevel: 6,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'rare',
    emoji: '🍇',
  },
  {
    id: 'peach',
    name: 'Peach',
    nameCn: '水蜜桃',
    description: '香甜多汁的仙桃',
    cost: 1800,
    growthTime: 1020, // 17 minutes
    sellPrice: 2600, // ROI: 44%
    experience: 110,
    unlockLevel: 6,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'rare',
    emoji: '🍑',
  },
  {
    id: 'cherry',
    name: 'Cherry',
    nameCn: '櫻桃',
    description: '小巧玲瓏的紅寶石',
    cost: 1200,
    growthTime: 1200, // 20 minutes
    sellPrice: 1740, // ROI: 45%
    experience: 90,
    unlockLevel: 7,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'rare',
    emoji: '🍒',
  },

  // ============ Epic (史詩) - Purple ============
  // Growth: 25-35 minutes, ROI: 50-60%
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    nameCn: '南瓜',
    description: '巨大的萬聖節象徵',
    cost: 5000,
    growthTime: 1500, // 25 minutes
    sellPrice: 7500, // ROI: 50%
    experience: 200,
    unlockLevel: 7,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'epic',
    emoji: '🎃',
  },
  {
    id: 'golden_wheat',
    name: 'Golden Wheat',
    nameCn: '黃金小麥',
    description: '閃閃發光的神奇穀物',
    cost: 8000,
    growthTime: 1800, // 30 minutes
    sellPrice: 12400, // ROI: 55%
    experience: 300,
    unlockLevel: 8,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'epic',
    emoji: '🌾',
  },
  {
    id: 'dragon_fruit',
    name: 'Dragon Fruit',
    nameCn: '火龍果',
    description: '來自熱帶的神秘果實',
    cost: 6000,
    growthTime: 1620, // 27 minutes
    sellPrice: 9120, // ROI: 52%
    experience: 250,
    unlockLevel: 9,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'epic',
    emoji: '🐉',
  },
  {
    id: 'star_fruit',
    name: 'Star Fruit',
    nameCn: '楊桃',
    description: '形狀如星的奇特水果',
    cost: 7000,
    growthTime: 1920, // 32 minutes
    sellPrice: 11200, // ROI: 60%
    experience: 280,
    unlockLevel: 10,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'epic',
    emoji: '⭐',
  },
  {
    id: 'crystal_melon',
    name: 'Crystal Melon',
    nameCn: '水晶瓜',
    description: '透明如水晶的神奇瓜果',
    cost: 10000,
    growthTime: 2100, // 35 minutes
    sellPrice: 16000, // ROI: 60%
    experience: 350,
    unlockLevel: 12,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'epic',
    emoji: '💎',
  },

  // ============ Legendary (傳說) - Gold ============
  // Growth: 45-60 minutes, ROI: 70-80%
  {
    id: 'rainbow_rose',
    name: 'Rainbow Rose',
    nameCn: '彩虹玫瑰',
    description: '傳說中的七彩花朵，據說能帶來好運',
    cost: 15000,
    growthTime: 2700, // 45 minutes
    sellPrice: 25500, // ROI: 70%
    experience: 500,
    unlockLevel: 15,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'legendary',
    emoji: '🌹',
  },
  {
    id: 'golden_apple',
    name: 'Golden Apple',
    nameCn: '黃金蘋果',
    description: '傳說中神仙吃的不老仙果',
    cost: 25000,
    growthTime: 3000, // 50 minutes
    sellPrice: 43000, // ROI: 72%
    experience: 700,
    unlockLevel: 18,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'legendary',
    emoji: '🍎',
  },
  {
    id: 'phoenix_flower',
    name: 'Phoenix Flower',
    nameCn: '鳳凰花',
    description: '浴火重生的不滅之花，傳說級作物',
    cost: 35000,
    growthTime: 3300, // 55 minutes
    sellPrice: 61250, // ROI: 75%
    experience: 900,
    unlockLevel: 20,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'legendary',
    emoji: '🔥',
  },
  {
    id: 'moonlight_orchid',
    name: 'Moonlight Orchid',
    nameCn: '月光蘭',
    description: '只在月圓之夜綻放的神秘蘭花',
    cost: 45000,
    growthTime: 3420, // 57 minutes
    sellPrice: 80100, // ROI: 78%
    experience: 1100,
    unlockLevel: 25,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'legendary',
    emoji: '🌙',
  },
  {
    id: 'cosmic_fruit',
    name: 'Cosmic Fruit',
    nameCn: '宇宙果',
    description: '蘊含星辰之力的終極作物，據說是外星文明的禮物',
    cost: 50000,
    growthTime: 3600, // 60 minutes
    sellPrice: 90000, // ROI: 80%
    experience: 1500,
    unlockLevel: 30,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'legendary',
    emoji: '🌌',
  },
];

export const getCropById = (id: string): CropDefinition | undefined => {
  return CROPS.find(crop => crop.id === id);
};

export const getUnlockedCrops = (level: number): CropDefinition[] => {
  return CROPS.filter(crop => crop.unlockLevel <= level);
};

export const getCropsByRarity = (rarity: CropRarity): CropDefinition[] => {
  return CROPS.filter(crop => crop.rarity === rarity);
};

export const getAllCrops = (): CropDefinition[] => {
  return CROPS;
};
