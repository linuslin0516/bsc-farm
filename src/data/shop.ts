import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // Land upgrades
  {
    id: 'land_4x4',
    name: '4x4 Land',
    nameCn: '4x4 土地',
    description: 'Upgrade to 4x4 farmland (16 cells)',
    price: 500,
    type: 'land',
    icon: '🏞️',
  },
  {
    id: 'land_5x5',
    name: '5x5 Land',
    nameCn: '5x5 土地',
    description: 'Upgrade to 5x5 farmland (25 cells)',
    price: 2000,
    type: 'land',
    icon: '🌄',
  },
  {
    id: 'land_6x6',
    name: '6x6 Land',
    nameCn: '6x6 土地',
    description: 'Upgrade to 6x6 farmland (36 cells)',
    price: 5000,
    type: 'land',
    icon: '🏔️',
  },
  // Tools
  {
    id: 'fertilizer',
    name: 'Fertilizer',
    nameCn: '肥料',
    description: 'Reduces remaining growth time by 10%',
    price: 50,
    type: 'tool',
    icon: '🧪',
    effect: {
      type: 'speed',
      value: 0.1,
    },
  },
  {
    id: 'super_fertilizer',
    name: 'Super Fertilizer',
    nameCn: '超級肥料',
    description: 'Reduces remaining growth time by 20%',
    price: 150,
    type: 'tool',
    icon: '⚡',
    effect: {
      type: 'speed',
      value: 0.2,
    },
  },
  {
    id: 'golden_water',
    name: 'Golden Water',
    nameCn: '黃金澆水器',
    description: 'Increases harvest yield by 25%',
    price: 50,
    type: 'tool',
    icon: '💧',
    effect: {
      type: 'yield',
      value: 0.25,
    },
  },
  // Boosts
  {
    id: 'exp_boost',
    name: 'EXP Boost',
    nameCn: '經驗加倍',
    description: 'Double experience for 10 minutes',
    price: 200,
    type: 'boost',
    icon: '⭐',
    effect: {
      type: 'yield',
      value: 2,
      duration: 600,
    },
  },
];

export const LAND_PRICES: Record<number, number> = {
  4: 500,
  5: 2000,
  6: 5000,
};

export const getShopItemById = (id: string): ShopItem | undefined => {
  return SHOP_ITEMS.find(item => item.id === id);
};
