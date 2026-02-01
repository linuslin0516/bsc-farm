import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/pages/LoginPage';
import { SetupPage } from './components/pages/SetupPage';
import { GamePage } from './components/pages/GamePage';
import { useGameStore } from './store/useGameStore';
import { useWalletStore } from './store/useWalletStore';
import { useAuthStore } from './store/useAuthStore';
import { onAuthStateChanged } from './services/authService';

type Page = 'login' | 'setup' | 'game';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const { player, resetGame } = useGameStore();
  const { isConnected, disconnect } = useWalletStore();
  const { setFirebaseUser, setInitialized, isInitialized, signOut } = useAuthStore();

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setInitialized]);

  // Check for existing player on mount
  useEffect(() => {
    if (player) {
      setCurrentPage('game');
    }
  }, [player]);

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && !player) {
      setCurrentPage('setup');
    }
  }, [isConnected, player]);

  const handleTwitterLogin = () => {
    setCurrentPage('setup');
  };

  const handleSetupComplete = () => {
    setCurrentPage('game');
  };

  // Handle logout - clear all state and return to login
  const handleLogout = useCallback(async () => {
    try {
      // Sign out from Firebase (Twitter auth)
      await signOut();
      // Disconnect wallet
      disconnect();
      // Reset game state
      resetGame();
      // Return to login page
      setCurrentPage('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [signOut, disconnect, resetGame]);

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🌱</div>
          <p className="text-gray-400">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'login' && (
        <LoginPage onTwitterLogin={handleTwitterLogin} />
      )}
      {currentPage === 'setup' && <SetupPage onComplete={handleSetupComplete} />}
      {currentPage === 'game' && <GamePage onLogout={handleLogout} />}
    </div>
  );
}

export default App;
