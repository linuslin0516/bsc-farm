import {
  collection,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseUser, PlayerStats, LeaderboardEntry } from '../types';
import { calculateScore, getPlayerStats } from './leaderboardService';

const USERS_COLLECTION = 'users';
const AIRDROP_HISTORY_COLLECTION = 'airdropHistory';

// Check if current user is admin
export const isAdmin = (twitterUid: string | undefined): boolean => {
  if (!twitterUid) return false;
  const adminUids = (import.meta.env.VITE_ADMIN_TWITTER_UIDS || '').split(',').map((s: string) => s.trim()).filter(Boolean);
  return adminUids.includes(twitterUid);
};

// Get full leaderboard with BNB addresses for airdrop
export interface AdminLeaderboardEntry extends LeaderboardEntry {
  bnbAddress?: string;
  twitterHandle?: string;
  farmBalance: number;
  totalEarnings: number;
  totalHarvests: number;
  totalPlants: number;
  totalSteals: number;
  lastOnline: number;
  createdAt: number;
}

export const getFullLeaderboard = async (
  sortBy: 'score' | 'level' | 'harvests' | 'earnings' = 'score',
  maxResults: number = 500
): Promise<AdminLeaderboardEntry[]> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const usersSnapshot = await getDocs(usersRef);

  const entries: AdminLeaderboardEntry[] = [];

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data() as FirebaseUser;
    const oderId = userDoc.id;

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

    const score = calculateScore(userData.level || 1, stats.totalHarvests, stats.totalSteals);

    entries.push({
      oderId,
      name: userData.name || 'Unknown',
      avatarUrl: userData.avatarUrl,
      level: userData.level || 1,
      score,
      rank: 0,
      bnbAddress: userData.bnbAddress,
      twitterHandle: userData.twitterHandle,
      farmBalance: userData.farmBalance || 0,
      totalEarnings: stats.totalEarnings,
      totalHarvests: stats.totalHarvests,
      totalPlants: stats.totalPlants,
      totalSteals: stats.totalSteals,
      lastOnline: userData.lastOnline || 0,
      createdAt: userData.createdAt || 0,
    });
  }

  // Sort
  switch (sortBy) {
    case 'level':
      entries.sort((a, b) => b.level - a.level);
      break;
    case 'harvests':
      entries.sort((a, b) => b.totalHarvests - a.totalHarvests);
      break;
    case 'earnings':
      entries.sort((a, b) => b.totalEarnings - a.totalEarnings);
      break;
    case 'score':
    default:
      entries.sort((a, b) => b.score - a.score);
      break;
  }

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries.slice(0, maxResults);
};

// Get dashboard stats
export interface DashboardStats {
  totalPlayers: number;
  activePlayers24h: number;
  playersWithBnb: number;
  totalGoldCirculating: number;
  averageLevel: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const usersSnapshot = await getDocs(usersRef);

  let totalPlayers = 0;
  let activePlayers24h = 0;
  let playersWithBnb = 0;
  let totalGold = 0;
  let totalLevel = 0;
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data() as FirebaseUser;
    totalPlayers++;
    totalGold += data.farmBalance || 0;
    totalLevel += data.level || 1;

    if (data.bnbAddress) playersWithBnb++;
    if (data.lastOnline && data.lastOnline > oneDayAgo) activePlayers24h++;
  });

  return {
    totalPlayers,
    activePlayers24h,
    playersWithBnb,
    totalGoldCirculating: totalGold,
    averageLevel: totalPlayers > 0 ? Math.round((totalLevel / totalPlayers) * 10) / 10 : 0,
  };
};

// Search players
export const searchPlayers = async (
  searchQuery: string
): Promise<AdminLeaderboardEntry[]> => {
  const entries = await getFullLeaderboard('score', 1000);
  const q = searchQuery.toLowerCase();

  return entries.filter(
    (e) =>
      e.oderId.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      (e.twitterHandle && e.twitterHandle.toLowerCase().includes(q))
  );
};

// Export airdrop CSV
export const exportAirdropCSV = (
  entries: AdminLeaderboardEntry[],
  topN?: number,
  minScore?: number
): string => {
  let filtered = entries;

  if (topN) {
    filtered = filtered.slice(0, topN);
  }

  if (minScore) {
    filtered = filtered.filter((e) => e.score >= minScore);
  }

  // Only include players with BNB addresses
  const withBnb = filtered.filter((e) => e.bnbAddress);

  const header = 'Rank,Name,ID,Twitter,BNB Address,Level,Score,GOLD Balance,Total Earnings,Total Harvests';
  const rows = withBnb.map(
    (e) =>
      `${e.rank},"${e.name}",${e.oderId},${e.twitterHandle || ''},${e.bnbAddress},${e.level},${e.score},${e.farmBalance},${e.totalEarnings},${e.totalHarvests}`
  );

  return [header, ...rows].join('\n');
};

// Airdrop history
export interface AirdropRecord {
  id: string;
  date: string;
  playerCount: number;
  totalBnb: string;
  topN: number;
  minScore: number;
  createdBy: string;
  createdAt: number;
  notes?: string;
}

export const recordAirdrop = async (record: Omit<AirdropRecord, 'id' | 'createdAt'>): Promise<void> => {
  const id = `airdrop_${Date.now()}`;
  const docRef = doc(db, AIRDROP_HISTORY_COLLECTION, id);
  await setDoc(docRef, {
    ...record,
    id,
    createdAt: Date.now(),
  });
};

export const getAirdropHistory = async (): Promise<AirdropRecord[]> => {
  const ref = collection(db, AIRDROP_HISTORY_COLLECTION);
  const snapshot = await getDocs(ref);

  const records: AirdropRecord[] = [];
  snapshot.docs.forEach((doc) => {
    records.push(doc.data() as AirdropRecord);
  });

  // Sort by most recent first
  records.sort((a, b) => b.createdAt - a.createdAt);
  return records;
};
