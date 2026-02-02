import { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/pages/LoginPage';
import { SetupPage } from './components/pages/SetupPage';
import { GamePage } from './components/pages/GamePage';
import { ComingSoonPage } from './components/pages/ComingSoonPage';
import { WhitepaperPage } from './components/pages/WhitepaperPage';
import { useGameStore } from './store/useGameStore';
import { useWalletStore } from './store/useWalletStore';
import { useAuthStore } from './store/useAuthStore';
import { onAuthStateChanged } from './services/authService';
import { COMING_SOON_MODE } from './config/constants';

// Protected Route wrapper - redirects to login if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { player } = useGameStore();

  if (!player) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Setup Route wrapper - redirects based on auth state
const SetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { player } = useGameStore();
  const { isConnected } = useWalletStore();
  const { twitterProfile } = useAuthStore();

  // If player exists, go to game
  if (player) {
    return <Navigate to="/game" replace />;
  }

  // If not connected and no Twitter profile, go to login
  if (!isConnected && !twitterProfile) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Login Route wrapper - redirects if already logged in
const LoginRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { player } = useGameStore();

  if (player) {
    return <Navigate to="/game" replace />;
  }

  return <>{children}</>;
};

// Main App content with routing logic
function AppContent() {
  const navigate = useNavigate();
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

  // Handle wallet connection changes - navigate to setup
  useEffect(() => {
    if (isConnected && !player) {
      navigate('/setup');
    }
  }, [isConnected, player, navigate]);

  // Handle Twitter login - navigate to setup
  const handleTwitterLogin = useCallback(() => {
    navigate('/setup');
  }, [navigate]);

  // Handle setup complete - navigate to game
  const handleSetupComplete = useCallback(() => {
    navigate('/game');
  }, [navigate]);

  // Handle logout - clear all state and return to login
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      disconnect();
      resetGame();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [signOut, disconnect, resetGame, navigate]);

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

  // If coming soon mode is enabled, show limited routes
  if (COMING_SOON_MODE) {
    return (
      <div className="min-h-screen">
        <Routes>
          {/* Whitepaper - always accessible */}
          <Route path="/whitepaper" element={<WhitepaperPage />} />

          {/* All other routes show Coming Soon page */}
          <Route path="*" element={<ComingSoonPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Whitepaper - always accessible */}
        <Route path="/whitepaper" element={<WhitepaperPage />} />

        {/* Login page */}
        <Route
          path="/login"
          element={
            <LoginRoute>
              <LoginPage onTwitterLogin={handleTwitterLogin} />
            </LoginRoute>
          }
        />

        {/* Setup page */}
        <Route
          path="/setup"
          element={
            <SetupRoute>
              <SetupPage onComplete={handleSetupComplete} />
            </SetupRoute>
          }
        />

        {/* Game page (protected) */}
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GamePage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            player ? <Navigate to="/game" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
