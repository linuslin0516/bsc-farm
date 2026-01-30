import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseUser, FarmCell } from '../types';

const USERS_COLLECTION = 'users';

// Generate a unique 6-digit user ID
export const generateUserId = async (): Promise<string> => {
  let oderId = '';
  let exists = true;

  while (exists) {
    // Generate random 6-digit number
    oderId = Math.floor(100000 + Math.random() * 900000).toString();
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, oderId));
    exists = userDoc.exists();
  }

  return oderId;
};

// Create a new user
export const createUser = async (
  oderId: string,
  name: string,
  landSize: number,
  initialBalance: number,
  walletAddress?: string,
  twitterUid?: string,
  twitterHandle?: string,
  avatarUrl?: string
): Promise<FirebaseUser> => {
  const userData: FirebaseUser = {
    oderId,
    walletAddress: walletAddress || '',
    twitterUid,
    twitterHandle,
    avatarUrl,
    name,
    level: 1,
    experience: 0,
    landSize: landSize as 3 | 4 | 5 | 6,
    farmCells: createInitialFarmCells(landSize),
    farmBalance: initialBalance,
    createdAt: Date.now(),
    lastOnline: Date.now(),
  };

  // Build Firestore data object, excluding undefined values
  const firestoreData: Record<string, unknown> = {
    oderId,
    name,
    level: 1,
    experience: 0,
    landSize: landSize as 3 | 4 | 5 | 6,
    farmCells: createInitialFarmCells(landSize),
    farmBalance: initialBalance,
    createdAt: serverTimestamp(),
    lastOnline: serverTimestamp(),
  };

  // Only add optional fields if they exist
  if (walletAddress) {
    firestoreData.walletAddress = walletAddress;
  }
  if (twitterUid) {
    firestoreData.twitterUid = twitterUid;
  }
  if (twitterHandle) {
    firestoreData.twitterHandle = twitterHandle;
  }
  if (avatarUrl) {
    firestoreData.avatarUrl = avatarUrl;
  }

  await setDoc(doc(db, USERS_COLLECTION, oderId), firestoreData);

  return userData;
};

// Get user by ID
export const getUserById = async (oderId: string): Promise<FirebaseUser | null> => {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, oderId));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    ...data,
    oderId,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
    lastOnline: data.lastOnline instanceof Timestamp ? data.lastOnline.toMillis() : data.lastOnline,
  } as FirebaseUser;
};

// Get user by wallet address
export const getUserByWallet = async (walletAddress: string): Promise<FirebaseUser | null> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('walletAddress', '==', walletAddress));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    ...data,
    oderId: docSnap.id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
    lastOnline: data.lastOnline instanceof Timestamp ? data.lastOnline.toMillis() : data.lastOnline,
  } as FirebaseUser;
};

// Helper: Clean undefined values from object (Firestore doesn't accept undefined)
const cleanUndefined = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned;
  }

  return obj;
};

// Update user data
export const updateUser = async (
  oderId: string,
  updates: Partial<FirebaseUser>
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, oderId);

  // Clean undefined values before sending to Firestore
  const cleanedUpdates = cleanUndefined({
    ...updates,
    lastOnline: serverTimestamp(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(userRef, cleanedUpdates as any);
};

// Update user's farm cells
export const updateFarmCells = async (
  oderId: string,
  farmCells: FarmCell[]
): Promise<void> => {
  await updateUser(oderId, { farmCells });
};

// Update user's balance
export const updateBalance = async (
  oderId: string,
  newBalance: number
): Promise<void> => {
  await updateUser(oderId, { farmBalance: newBalance });
};

// Update last online timestamp
export const updateLastOnline = async (oderId: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, oderId);
  await updateDoc(userRef, {
    lastOnline: serverTimestamp(),
  });
};

// Helper: Create initial farm cells
const createInitialFarmCells = (size: number): FarmCell[] => {
  const cells: FarmCell[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      cells.push({
        position: { x, y },
        isUnlocked: true,
      });
    }
  }
  return cells;
};

// Check if user is online (within last 5 minutes)
export const isUserOnline = (lastOnline: number): boolean => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return lastOnline > fiveMinutesAgo;
};
