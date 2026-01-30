import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FriendData, FriendInfo } from '../types';
import { getUserById, isUserOnline } from './userService';

const FRIENDS_COLLECTION = 'friends';

// Initialize friend data for a user
export const initializeFriendData = async (oderId: string): Promise<void> => {
  const friendRef = doc(db, FRIENDS_COLLECTION, oderId);
  const friendDoc = await getDoc(friendRef);

  if (!friendDoc.exists()) {
    await setDoc(friendRef, {
      oderId,
      friendList: [],
      pendingRequests: [],
      sentRequests: [],
    });
  }
};

// Get friend data
export const getFriendData = async (oderId: string): Promise<FriendData | null> => {
  const friendDoc = await getDoc(doc(db, FRIENDS_COLLECTION, oderId));

  if (!friendDoc.exists()) {
    return null;
  }

  return friendDoc.data() as FriendData;
};

// Send friend request
export const sendFriendRequest = async (
  fromId: string,
  toId: string
): Promise<{ success: boolean; message: string }> => {
  // Check if target user exists
  const targetUser = await getUserById(toId);
  if (!targetUser) {
    return { success: false, message: '找不到該用戶' };
  }

  // Check if already friends
  const myFriendData = await getFriendData(fromId);
  if (myFriendData?.friendList.includes(toId)) {
    return { success: false, message: '已經是好友了' };
  }

  // Check if already sent request
  if (myFriendData?.sentRequests.includes(toId)) {
    return { success: false, message: '已經發送過請求了' };
  }

  // Check if there's a pending request from target (auto-accept)
  if (myFriendData?.pendingRequests.includes(toId)) {
    await acceptFriendRequest(fromId, toId);
    return { success: true, message: '已成為好友！' };
  }

  // Add to my sent requests
  await updateDoc(doc(db, FRIENDS_COLLECTION, fromId), {
    sentRequests: arrayUnion(toId),
  });

  // Add to target's pending requests
  await updateDoc(doc(db, FRIENDS_COLLECTION, toId), {
    pendingRequests: arrayUnion(fromId),
  });

  return { success: true, message: '好友請求已發送' };
};

// Accept friend request
export const acceptFriendRequest = async (
  myId: string,
  requesterId: string
): Promise<void> => {
  const myFriendRef = doc(db, FRIENDS_COLLECTION, myId);
  const requesterFriendRef = doc(db, FRIENDS_COLLECTION, requesterId);

  // Add each other to friend lists
  await updateDoc(myFriendRef, {
    friendList: arrayUnion(requesterId),
    pendingRequests: arrayRemove(requesterId),
  });

  await updateDoc(requesterFriendRef, {
    friendList: arrayUnion(myId),
    sentRequests: arrayRemove(myId),
  });
};

// Reject friend request
export const rejectFriendRequest = async (
  myId: string,
  requesterId: string
): Promise<void> => {
  const myFriendRef = doc(db, FRIENDS_COLLECTION, myId);
  const requesterFriendRef = doc(db, FRIENDS_COLLECTION, requesterId);

  await updateDoc(myFriendRef, {
    pendingRequests: arrayRemove(requesterId),
  });

  await updateDoc(requesterFriendRef, {
    sentRequests: arrayRemove(myId),
  });
};

// Remove friend
export const removeFriend = async (
  myId: string,
  friendId: string
): Promise<void> => {
  const myFriendRef = doc(db, FRIENDS_COLLECTION, myId);
  const friendRef = doc(db, FRIENDS_COLLECTION, friendId);

  await updateDoc(myFriendRef, {
    friendList: arrayRemove(friendId),
  });

  await updateDoc(friendRef, {
    friendList: arrayRemove(myId),
  });
};

// Get friend list with details
export const getFriendListWithDetails = async (
  oderId: string
): Promise<FriendInfo[]> => {
  const friendData = await getFriendData(oderId);
  if (!friendData) return [];

  const friendInfos: FriendInfo[] = [];

  for (const friendId of friendData.friendList) {
    const user = await getUserById(friendId);
    if (user) {
      friendInfos.push({
        oderId: friendId,
        name: user.name,
        level: user.level,
        lastOnline: user.lastOnline,
        isOnline: isUserOnline(user.lastOnline),
      });
    }
  }

  // Sort by online status, then by name
  return friendInfos.sort((a, b) => {
    if (a.isOnline !== b.isOnline) {
      return a.isOnline ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
};

// Get pending requests with details
export const getPendingRequestsWithDetails = async (
  oderId: string
): Promise<FriendInfo[]> => {
  const friendData = await getFriendData(oderId);
  if (!friendData) return [];

  const requestInfos: FriendInfo[] = [];

  for (const requesterId of friendData.pendingRequests) {
    const user = await getUserById(requesterId);
    if (user) {
      requestInfos.push({
        oderId: requesterId,
        name: user.name,
        level: user.level,
        lastOnline: user.lastOnline,
        isOnline: isUserOnline(user.lastOnline),
      });
    }
  }

  return requestInfos;
};
