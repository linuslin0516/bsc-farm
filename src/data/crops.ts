import { CropDefinition, CropRarity } from '../types';

// Growth time multiplier - adjust this to slow down/speed up the game
// Current: 30x slower than original (more realistic farming pace)
// Note: This constant is kept for documentation purposes
// const GROWTH_MULTIPLIER = 30;

export const CROPS: CropDefinition[] = [
  // ============ Common (普通) - Gray ============
  // Growth: 30-60 minutes, ROI: ~60%
  {
    id: 'carrot',
    name: 'Carrot',
    nameCn: '胡蘿蔔',
    description: '最基本的農作物，適合新手種植',
    cost: 50,
    growthTime: 1800, // 30 minutes
    sellPrice: 80,
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
    growthTime: 2700, // 45 minutes
    sellPrice: 180,
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
    growthTime: 2100, // 35 minutes
    sellPrice: 120,
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
    growthTime: 3600, // 60 minutes
    sellPrice: 150,
    experience: 18,
    unlockLevel: 2,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'common',
    emoji: '🧅',
  },

  // ============ Uncommon (優良) - Green ============
  // Growth: 2-4 hours, ROI: ~80%
  {
    id: 'corn',
    name: 'Corn',
    nameCn: '玉米',
    description: '金黃飽滿的玉米粒',
    cost: 300,
    growthTime: 7200, // 2 hours
    sellPrice: 550,
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
    growthTime: 10800, // 3 hours
    sellPrice: 900,
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
    growthTime: 9000, // 2.5 hours
    sellPrice: 720,
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
    growthTime: 12600, // 3.5 hours
    sellPrice: 1000,
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
    growthTime: 14400, // 4 hours
    sellPrice: 1100,
    experience: 60,
    unlockLevel: 4,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'uncommon',
    emoji: '🥦',
  },

  // ============ Rare (稀有) - Blue ============
  // Growth: 6-12 hours, ROI: ~100%
  {
    id: 'strawberry',
    name: 'Strawberry',
    nameCn: '草莓',
    description: '甜蜜的紅寶石，廣受歡迎',
    cost: 1000,
    growthTime: 21600, // 6 hours
    sellPrice: 2000,
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
    growthTime: 32400, // 9 hours
    sellPrice: 4500,
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
    growthTime: 25200, // 7 hours
    sellPrice: 3200,
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
    growthTime: 28800, // 8 hours
    sellPrice: 3800,
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
    growthTime: 43200, // 12 hours
    sellPrice: 2800,
    experience: 90,
    unlockLevel: 7,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'rare',
    emoji: '🍒',
  },

  // ============ Epic (史詩) - Purple ============
  // Growth: 24-36 hours, ROI: ~140%
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    nameCn: '南瓜',
    description: '巨大的萬聖節象徵',
    cost: 5000,
    growthTime: 86400, // 24 hours
    sellPrice: 12000,
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
    growthTime: 108000, // 30 hours
    sellPrice: 20000,
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
    growthTime: 93600, // 26 hours
    sellPrice: 14500,
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
    growthTime: 100800, // 28 hours
    sellPrice: 17000,
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
    growthTime: 129600, // 36 hours
    sellPrice: 25000,
    experience: 350,
    unlockLevel: 12,
    stages: ['seed', 'sprout', 'growing', 'mature'],
    rarity: 'epic',
    emoji: '💎',
  },

  // ============ Legendary (傳說) - Gold ============
  // Growth: 48-72 hours, ROI: ~167-200%
  {
    id: 'rainbow_rose',
    name: 'Rainbow Rose',
    nameCn: '彩虹玫瑰',
    description: '傳說中的七彩花朵，據說能帶來好運',
    cost: 15000,
    growthTime: 172800, // 48 hours
    sellPrice: 40000,
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
    growthTime: 194400, // 54 hours
    sellPrice: 65000,
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
    growthTime: 216000, // 60 hours
    sellPrice: 90000,
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
    growthTime: 237600, // 66 hours
    sellPrice: 120000,
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
    growthTime: 259200, // 72 hours
    sellPrice: 150000,
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
