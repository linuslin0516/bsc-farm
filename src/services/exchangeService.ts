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
const WITHDRAWAL_REQUESTS_COLLECTION = 'withdrawal_requests';

// Treasury wallet address (receives FARM from users, sends FARM to users)
// This should be a hot wallet controlled by your backend
// Note: .trim() removes any whitespace/newlines from env variables
export const TREASURY_WALLET = (import.meta.env.VITE_TREASURY_WALLET || '').trim();

// Withdrawal API configuration
const WITHDRAWAL_API_URL = '/api/withdraw';

// Default exchange rate configuration
// 目標：100,000 FARM = 100 GOLD
const DEFAULT_EXCHANGE_RATE: ExchangeRate = {
  goldPerFarm: 0.001,        // 1 FARM = 0.001 GOLD (100,000 FARM = 100 GOLD)
  farmPerGold: 1000,         // 1 GOLD = 1,000 FARM
  exchangeFee: 0.05,         // 5% fee
  lastUpdated: Date.now(),
  dailyExchangeLimit: 999999999,   // Essentially unlimited
};

// Treasury health thresholds (in FARM tokens)
const TREASURY_THRESHOLDS = {
  LOW: 1000,      // Below this, rate gets worse for withdrawals
  TARGET: 5000,   // Ideal treasury balance
  HIGH: 10000,    // Above this, rate gets better for deposits
};

// Rate adjustment factors
const RATE_ADJUSTMENTS = {
  MIN_MULTIPLIER: 0.5,   // Worst rate (50% of base)
  MAX_MULTIPLIER: 1.2,   // Best rate (120% of base)
};

/**
 * Get treasury FARM balance
 */
export const getTreasuryBalance = async (): Promise<number> => {
  try {
    if (!TREASURY_WALLET) return 0;
    const balance = await getFarmBalance(TREASURY_WALLET);
    return parseFloat(balance) || 0;
  } catch (error) {
    console.error('Failed to get treasury balance:', error);
    return 0;
  }
};

/**
 * Calculate dynamic rate multiplier based on treasury health
 * Returns a multiplier that adjusts the exchange rate
 */
export const calculateDynamicRateMultiplier = (treasuryBalance: number, isWithdrawal: boolean): number => {
  // If withdrawing (GOLD → FARM), lower treasury = worse rate
  // If depositing (FARM → GOLD), higher treasury = better rate

  if (isWithdrawal) {
    // GOLD → FARM: user wants to take FARM from treasury
    if (treasuryBalance <= TREASURY_THRESHOLDS.LOW) {
      // Treasury critically low - worst rate
      return RATE_ADJUSTMENTS.MIN_MULTIPLIER;
    } else if (treasuryBalance >= TREASURY_THRESHOLDS.TARGET) {
      // Treasury healthy - normal rate
      return 1.0;
    } else {
      // Linear interpolation between LOW and TARGET
      const ratio = (treasuryBalance - TREASURY_THRESHOLDS.LOW) /
                   (TREASURY_THRESHOLDS.TARGET - TREASURY_THRESHOLDS.LOW);
      return RATE_ADJUSTMENTS.MIN_MULTIPLIER + ratio * (1.0 - RATE_ADJUSTMENTS.MIN_MULTIPLIER);
    }
  } else {
    // FARM → GOLD: user is adding FARM to treasury
    if (treasuryBalance >= TREASURY_THRESHOLDS.HIGH) {
      // Treasury already full - normal rate
      return 1.0;
    } else if (treasuryBalance <= TREASURY_THRESHOLDS.LOW) {
      // Treasury low - best rate to encourage deposits
      return RATE_ADJUSTMENTS.MAX_MULTIPLIER;
    } else {
      // Linear interpolation between LOW and HIGH
      const ratio = (treasuryBalance - TREASURY_THRESHOLDS.LOW) /
                   (TREASURY_THRESHOLDS.HIGH - TREASURY_THRESHOLDS.LOW);
      return RATE_ADJUSTMENTS.MAX_MULTIPLIER - ratio * (RATE_ADJUSTMENTS.MAX_MULTIPLIER - 1.0);
    }
  }
};

/**
 * Get current exchange rate
 */
export const getExchangeRate = async (): Promise<ExchangeRate> => {
  try {
    const docRef = doc(db, EXCHANGE_COLLECTION, EXCHANGE_RATE_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as ExchangeRate;

      // Auto-update if exchange rate is outdated
      // 新匯率：1 FARM = 0.001 GOLD (100,000 FARM = 100 GOLD)
      // 舊匯率可能是 goldPerFarm > 0.01 或其他錯誤值
      const needsUpdate =
        data.dailyExchangeLimit === 100 ||
        data.goldPerFarm !== DEFAULT_EXCHANGE_RATE.goldPerFarm ||
        data.farmPerGold !== DEFAULT_EXCHANGE_RATE.farmPerGold;

      if (needsUpdate) {
        console.log('🔄 Auto-updating exchange rate to:', DEFAULT_EXCHANGE_RATE);
        await updateDoc(docRef, {
          goldPerFarm: DEFAULT_EXCHANGE_RATE.goldPerFarm,
          farmPerGold: DEFAULT_EXCHANGE_RATE.farmPerGold,
          dailyExchangeLimit: DEFAULT_EXCHANGE_RATE.dailyExchangeLimit,
          exchangeFee: DEFAULT_EXCHANGE_RATE.exchangeFee,
          lastUpdated: Date.now(),
          updatedAt: serverTimestamp(),
        });
        return DEFAULT_EXCHANGE_RATE;
      }

      return data;
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
 * Calculate GOLD to FARM conversion (with dynamic rate)
 */
export const calculateGoldToFarm = async (
  goldAmount: number
): Promise<{
  farmAmount: number;
  fee: number;
  netFarmAmount: number;
  rate: ExchangeRate;
  rateMultiplier: number;
}> => {
  const rate = await getExchangeRate();
  const treasuryBalance = await getTreasuryBalance();

  // Get dynamic rate multiplier (withdrawal mode)
  const rateMultiplier = calculateDynamicRateMultiplier(treasuryBalance, true);

  // Apply multiplier to farmPerGold (lower multiplier = less FARM per GOLD)
  const adjustedFarmPerGold = rate.farmPerGold * rateMultiplier;

  const grossFarm = goldAmount * adjustedFarmPerGold;
  const fee = grossFarm * rate.exchangeFee;
  const netFarm = grossFarm - fee;

  return {
    farmAmount: grossFarm,
    fee,
    netFarmAmount: netFarm,
    rate,
    rateMultiplier,
  };
};

/**
 * Calculate FARM to GOLD conversion (with dynamic rate)
 */
export const calculateFarmToGold = async (
  farmAmount: number
): Promise<{
  goldAmount: number;
  fee: number;
  netGoldAmount: number;
  rate: ExchangeRate;
  rateMultiplier: number;
}> => {
  const rate = await getExchangeRate();
  const treasuryBalance = await getTreasuryBalance();

  // Get dynamic rate multiplier (deposit mode)
  const rateMultiplier = calculateDynamicRateMultiplier(treasuryBalance, false);

  // Apply multiplier to goldPerFarm (higher multiplier = more GOLD per FARM)
  const adjustedGoldPerFarm = rate.goldPerFarm * rateMultiplier;

  const grossGold = farmAmount * adjustedGoldPerFarm;
  const fee = grossGold * rate.exchangeFee;
  const netGold = grossGold - fee;

  return {
    goldAmount: grossGold,
    fee,
    netGoldAmount: netGold,
    rate,
    rateMultiplier,
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
 *
 * Flow:
 * 1. User requests withdrawal (frontend)
 * 2. Create withdrawal request in Firestore
 * 3. Firebase Cloud Function picks up the request
 * 4. Function sends FARM from treasury to user's wallet
 * 5. Function updates request status to 'completed'
 */
export const exchangeGoldForFarm = async (
  oderId: string,
  walletAddress: string,
  goldAmount: number
): Promise<ExchangeTransaction> => {
  // Validate
  if (goldAmount < 100) {
    throw new Error('最小兌換金額為 100 GOLD');
  }

  if (!walletAddress) {
    throw new Error('請先連接錢包');
  }

  if (!FARM_TOKEN_ADDRESS) {
    throw new Error('FARM token not configured');
  }

  const { netFarmAmount } = await calculateGoldToFarm(goldAmount);

  // Check daily limit
  const limitCheck = await canExchange(oderId, netFarmAmount);
  if (!limitCheck.canExchange) {
    throw new Error(limitCheck.reason);
  }

  // Create transaction record
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
    walletAddress,
    createdAt: serverTimestamp(),
  });

  const txId = txRef.id;

  try {
    // Create withdrawal request for backend to process
    const withdrawalRef = await addDoc(collection(db, WITHDRAWAL_REQUESTS_COLLECTION), {
      userId: oderId,
      walletAddress: walletAddress,
      farmAmount: netFarmAmount,
      goldAmount: goldAmount,
      tokenAddress: FARM_TOKEN_ADDRESS,
      transactionId: txId,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    console.log('🌾 [Withdrawal] Request created:', withdrawalRef.id);

    // Call the withdrawal API to process immediately
    let txHash: string | undefined;
    let apiSuccess = false;
    try {
      console.log('🌾 [Withdrawal] Calling withdrawal API...');
      const apiResponse = await fetch(WITHDRAWAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: withdrawalRef.id,
          // Include data for verification (API will verify against Firestore)
          userId: oderId,
          walletAddress: walletAddress,
        }),
      });

      const result = await apiResponse.json();

      if (result.success) {
        console.log('🌾 [Withdrawal] Success! TxHash:', result.txHash);
        txHash = result.txHash;
        apiSuccess = true;
      } else {
        console.warn('🌾 [Withdrawal] API returned error:', result.error);
      }
    } catch (apiError) {
      console.warn('🌾 [Withdrawal] API call failed, will be processed later:', apiError);
      // Don't throw - the request is saved and can be processed later
    }

    // Update user's exchange data
    const userDocRef = doc(db, USER_EXCHANGE_COLLECTION, oderId);
    const userData = await getUserExchangeData(oderId);

    await updateDoc(userDocRef, {
      dailyExchanged: userData.dailyExchanged + netFarmAmount,
      totalGoldExchanged: userData.totalGoldExchanged + goldAmount,
      lastExchangeDate: new Date().toISOString().split('T')[0],
    });

    return {
      id: txId,
      ...transaction,
      status: apiSuccess ? 'completed' : 'pending',
      txHash,
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
  // Validate - 最小 100,000 FARM = 2 GOLD (扣費前)
  if (farmAmount < 100000) {
    throw new Error('最小兌換金額為 100,000 FARM');
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
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  if (num < 0.0001) return '< 0.0001';
  return num.toLocaleString();
};
