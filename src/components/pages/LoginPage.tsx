import React, { useState } from 'react';
import { Logo } from '../game/Logo';
import { Button } from '../ui/Button';
import { useWalletStore } from '../../store/useWalletStore';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginPageProps {
  onTwitterLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onTwitterLogin }) => {
  const { connect, isConnecting, switchNetwork, isCorrectNetwork } = useWalletStore();
  const { signInWithTwitter, isAuthenticating, error: authError, clearError } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);

    const success = await connect();
    if (!success) {
      setError('Failed to connect wallet. Please try again.');
      return;
    }

    // Check if on correct network
    if (!isCorrectNetwork()) {
      const switched = await switchNetwork();
      if (!switched) {
        setError('Please switch to BSC network in your wallet.');
      }
    }
  };

  const handleTwitterLogin = async () => {
    setError(null);
    clearError();
    const success = await signInWithTwitter();
    if (success) {
      onTwitterLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">
          🌽
        </div>
        <div
          className="absolute top-40 right-20 text-5xl opacity-20 animate-float"
          style={{ animationDelay: '1s' }}
        >
          🥕
        </div>
        <div
          className="absolute bottom-40 left-20 text-7xl opacity-20 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          🍅
        </div>
        <div
          className="absolute bottom-20 right-10 text-5xl opacity-20 animate-float"
          style={{ animationDelay: '1.5s' }}
        >
          🌾
        </div>
      </div>

      {/* Main card */}
      <div className="card p-8 max-w-md w-full text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <p className="text-gray-300 mb-8">
          開始你的農場之旅，種植作物賺取 <strong className="text-binance-yellow">$FARM</strong> 代幣！
        </p>

        {(error || authError) && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
            {error || authError}
          </div>
        )}

        <div className="space-y-4">
          {/* Twitter Login - Primary CTA */}
          <Button
            onClick={handleTwitterLogin}
            isLoading={isAuthenticating}
            className="w-full text-lg py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] border-[#1DA1F2]"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              使用 X (Twitter) 登入
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-binance-gray-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-binance-gray text-gray-400">或</span>
            </div>
          </div>

          {/* Wallet Connect */}
          <Button
            onClick={handleConnect}
            isLoading={isConnecting}
            variant="secondary"
            className="w-full"
          >
            🦊 連接 MetaMask 錢包
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          連接錢包後，你的遊戲進度將會自動儲存
        </p>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md w-full">
        <div className="card p-4 text-center">
          <span className="text-3xl">🌱</span>
          <p className="text-sm text-gray-300 mt-2">種植作物</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">💰</span>
          <p className="text-sm text-gray-300 mt-2">賺取 $FARM</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">🏆</span>
          <p className="text-sm text-gray-300 mt-2">升級成長</p>
        </div>
      </div>
    </div>
  );
};
