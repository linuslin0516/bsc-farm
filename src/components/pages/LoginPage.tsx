import React, { useState, useEffect } from 'react';
import { Logo } from '../game/Logo';
import { Button } from '../ui/Button';
import { useWalletStore } from '../../store/useWalletStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../translations';
import { WalletType, WalletInfo } from '../../services/web3Service';

interface LoginPageProps {
  onTwitterLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onTwitterLogin }) => {
  const {
    connect,
    isConnecting,
    switchNetwork,
    isCorrectNetwork,
    detectAvailableWallets,
    getDownloadUrl,
  } = useWalletStore();
  const { signInWithTwitter, isAuthenticating, error: authError, clearError } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null);
  const { t } = useT();

  // Detect available wallets on mount
  useEffect(() => {
    const wallets = detectAvailableWallets();
    setAvailableWallets(wallets);
  }, [detectAvailableWallets]);

  const handleConnectWallet = async (walletType: WalletType) => {
    setError(null);
    setConnectingWallet(walletType);

    const success = await connect(walletType);
    if (!success) {
      setError(t.login.errors.walletFailed);
      setConnectingWallet(null);
      return;
    }

    // Check if on correct network
    if (!isCorrectNetwork()) {
      const switched = await switchNetwork();
      if (!switched) {
        setError(t.login.errors.switchNetwork);
      }
    }
    setConnectingWallet(null);
    setShowWalletOptions(false);
  };

  const handleTwitterLogin = async () => {
    setError(null);
    clearError();
    const success = await signInWithTwitter();
    if (success) {
      onTwitterLogin();
    }
  };

  const handleWalletDownload = (walletType: WalletType) => {
    const url = getDownloadUrl(walletType);
    if (url) {
      window.open(url, '_blank');
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
          {t.login.subtitle} <strong className="text-binance-yellow">{t.login.tokenName}</strong> {t.login.tokens}
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
              {t.login.twitterLogin}
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-binance-gray-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-binance-gray text-gray-400">{t.login.or}</span>
            </div>
          </div>

          {/* Wallet Connect - Show options or button */}
          {!showWalletOptions ? (
            <Button
              onClick={() => setShowWalletOptions(true)}
              isLoading={isConnecting}
              variant="secondary"
              className="w-full"
            >
              🔗 {t.login.walletLogin}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-3">{t.login.selectWallet || '選擇錢包'}</p>

              {/* MetaMask */}
              <button
                onClick={() => {
                  const wallet = availableWallets.find(w => w.type === 'metamask');
                  if (wallet?.installed) {
                    handleConnectWallet('metamask');
                  } else {
                    handleWalletDownload('metamask');
                  }
                }}
                disabled={connectingWallet === 'metamask'}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-[#F6851B]/10 border border-[#F6851B]/30 hover:bg-[#F6851B]/20 transition-all disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🦊</span>
                  <span className="text-white font-medium">MetaMask</span>
                </span>
                {connectingWallet === 'metamask' ? (
                  <span className="text-sm text-gray-400">連接中...</span>
                ) : availableWallets.find(w => w.type === 'metamask')?.installed ? (
                  <span className="text-sm text-green-400">已安裝</span>
                ) : (
                  <span className="text-sm text-yellow-400">下載 →</span>
                )}
              </button>

              {/* OKX Wallet */}
              <button
                onClick={() => {
                  const wallet = availableWallets.find(w => w.type === 'okx');
                  if (wallet?.installed) {
                    handleConnectWallet('okx');
                  } else {
                    handleWalletDownload('okx');
                  }
                }}
                disabled={connectingWallet === 'okx'}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">⭕</span>
                  <span className="text-white font-medium">OKX Wallet</span>
                </span>
                {connectingWallet === 'okx' ? (
                  <span className="text-sm text-gray-400">連接中...</span>
                ) : availableWallets.find(w => w.type === 'okx')?.installed ? (
                  <span className="text-sm text-green-400">已安裝</span>
                ) : (
                  <span className="text-sm text-yellow-400">下載 →</span>
                )}
              </button>

              {/* Trust Wallet */}
              <button
                onClick={() => {
                  const wallet = availableWallets.find(w => w.type === 'trust');
                  if (wallet?.installed) {
                    handleConnectWallet('trust');
                  } else {
                    handleWalletDownload('trust');
                  }
                }}
                disabled={connectingWallet === 'trust'}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0500FF]/10 border border-[#0500FF]/30 hover:bg-[#0500FF]/20 transition-all disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <span className="text-white font-medium">Trust Wallet</span>
                </span>
                {connectingWallet === 'trust' ? (
                  <span className="text-sm text-gray-400">連接中...</span>
                ) : availableWallets.find(w => w.type === 'trust')?.installed ? (
                  <span className="text-sm text-green-400">已安裝</span>
                ) : (
                  <span className="text-sm text-yellow-400">下載 →</span>
                )}
              </button>

              {/* Back button */}
              <button
                onClick={() => setShowWalletOptions(false)}
                className="w-full text-sm text-gray-400 hover:text-gray-300 py-2"
              >
                ← 返回
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-500">
          {t.login.saveHint}
        </p>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md w-full">
        <div className="card p-4 text-center">
          <span className="text-3xl">🌱</span>
          <p className="text-sm text-gray-300 mt-2">{t.login.features.plant}</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">💰</span>
          <p className="text-sm text-gray-300 mt-2">{t.login.features.earn}</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">🏆</span>
          <p className="text-sm text-gray-300 mt-2">{t.login.features.grow}</p>
        </div>
      </div>
    </div>
  );
};
