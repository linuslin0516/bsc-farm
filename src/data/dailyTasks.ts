import { DailyTask } from '../types';

// Pool of all possible daily tasks
export const DAILY_TASKS_POOL: DailyTask[] = [
  // Plant tasks
  {
    id: 'plant_3',
    type: 'plant',
    nameCn: '種植新手',
    descriptionCn: '種植 3 株作物',
    icon: '🌱',
    requirement: 3,
    rewardXp: 30,
    rewardTokens: 5,
  },
  {
    id: 'plant_5',
    type: 'plant',
    nameCn: '勤勞農夫',
    descriptionCn: '種植 5 株作物',
    icon: '🌱',
    requirement: 5,
    rewardXp: 50,
    rewardTokens: 10,
  },
  {
    id: 'plant_10',
    type: 'plant',
    nameCn: '種田達人',
    descriptionCn: '種植 10 株作物',
    icon: '🌿',
    requirement: 10,
    rewardXp: 100,
    rewardTokens: 20,
  },

  // Harvest tasks
  {
    id: 'harvest_3',
    type: 'harvest',
    nameCn: '小有收穫',
    descriptionCn: '收成 3 株作物',
    icon: '🧺',
    requirement: 3,
    rewardXp: 30,
    rewardTokens: 5,
  },
  {
    id: 'harvest_5',
    type: 'harvest',
    nameCn: '豐收日',
    descriptionCn: '收成 5 株作物',
    icon: '🧺',
    requirement: 5,
    rewardXp: 50,
    rewardTokens: 10,
  },
  {
    id: 'harvest_10',
    type: 'harvest',
    nameCn: '滿載而歸',
    descriptionCn: '收成 10 株作物',
    icon: '🎉',
    requirement: 10,
    rewardXp: 100,
    rewardTokens: 20,
  },

  // Steal tasks
  {
    id: 'steal_1',
    type: 'steal',
    nameCn: '偷偷摸摸',
    descriptionCn: '偷取 1 株作物',
    icon: '🥷',
    requirement: 1,
    rewardXp: 20,
    rewardTokens: 5,
  },
  {
    id: 'steal_3',
    type: 'steal',
    nameCn: '菜園小偷',
    descriptionCn: '偷取 3 株作物',
    icon: '🦝',
    requirement: 3,
    rewardXp: 40,
    rewardTokens: 10,
  },

  // Earn tasks
  {
    id: 'earn_50',
    type: 'earn',
    nameCn: '賺錢小能手',
    descriptionCn: '今日賺取 50 $FARM',
    icon: '💰',
    requirement: 50,
    rewardXp: 30,
    rewardTokens: 10,
  },
  {
    id: 'earn_100',
    type: 'earn',
    nameCn: '財源廣進',
    descriptionCn: '今日賺取 100 $FARM',
    icon: '💰',
    requirement: 100,
    rewardXp: 50,
    rewardTokens: 15,
  },
  {
    id: 'earn_200',
    type: 'earn',
    nameCn: '日進斗金',
    descriptionCn: '今日賺取 200 $FARM',
    icon: '💎',
    requirement: 200,
    rewardXp: 100,
    rewardTokens: 30,
  },

  // Visit tasks
  {
    id: 'visit_1',
    type: 'visit',
    nameCn: '串門子',
    descriptionCn: '拜訪 1 位好友農場',
    icon: '👋',
    requirement: 1,
    rewardXp: 20,
    rewardTokens: 5,
  },
  {
    id: 'visit_3',
    type: 'visit',
    nameCn: '社交達人',
    descriptionCn: '拜訪 3 位好友農場',
    icon: '🤝',
    requirement: 3,
    rewardXp: 50,
    rewardTokens: 15,
  },
];

// Generate daily tasks for a user (3 random tasks)
export const generateDailyTasks = (seed: string): DailyTask[] => {
  // Use date + oderId as seed for consistent daily tasks per user
  const today = new Date().toISOString().split('T')[0];
  const seedString = `${today}-${seed}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Use hash to select 3 different tasks
  const shuffled = [...DAILY_TASKS_POOL].sort((a, b) => {
    const hashA = (hash + a.id.charCodeAt(0)) % 100;
    const hashB = (hash + b.id.charCodeAt(0)) % 100;
    return hashA - hashB;
  });

  // Ensure variety: try to get one from each type if possible
  const types = ['plant', 'harvest', 'steal', 'earn', 'visit'];
  const selected: DailyTask[] = [];

  // First, try to get one of each type
  for (const type of types) {
    if (selected.length >= 3) break;
    const tasksOfType = shuffled.filter(t => t.type === type && !selected.includes(t));
    if (tasksOfType.length > 0) {
      selected.push(tasksOfType[Math.abs(hash) % tasksOfType.length]);
    }
  }

  // If we don't have 3, fill with remaining
  while (selected.length < 3) {
    const remaining = shuffled.filter(t => !selected.includes(t));
    if (remaining.length === 0) break;
    selected.push(remaining[0]);
  }

  return selected.slice(0, 3);
};

export const getDailyTaskById = (id: string): DailyTask | undefined => {
  return DAILY_TASKS_POOL.find(t => t.id === id);
};
