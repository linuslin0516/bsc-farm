import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerAchievement, Achievement } from '../types';
import { ACHIEVEMENTS, getAchievementById } from '../data/achievements';

const ACHIEVEMENTS_COLLECTION = 'achievements';

// Get or create player achievement data
export const getPlayerAchievements = async (oderId: string): Promise<PlayerAchievement> => {
  const docRef = doc(db, ACHIEVEMENTS_COLLECTION, oderId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as PlayerAchievement;
  }

  // Create initial achievement data
  const initialData: PlayerAchievement = {
    oderId,
    unlockedAchievements: [],
    progress: {},
    totalHarvests: 0,
    totalPlants: 0,
    totalSteals: 0,
    totalEarnings: 0,
    consecutiveLogins: 0,
    lastLoginDate: '',
    cropsDiscovered: [],
  };

  await setDoc(docRef, initialData);
  return initialData;
};

// Update player progress and check for achievements
export const updateAchievementProgress = async (
  oderId: string,
  type: 'plant' | 'harvest' | 'steal' | 'earn' | 'login' | 'discover_crop' | 'level',
  value: number = 1,
  additionalData?: { cropId?: string; level?: number; friendCount?: number }
): Promise<{ newlyUnlocked: Achievement[]; playerData: PlayerAchievement }> => {
  const playerData = await getPlayerAchievements(oderId);
  const newlyUnlocked: Achievement[] = [];

  // Update totals based on type
  switch (type) {
    case 'plant':
      playerData.totalPlants += value;
      break;
    case 'harvest':
      playerData.totalHarvests += value;
      break;
    case 'steal':
      playerData.totalSteals += value;
      break;
    case 'earn':
      playerData.totalEarnings += value;
      break;
    case 'login':
      const today = new Date().toISOString().split('T')[0];
      if (playerData.lastLoginDate !== today) {
        // Check if yesterday
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (playerData.lastLoginDate === yesterday) {
          playerData.consecutiveLogins += 1;
        } else {
          playerData.consecutiveLogins = 1;
        }
        playerData.lastLoginDate = today;
      }
      break;
    case 'discover_crop':
      if (additionalData?.cropId && !playerData.cropsDiscovered.includes(additionalData.cropId)) {
        playerData.cropsDiscovered.push(additionalData.cropId);
      }
      break;
  }

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (playerData.unlockedAchievements.includes(achievement.id)) continue;

    let progress = 0;
    let requirementMet = false;

    // Check based on achievement category and ID
    if (achievement.id.startsWith('plant_')) {
      progress = playerData.totalPlants;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('harvest_')) {
      progress = playerData.totalHarvests;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('steal_')) {
      progress = playerData.totalSteals;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('earn_')) {
      progress = playerData.totalEarnings;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('login_')) {
      progress = playerData.consecutiveLogins;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('level_')) {
      progress = additionalData?.level || 0;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('friends_')) {
      progress = additionalData?.friendCount || 0;
      requirementMet = progress >= achievement.requirement;
    } else if (achievement.id.startsWith('collect_')) {
      progress = playerData.cropsDiscovered.length;
      // Special handling for collection achievements
      if (achievement.id === 'collect_all') {
        requirementMet = progress >= 24;
      } else if (achievement.id === 'collect_legendary') {
        // Check if any legendary crop discovered
        const legendaryIds = ['rainbow_rose', 'golden_apple', 'phoenix_flower', 'moonlight_orchid', 'cosmic_fruit'];
        requirementMet = playerData.cropsDiscovered.some(id => legendaryIds.includes(id));
      } else {
        requirementMet = progress >= achievement.requirement;
      }
    } else if (achievement.id === 'first_plant') {
      progress = playerData.totalPlants;
      requirementMet = progress >= 1;
    }

    // Update progress
    playerData.progress[achievement.id] = progress;

    // Check if newly unlocked
    if (requirementMet) {
      playerData.unlockedAchievements.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  // Save to Firebase
  const docRef = doc(db, ACHIEVEMENTS_COLLECTION, oderId);
  await updateDoc(docRef, {
    ...playerData,
    updatedAt: serverTimestamp(),
  });

  return { newlyUnlocked, playerData };
};

// Get all achievements with player progress
export const getAchievementsWithProgress = async (oderId: string): Promise<{
  achievement: Achievement;
  progress: number;
  unlocked: boolean;
}[]> => {
  const playerData = await getPlayerAchievements(oderId);

  return ACHIEVEMENTS.map(achievement => ({
    achievement,
    progress: playerData.progress[achievement.id] || 0,
    unlocked: playerData.unlockedAchievements.includes(achievement.id),
  }));
};

// Claim achievement reward (to prevent double claiming)
export const claimAchievementReward = async (
  oderId: string,
  achievementId: string
): Promise<{ xp: number; tokens: number } | null> => {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return null;

  const playerData = await getPlayerAchievements(oderId);
  if (!playerData.unlockedAchievements.includes(achievementId)) return null;

  // Check if already claimed (we could add a claimedAchievements array)
  // For now, rewards are auto-claimed on unlock
  return {
    xp: achievement.rewardXp,
    tokens: achievement.rewardTokens,
  };
};
