import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth, twitterProvider } from '../config/firebase';

export interface TwitterProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  handle: string | null;
}

/**
 * Sign in with Twitter using popup
 */
export async function signInWithTwitter(): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    return result;
  } catch (error: unknown) {
    console.error('Twitter sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Get Twitter profile from Firebase user
 */
export function getTwitterProfile(user: User): TwitterProfile {
  // Try to get Twitter handle from provider data
  const twitterData = user.providerData.find(
    (provider) => provider.providerId === 'twitter.com'
  );

  return {
    uid: user.uid,
    displayName: twitterData?.displayName || user.displayName,
    photoURL: twitterData?.photoURL || user.photoURL,
    // Twitter handle might be in the display name or we need to extract it
    handle: twitterData?.uid || null,
  };
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
