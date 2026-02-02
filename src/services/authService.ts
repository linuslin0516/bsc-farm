import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
  AuthError,
} from 'firebase/auth';
import { auth, twitterProvider } from '../config/firebase';

export interface TwitterProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  handle: string | null;
}

/**
 * Get user-friendly error message from Firebase Auth error
 */
function getAuthErrorMessage(error: AuthError): string {
  const errorCode = error.code;
  console.error('🔐 Firebase Auth Error:', errorCode, error.message);

  switch (errorCode) {
    case 'auth/popup-blocked':
      return '彈出視窗被阻擋，請允許彈出視窗或使用重定向登入';
    case 'auth/popup-closed-by-user':
      return '登入視窗已關閉，請重試';
    case 'auth/cancelled-popup-request':
      return '登入請求已取消';
    case 'auth/account-exists-with-different-credential':
      return '此帳號已使用其他方式登入，請使用原有登入方式';
    case 'auth/operation-not-allowed':
      return 'Twitter 登入尚未啟用，請聯繫管理員';
    case 'auth/unauthorized-domain':
      return '此網域未授權使用 Twitter 登入';
    case 'auth/invalid-api-key':
      return 'API 金鑰無效，請聯繫管理員';
    case 'auth/network-request-failed':
      return '網路連線失敗，請檢查網路後重試';
    case 'auth/too-many-requests':
      return '請求次數過多，請稍後再試';
    case 'auth/user-disabled':
      return '此帳號已被停用';
    case 'auth/internal-error':
      return '內部錯誤，請稍後再試。如持續發生請聯繫管理員';
    default:
      return `登入失敗 (${errorCode})，請稍後再試`;
  }
}

/**
 * Sign in with Twitter using popup (with redirect fallback)
 */
export async function signInWithTwitter(): Promise<UserCredential> {
  try {
    console.log('🔐 Attempting Twitter sign-in with popup...');
    const result = await signInWithPopup(auth, twitterProvider);
    console.log('✅ Twitter sign-in successful');
    return result;
  } catch (error: unknown) {
    const authError = error as AuthError;
    console.error('❌ Twitter sign-in error:', authError.code, authError.message);

    // If popup was blocked, try redirect method
    if (authError.code === 'auth/popup-blocked') {
      console.log('🔄 Popup blocked, trying redirect method...');
      await signInWithRedirect(auth, twitterProvider);
      // This line won't be reached as the page will redirect
      throw new Error('正在重定向到 Twitter 登入...');
    }

    // Re-throw with user-friendly message
    const friendlyError = new Error(getAuthErrorMessage(authError));
    (friendlyError as any).code = authError.code;
    throw friendlyError;
  }
}

/**
 * Check for redirect result (call on app init)
 */
export async function checkRedirectResult(): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('✅ Twitter redirect sign-in successful');
    }
    return result;
  } catch (error: unknown) {
    const authError = error as AuthError;
    console.error('❌ Redirect result error:', authError.code, authError.message);
    return null;
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
