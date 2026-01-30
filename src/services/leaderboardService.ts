import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { LeaderboardEntry, PlayerStats } from '../types';

const USERS_COLLECTION = 'users';
const STATS_COLLECTION = 'playerStats';
const LEADERBOARD_CACHE_COLLECTION = 'leaderboardCache';

// Get or initialize player stats
export const getPlayerStats = async (oderId: string): Promise<PlayerStats> => {
  const docRef = doc(db, STATS_COLLECTION, oderId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as PlayerStats;
  }

  // Create initial stats
  const initialStats: PlayerStats = {
    oderId,
    totalHarvests: 0,
    totalPlants: 0,
    totalSteals: 0,
    totalEarnings: 0,
    achievementCount: 0,
    score: 0,
  };

  await setDoc(docRef, initialStats);
  return initialStats;
};

// Calculate score: (level * 100) + (harvests * 10) + (steals * 5)
export const calculateScore = (level: number, harvests: number, steals: number): number => {
  return (level * 100) + (harvests * 10) + (steals * 5);
};

// Update player stats
export const updatePlayerStats = async (
  oderId: string,
  updates: Partial<PlayerStats>,
  level?: number
): Promise<PlayerStats> => {
  const currentStats = await getPlayerStats(oderId);

  // Merge updates
  const newStats: PlayerStats = {
    ...currentStats,
    ...updates,
  };

  // Recalculate score if level provided
  if (level !== undefined) {
    newStats.score = calculateScore(level, newStats.totalHarvests, newStats.totalSteals);
  }

  // Save to Firebase (use setDoc with merge to handle both create and update)
  const docRef = doc(db, STATS_COLLECTION, oderId);
  await setDoc(docRef, {
    ...newStats,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return newStats;
};

// Increment stats
export const incrementStats = async (
  oderId: string,
  type: 'harvest' | 'plant' | 'steal' | 'earn' | 'achievement',
  value: number = 1,
  level?: number
): Promise<void> => {
  try {
    console.log(`📊 [Leaderboard] Incrementing stats for ${oderId}:`, { type, value, level });

    const stats = await getPlayerStats(oderId);
    console.log(`📊 [Leaderboard] Current stats:`, stats);

    switch (type) {
      case 'harvest':
        stats.totalHarvests += value;
        break;
      case 'plant':
        stats.totalPlants += value;
        break;
      case 'steal':
        stats.totalSteals += value;
        break;
      case 'earn':
        stats.totalEarnings += value;
        break;
      case 'achievement':
        stats.achievementCount += value;
        break;
    }

    console.log(`📊 [Leaderboard] Updated stats:`, stats);
    await updatePlayerStats(oderId, stats, level);
    console.log(`📊 [Leaderboard] Successfully saved stats to Firebase`);
  } catch (error) {
    console.error(`❌ [Leaderboard] Failed to increment stats:`, error);
    throw error;
  }
};

// Get leaderboard by score
export const getLeaderboard = async (
  type: 'score' | 'level' | 'harvests' = 'score',
  maxResults: number = 50
): Promise<LeaderboardEntry[]> => {
  // Get all users
  const usersRef = collection(db, USERS_COLLECTION);
  const usersSnapshot = await getDocs(usersRef);

  // Get stats for all users
  const entries: LeaderboardEntry[] = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const oderId = userDoc.id;

    // Get player stats
    let stats: PlayerStats;
    try {
      stats = await getPlayerStats(oderId);
    } catch {
      stats = {
        oderId,
        totalHarvests: 0,
        totalPlants: 0,
        totalSteals: 0,
        totalEarnings: 0,
        achievementCount: 0,
        score: 0,
      };
    }

    // Calculate score on the fly
    const score = calculateScore(userData.level || 1, stats.totalHarvests, stats.totalSteals);

    let sortValue: number;
    switch (type) {
      case 'level':
        sortValue = userData.level || 1;
        break;
      case 'harvests':
        sortValue = stats.totalHarvests;
        break;
      case 'score':
      default:
        sortValue = score;
        break;
    }

    entries.push({
      oderId,
      name: userData.name || 'Unknown',
      avatarUrl: userData.avatarUrl,
      level: userData.level || 1,
      score: sortValue,
      rank: 0, // Will be set after sorting
    });
  }

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries.slice(0, maxResults);
};

// Get player's rank
export const getPlayerRank = async (
  oderId: string,
  type: 'score' | 'level' | 'harvests' = 'score'
): Promise<{ rank: number; total: number; score: number }> => {
  const leaderboard = await getLeaderboard(type, 1000);
  const playerEntry = leaderboard.find(e => e.oderId === oderId);

  if (!playerEntry) {
    return {
      rank: leaderboard.length + 1,
      total: leaderboard.length + 1,
      score: 0,
    };
  }

  return {
    rank: playerEntry.rank,
    total: leaderboard.length,
    score: playerEntry.score,
  };
};

// Get top players (cached version for performance)
export const getTopPlayers = async (count: number = 10): Promise<LeaderboardEntry[]> => {
  // Try to get from cache first
  const cacheRef = doc(db, LEADERBOARD_CACHE_COLLECTION, 'top_players');
  const cacheSnap = await getDoc(cacheRef);

  if (cacheSnap.exists()) {
    const cacheData = cacheSnap.data();
    const cacheAge = Date.now() - (cacheData.updatedAt?.toMillis() || 0);

    // Cache valid for 5 minutes
    if (cacheAge < 5 * 60 * 1000 && cacheData.entries) {
      return (cacheData.entries as LeaderboardEntry[]).slice(0, count);
    }
  }

  // Fetch fresh data
  const entries = await getLeaderboard('score', count);

  // Update cache
  await setDoc(cacheRef, {
    entries,
    updatedAt: serverTimestamp(),
  });

  return entries;
};
