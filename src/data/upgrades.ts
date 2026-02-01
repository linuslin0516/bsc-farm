import { FarmUpgrade, UpgradeBonuses, PlayerUpgrades } from '../types';

// All available farm upgrades
export const FARM_UPGRADES: FarmUpgrade[] = [
  // ============ Production Category ============
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    nameCn: '溫室',
    description: 'Reduces crop growth time',
    descriptionCn: '減少作物生長時間',
    category: 'production',
    icon: '🏠',
    maxLevel: 3,
    baseCost: 50000,
    costMultiplier: 2.5,
    effects: [
      { type: 'growth_speed', valuePerLevel: 0.10 } // 10% faster per level
    ],
    unlockLevel: 3,
  },
  {
    id: 'sprinkler',
    name: 'Auto Sprinkler',
    nameCn: '自動灑水器',
    description: 'Increases crop sell price',
    descriptionCn: '提高作物售價',
    category: 'production',
    icon: '💧',
    maxLevel: 3,
    baseCost: 30000,
    costMultiplier: 2.5,
    effects: [
      { type: 'sell_bonus', valuePerLevel: 0.08 } // 8% more gold per level
    ],
    unlockLevel: 2,
  },
  {
    id: 'fertilizer_station',
    name: 'Fertilizer Station',
    nameCn: '肥料站',
    description: 'Increases experience gained from harvesting',
    descriptionCn: '提高收成獲得的經驗值',
    category: 'production',
    icon: '🧪',
    maxLevel: 3,
    baseCost: 25000,
    costMultiplier: 2.5,
    effects: [
      { type: 'exp_bonus', valuePerLevel: 0.15 } // 15% more exp per level
    ],
    unlockLevel: 2,
  },
  {
    id: 'golden_tools',
    name: 'Golden Tools',
    nameCn: '黃金農具',
    description: 'Bonus yield for rare and above crops',
    descriptionCn: '稀有及以上作物獲得額外收益',
    category: 'production',
    icon: '✨',
    maxLevel: 3,
    baseCost: 100000,
    costMultiplier: 3,
    effects: [
      { type: 'rare_bonus', valuePerLevel: 0.12 } // 12% bonus for rare+ crops
    ],
    unlockLevel: 8,
  },

  // ============ Protection Category ============
  {
    id: 'scarecrow',
    name: 'Scarecrow',
    nameCn: '稻草人',
    description: 'Chance to block stealing attempts',
    descriptionCn: '有機率阻止偷菜',
    category: 'protection',
    icon: '🐦',
    maxLevel: 3,
    baseCost: 20000,
    costMultiplier: 2.5,
    effects: [
      { type: 'theft_protection', valuePerLevel: 0.15 } // 15% block chance per level
    ],
    unlockLevel: 4,
  },
  {
    id: 'guard_dog',
    name: 'Guard Dog',
    nameCn: '看門狗',
    description: 'Additional protection against theft',
    descriptionCn: '額外防盜保護',
    category: 'protection',
    icon: '🐕',
    maxLevel: 3,
    baseCost: 60000,
    costMultiplier: 2.5,
    effects: [
      { type: 'theft_protection', valuePerLevel: 0.10 } // Stacks with scarecrow
    ],
    unlockLevel: 6,
  },

  // ============ Expansion Category ============
  {
    id: 'warehouse',
    name: 'Warehouse',
    nameCn: '倉庫',
    description: 'Unlock additional farm slots',
    descriptionCn: '解鎖額外農地格子',
    category: 'expansion',
    icon: '📦',
    maxLevel: 3,
    baseCost: 80000,
    costMultiplier: 3,
    effects: [
      { type: 'land_slots', valuePerLevel: 2 } // 2 extra slots per level
    ],
    unlockLevel: 5,
  },

  // ============ Special Category ============
  {
    id: 'accelerator',
    name: 'Growth Accelerator',
    nameCn: '生長加速器',
    description: 'Significantly reduces growth time',
    descriptionCn: '大幅減少生長時間',
    category: 'special',
    icon: '⚡',
    maxLevel: 3,
    baseCost: 150000,
    costMultiplier: 3,
    effects: [
      { type: 'growth_speed', valuePerLevel: 0.15 } // Stacks with greenhouse
    ],
    unlockLevel: 10,
  },
  {
    id: 'lucky_clover',
    name: 'Lucky Clover',
    nameCn: '幸運草',
    description: 'Extra bonus for all crop sales',
    descriptionCn: '所有作物銷售額外加成',
    category: 'special',
    icon: '🍀',
    maxLevel: 3,
    baseCost: 120000,
    costMultiplier: 3,
    effects: [
      { type: 'sell_bonus', valuePerLevel: 0.05 }, // Stacks with sprinkler
      { type: 'rare_bonus', valuePerLevel: 0.08 }
    ],
    unlockLevel: 12,
  },
];

// Get upgrade by ID
export const getUpgradeById = (id: string): FarmUpgrade | undefined => {
  return FARM_UPGRADES.find(u => u.id === id);
};

// Get upgrades by category
export const getUpgradesByCategory = (category: FarmUpgrade['category']): FarmUpgrade[] => {
  return FARM_UPGRADES.filter(u => u.category === category);
};

// Get upgrades available at player level
export const getAvailableUpgrades = (playerLevel: number): FarmUpgrade[] => {
  return FARM_UPGRADES.filter(u => u.unlockLevel <= playerLevel);
};

// Calculate cost for a specific level
export const getUpgradeCost = (upgrade: FarmUpgrade, currentLevel: number): number => {
  if (currentLevel >= upgrade.maxLevel) return 0;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
};

// Calculate total bonuses from all upgrades
export const calculateUpgradeBonuses = (playerUpgrades: PlayerUpgrades): UpgradeBonuses => {
  const bonuses: UpgradeBonuses = {
    growthSpeedMultiplier: 1.0,
    sellPriceMultiplier: 1.0,
    expMultiplier: 1.0,
    theftProtection: 0,
    extraLandSlots: 0,
    rareBonusMultiplier: 1.0,
  };

  for (const [upgradeId, level] of Object.entries(playerUpgrades.upgrades)) {
    if (level <= 0) continue;

    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) continue;

    for (const effect of upgrade.effects) {
      const totalEffect = effect.valuePerLevel * level;

      switch (effect.type) {
        case 'growth_speed':
          // Reduce multiplier (0.9 = 10% faster)
          bonuses.growthSpeedMultiplier -= totalEffect;
          break;
        case 'sell_bonus':
          bonuses.sellPriceMultiplier += totalEffect;
          break;
        case 'exp_bonus':
          bonuses.expMultiplier += totalEffect;
          break;
        case 'theft_protection':
          bonuses.theftProtection += totalEffect;
          break;
        case 'land_slots':
          bonuses.extraLandSlots += totalEffect;
          break;
        case 'rare_bonus':
          bonuses.rareBonusMultiplier += totalEffect;
          break;
      }
    }
  }

  // Clamp values to reasonable limits
  bonuses.growthSpeedMultiplier = Math.max(0.3, bonuses.growthSpeedMultiplier); // Min 70% faster
  bonuses.theftProtection = Math.min(0.75, bonuses.theftProtection); // Max 75% protection

  return bonuses;
};

// Default player upgrades (no upgrades purchased)
export const DEFAULT_PLAYER_UPGRADES: PlayerUpgrades = {
  oderId: '',
  upgrades: {},
  totalSpent: 0,
};

// Format upgrade effect for display
export const formatUpgradeEffect = (effect: { type: string; valuePerLevel: number }, level: number): string => {
  const value = effect.valuePerLevel * level * 100;

  switch (effect.type) {
    case 'growth_speed':
      return `生長時間 -${value.toFixed(0)}%`;
    case 'sell_bonus':
      return `售價 +${value.toFixed(0)}%`;
    case 'exp_bonus':
      return `經驗值 +${value.toFixed(0)}%`;
    case 'theft_protection':
      return `防盜 +${value.toFixed(0)}%`;
    case 'land_slots':
      return `農地 +${effect.valuePerLevel * level} 格`;
    case 'rare_bonus':
      return `稀有作物加成 +${value.toFixed(0)}%`;
    default:
      return '';
  }
};
