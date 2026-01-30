import { create } from 'zustand';
import { User } from 'firebase/auth';
import {
  signInWithTwitter,
  signOut as authSignOut,
  getTwitterProfile,
  TwitterProfile,
} from '../services/authService';

interface AuthState {
  // Firebase user
  firebaseUser: User | null;
  // Twitter profile extracted from Firebase user
  twitterProfile: TwitterProfile | null;
  // Loading states
  isAuthenticating: boolean;
  isInitialized: boolean;
  // Error
  error: string | null;
  // Actions
  setFirebaseUser: (user: User | null) => void;
  signInWithTwitter: () => Promise<boolean>;
  signOut: () => Promise<void>;
  setInitialized: (value: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  twitterProfile: null,
  isAuthenticating: false,
  isInitialized: false,
  error: null,

  setFirebaseUser: (user) => {
    if (user) {
      const profile = getTwitterProfile(user);
      set({ firebaseUser: user, twitterProfile: profile });
    } else {
      set({ firebaseUser: null, twitterProfile: null });
    }
  },

  signInWithTwitter: async () => {
    set({ isAuthenticating: true, error: null });
    try {
      const result = await signInWithTwitter();
      const profile = getTwitterProfile(result.user);
      set({
        firebaseUser: result.user,
        twitterProfile: profile,
        isAuthenticating: false,
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '登入失敗，請稍後再試';
      set({ error: errorMessage, isAuthenticating: false });
      return false;
    }
  },

  signOut: async () => {
    try {
      await authSignOut();
      set({ firebaseUser: null, twitterProfile: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  setInitialized: (value) => set({ isInitialized: value }),

  clearError: () => set({ error: null }),
}));
