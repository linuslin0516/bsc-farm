import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { StealRecord, Position } from '../types';
import { getUserById, updateBalance, updateUser } from './userService';
import { getCropById } from '../data/crops';

const STEAL_RECORDS_COLLECTION = 'steal_records';
const STEAL_COOLDOWN = 30 * 60 * 1000; // 30 minutes cooldown per friend
const STEAL_PERCENTAGE_MIN = 0.1; // 10%
const STEAL_PERCENTAGE_MAX = 0.2; // 20%

// Generate steal record ID
const getStealRecordId = (
  oderId: string,
  targetId: string,
  position: Position
): string => {
  return `${oderId}_${targetId}_${position.x}_${position.y}`;
};

// Check if can steal from a specific cell
export const canStealFromCell = async (
  oderId: string,
  targetId: string,
  position: Position
): Promise<{ canSteal: boolean; reason?: string }> => {
  const recordId = getStealRecordId(oderId, targetId, position);
  const recordDoc = await getDoc(doc(db, STEAL_RECORDS_COLLECTION, recordId));

  if (recordDoc.exists()) {
    return { canSteal: false, reason: '已經偷過這塊地了' };
  }

  return { canSteal: true };
};

// Check cooldown for stealing from a friend
export const checkStealCooldown = async (
  oderId: string,
  targetId: string
): Promise<{ canSteal: boolean; cooldownRemaining?: number }> => {
  const recordsRef = collection(db, STEAL_RECORDS_COLLECTION);
  const q = query(
    recordsRef,
    where('oderId', '==', oderId),
    where('targetId', '==', targetId)
  );

  const snapshot = await getDocs(q);
  const now = Date.now();
  let latestSteal = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const stolenAt = data.stolenAt instanceof Timestamp
      ? data.stolenAt.toMillis()
      : data.stolenAt;
    if (stolenAt > latestSteal) {
      latestSteal = stolenAt;
    }
  });

  if (latestSteal > 0) {
    const timeSinceSteal = now - latestSteal;
    if (timeSinceSteal < STEAL_COOLDOWN) {
      return {
        canSteal: false,
        cooldownRemaining: STEAL_COOLDOWN - timeSinceSteal,
      };
    }
  }

  return { canSteal: true };
};

// Steal a crop
export const stealCrop = async (
  oderId: string,
  targetId: string,
  position: Position
): Promise<{ success: boolean; amount?: number; message: string }> => {
  console.log(`🥷 [StealService] Stealing from target ${targetId} at position`, position);

  // Get target's farm
  const targetUser = await getUserById(targetId);
  if (!targetUser) {
    console.error(`❌ [StealService] Target user not found: ${targetId}`);
    return { success: false, message: '找不到目標用戶' };
  }

  console.log(`🥷 [StealService] Target user found:`, {
    name: targetUser.name,
    farmCellsCount: targetUser.farmCells.length
  });

  // Find the cell
  const cell = targetUser.farmCells.find(
    (c) => c.position.x === position.x && c.position.y === position.y
  );

  if (!cell || !cell.plantedCrop) {
    return { success: false, message: '這塊地沒有作物' };
  }

  // Check if crop is mature
  const crop = getCropById(cell.plantedCrop.cropId);
  if (!crop) {
    return { success: false, message: '找不到作物資料' };
  }

  const elapsed = (Date.now() - cell.plantedCrop.plantedAt) / 1000;
  if (elapsed < crop.growthTime) {
    return { success: false, message: '作物還沒成熟，不能偷！' };
  }

  // Check if already stolen from this cell
  const { canSteal, reason } = await canStealFromCell(oderId, targetId, position);
  if (!canSteal) {
    return { success: false, message: reason || '無法偷取' };
  }

  // Check cooldown
  const cooldownCheck = await checkStealCooldown(oderId, targetId);
  if (!cooldownCheck.canSteal) {
    const mins = Math.ceil((cooldownCheck.cooldownRemaining || 0) / 60000);
    return { success: false, message: `需要等待 ${mins} 分鐘才能再偷這位好友` };
  }

  // Calculate stolen amount (10-20% of crop value)
  const stealPercentage =
    STEAL_PERCENTAGE_MIN +
    Math.random() * (STEAL_PERCENTAGE_MAX - STEAL_PERCENTAGE_MIN);
  const stolenAmount = Math.floor(crop.sellPrice * stealPercentage);

  // Get thief's current balance
  const thief = await getUserById(oderId);
  if (!thief) {
    return { success: false, message: '找不到用戶資料' };
  }

  // Update thief's balance
  await updateBalance(oderId, thief.farmBalance + stolenAmount);

  // Remove crop from victim's farm (remove plantedCrop field completely)
  const updatedFarmCells = targetUser.farmCells.map((c) => {
    if (c.position.x === position.x && c.position.y === position.y) {
      const { plantedCrop, ...cellWithoutCrop } = c;
      return cellWithoutCrop;
    }
    return c;
  });

  console.log(`🥷 [StealService] Removing crop from victim's farm at position`, position);

  // Update victim's farm in Firebase using updateUser to handle undefined cleaning
  await updateUser(targetId, {
    farmCells: updatedFarmCells,
  });

  console.log(`✅ [StealService] Successfully removed crop from victim's farm`);

  // Record the steal
  const stealRecord: StealRecord = {
    oderId: oderId,
    targetId: targetId,
    position,
    cropId: cell.plantedCrop.cropId,
    amount: stolenAmount,
    stolenAt: Date.now(),
  };

  const recordId = getStealRecordId(oderId, targetId, position);
  await setDoc(doc(db, STEAL_RECORDS_COLLECTION, recordId), stealRecord);

  console.log(`✅ [StealService] Steal successful! Crop: ${crop.nameCn}, Amount: ${stolenAmount}`);

  return {
    success: true,
    amount: stolenAmount,
    message: `成功偷到 ${crop.nameCn}！獲得 ${stolenAmount} $FARM！`,
  };
};

// Get all cells that have been stolen from for a target
export const getStolenCellsForTarget = async (
  oderId: string,
  targetId: string
): Promise<Position[]> => {
  const recordsRef = collection(db, STEAL_RECORDS_COLLECTION);
  const q = query(
    recordsRef,
    where('oderId', '==', oderId),
    where('targetId', '==', targetId)
  );

  const snapshot = await getDocs(q);
  const stolenPositions: Position[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    stolenPositions.push(data.position);
  });

  return stolenPositions;
};

// Calculate reduced harvest value after being stolen
export const getHarvestValueAfterSteals = async (
  oderId: string,
  position: Position,
  originalValue: number
): Promise<number> => {
  const recordsRef = collection(db, STEAL_RECORDS_COLLECTION);
  const q = query(
    recordsRef,
    where('targetId', '==', oderId)
  );

  const snapshot = await getDocs(q);
  let totalStolen = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.position.x === position.x && data.position.y === position.y) {
      totalStolen += data.amount;
    }
  });

  return Math.max(0, originalValue - totalStolen);
};
