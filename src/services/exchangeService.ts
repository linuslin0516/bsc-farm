import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ExchangeRate, ExchangeTransaction, UserExchangeData } from '../types';
import { transferFarm, getFarmBalance, FARM_TOKEN_ADDRESS } from './web3Service';

const EXCHANGE_COLLECTION = 'exchange';
const EXCHANGE_RATE_DOC = 'current_rate';
const USER_EXCHANGE_COLLECTION = 'user_exchange';
const TRANSACTIONS_COLLECTION = 'exchange_transactions';

// Treasury wallet address (receives FARM from users, sends FARM to users)
// This should be a hot wallet controlled by your backend
// Note: .trim() removes any whitespace/newlines from env variables
export const TREASURY_WALLET = (import.meta.env.VITE_TREASURY_WALLET || '').trim();

// Default exchange rate configuration
const DEFAULT_EXCHANGE_RATE: ExchangeRate = {
  goldPerFarm: 10000,        // 1 FARM = 10,000 GOLD
  farmPerGold: 0.0001,       // 1 GOLD = 0.0001 FARM
  exchangeFee: 0.05,         // 5% fee
  lastUpdated: Date.now(),
  dailyExchangeLimit: 100,   // Max 100 FARM per day
};

/**
 * Get current exchange rate
 */
export const getExchangeRate = async (): Promise<ExchangeRate> => {
  try {
    const docRef = doc(db, EXCHANGE_COLLECTION, EXCHANGE_RATE_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ExchangeRate;
    }

    // Initialize with default rate
    await setDoc(docRef, {
      ...DEFAULT_EXCHANGE_RATE,
      updatedAt: serverTimestamp(),
    });

    return DEFAULT_EXCHANGE_RATE;
  } catch (error) {
    console.error('Failed to get exchange rate:', error);
    return DEFAULT_EXCHANGE_RATE;
  }
};

/**
 * Get user's exchange data
 */
export const getUserExchangeData = async (oderId: string): Promise<UserExchangeData> => {
  try {
    const docRef = doc(db, USER_EXCHANGE_COLLECTION, oderId);
    const docSnap = await getDoc(docRef);

    const today = new Date().toISOString().split('T')[0];

    if (docSnap.exists()) {
      const data = docSnap.data() as UserExchangeData;

      // Reset daily limit if it's a new day
      if (data.lastExchangeDate !== today) {
        const updatedData = {
          ...data,
          dailyExchanged: 0,
          lastExchangeDate: today,
        };
        await updateDoc(docRef, {
          dailyExchanged: 0,
          lastExchangeDate: today,
        });
        return updatedData;
      }

      return data;
    }

    // Initialize new user
    const newData: UserExchangeData = {
      oderId,
      dailyExchanged: 0,
      lastExchangeDate: today,
      totalGoldExchanged: 0,
      totalFarmExchanged: '0',
      pendingTransactions: [],
    };

    await setDoc(docRef, {
      ...newData,
      createdAt: serverTimestamp(),
    });

    return newData;
  } catch (error) {
    console.error('Failed to get user exchange data:', error);
    throw error;
  }
};

/**
 * Calculate GOLD to FARM conversion
 */
export const calculateGoldToFarm = async (
  goldAmount: number
): Promise<{
  farmAmount: number;
  fee: number;
  netFarmAmount: number;
  rate: ExchangeRate;
}> => {
  const rate = await getExchangeRate();

  const grossFarm = goldAmount * rate.farmPerGold;
  const fee = grossFarm * rate.exchangeFee;
  const netFarm = grossFarm - fee;

  return {
    farmAmount: grossFarm,
    fee,
    netFarmAmount: netFarm,
    rate,
  };
};

/**
 * Calculate FARM to GOLD conversion
 */
export const calculateFarmToGold = async (
  farmAmount: number
): Promise<{
  goldAmount: number;
  fee: number;
  netGoldAmount: number;
  rate: ExchangeRate;
}> => {
  const rate = await getExchangeRate();

  const grossGold = farmAmount * rate.goldPerFarm;
  const fee = grossGold * rate.exchangeFee;
  const netGold = grossGold - fee;

  return {
    goldAmount: grossGold,
    fee,
    netGoldAmount: netGold,
    rate,
  };
};

/**
 * Check if user can exchange (daily limit check)
 */
export const canExchange = async (
  oderId: string,
  farmAmount: number
): Promise<{ canExchange: boolean; reason?: string; remaining?: number }> => {
  const userData = await getUserExchangeData(oderId);
  const rate = await getExchangeRate();

  const remaining = rate.dailyExchangeLimit - userData.dailyExchanged;

  if (farmAmount > remaining) {
    return {
      canExchange: false,
      reason: `每日兌換上限為 ${rate.dailyExchangeLimit} FARM，今日剩餘 ${remaining.toFixed(2)} FARM`,
      remaining,
    };
  }

  return { canExchange: true, remaining };
};

/**
 * Exchange GOLD for FARM (withdraw to wallet)
 * User sends GOLD, receives FARM from treasury
 */
export const exchangeGoldForFarm = async (
  oderId: string,
  _walletAddress: string, // Used for future on-chain verification
  goldAmount: number
): Promise<ExchangeTransaction> => {
  // Validate
  if (goldAmount < 1000) {
    throw new Error('最小兌換金額為 1,000 GOLD');
  }

  const { netFarmAmount } = await calculateGoldToFarm(goldAmount);

  // Check daily limit
  const limitCheck = await canExchange(oderId, netFarmAmount);
  if (!limitCheck.canExchange) {
    throw new Error(limitCheck.reason);
  }

  // Create pending transaction
  const transaction: Omit<ExchangeTransaction, 'id'> = {
    oderId,
    type: 'gold_to_farm',
    goldAmount,
    farmAmount: netFarmAmount.toString(),
    status: 'pending',
    createdAt: Date.now(),
  };

  // Save transaction to Firestore
  const txRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...transaction,
    createdAt: serverTimestamp(),
  });

  const txId = txRef.id;

  try {
    // In production, this would trigger a backend service to send FARM from treasury
    // For now, we'll just record the transaction as pending
    // The actual transfer should be done by a secure backend service

    // Update user's exchange data
    const userDocRef = doc(db, USER_EXCHANGE_COLLECTION, oderId);
    const userData = await getUserExchangeData(oderId);

    await updateDoc(userDocRef, {
      dailyExchanged: userData.dailyExchanged + netFarmAmount,
      totalGoldExchanged: userData.totalGoldExchanged + goldAmount,
      lastExchangeDate: new Date().toISOString().split('T')[0],
    });

    // Update transaction status
    // In production, mark as 'pending' until backend confirms transfer
    await updateDoc(doc(db, TRANSACTIONS_COLLECTION, txId), {
      status: 'pending',
      // In production, a backend job would update this to 'completed' with txHash
    });

    return {
      id: txId,
      ...transaction,
      status: 'pending',
    };
  } catch (error) {
    // Mark transaction as failed
    await updateDoc(doc(db, TRANSACTIONS_COLLECTION, txId), {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

/**
 * Exchange FARM for GOLD (deposit from wallet)
 * User sends FARM to treasury, receives GOLD in-game
 */
export const exchangeFarmForGold = async (
  oderId: string,
  walletAddress: string,
  farmAmount: number
): Promise<ExchangeTransaction> => {
  // Validate
  if (farmAmount < 0.1) {
    throw new Error('最小兌換金額為 0.1 FARM');
  }

  if (!TREASURY_WALLET) {
    throw new Error('Treasury wallet not configured');
  }

  if (!FARM_TOKEN_ADDRESS) {
    throw new Error('FARM token not configured');
  }

  const { netGoldAmount } = await calculateFarmToGold(farmAmount);

  // Check user's FARM balance
  const balance = await getFarmBalance(walletAddress);
  if (parseFloat(balance) < farmAmount) {
    throw new Error(`FARM 餘額不足。當前餘額: ${parseFloat(balance).toFixed(4)} FARM`);
  }

  // Create pending transaction
  const transaction: Omit<ExchangeTransaction, 'id'> = {
    oderId,
    type: 'farm_to_gold',
    goldAmount: Math.floor(netGoldAmount),
    farmAmount: farmAmount.toString(),
    status: 'pending',
    createdAt: Date.now(),
  };

  // Save transaction
  const txRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...transaction,
    walletAddress,
    createdAt: serverTimestamp(),
  });

  const txId = txRef.id;

  try {
    // Transfer FARM from user to treasury
    const txHash = await transferFarm(TREASURY_WALLET, farmAmount.toString());

    if (!txHash) {
      throw new Error('Transfer failed');
    }

    // Update transaction with success
    await updateDoc(doc(db, TRANSACTIONS_COLLECTION, txId), {
      status: 'completed',
      txHash,
      completedAt: serverTimestamp(),
    });

    // Update user's exchange data
    const userDocRef = doc(db, USER_EXCHANGE_COLLECTION, oderId);
    const userData = await getUserExchangeData(oderId);

    const currentTotal = parseFloat(userData.totalFarmExchanged) || 0;
    await updateDoc(userDocRef, {
      totalFarmExchanged: (currentTotal + farmAmount).toString(),
    });

    return {
      id: txId,
      ...transaction,
      status: 'completed',
      txHash,
      completedAt: Date.now(),
    };
  } catch (error) {
    // Mark transaction as failed
    await updateDoc(doc(db, TRANSACTIONS_COLLECTION, txId), {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

/**
 * Get user's transaction history
 */
export const getTransactionHistory = async (
  oderId: string,
  limitCount: number = 20
): Promise<ExchangeTransaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('oderId', '==', oderId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ExchangeTransaction[];
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    return [];
  }
};

/**
 * Update exchange rate (admin only - should be called by backend)
 */
export const updateExchangeRate = async (
  newRate: Partial<ExchangeRate>
): Promise<void> => {
  const docRef = doc(db, EXCHANGE_COLLECTION, EXCHANGE_RATE_DOC);
  await updateDoc(docRef, {
    ...newRate,
    lastUpdated: Date.now(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Format GOLD amount for display
 */
export const formatGold = (amount: number): string => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return amount.toLocaleString();
};

/**
 * Format FARM amount for display
 */
export const formatFarm = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(4);
};
