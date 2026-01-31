import React, { useEffect } from 'react';
import { useWeb3Store } from '../../store/useWeb3Store';
import { formatAddress, formatTokenBalance, isMetaMaskInstalled } from '../../services/web3Service';

interface WalletPanelProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({ onNotify }) => {
  const {
    isConnected,
    isConnecting,
    address,
    bnbBalance,
    farmBalance,
    isCorrectNetwork,
    error,
    connect,
    disconnect,
    switchNetwork,
    refreshBalances,
    initializeListeners,
    clearError,
  } = useWeb3Store();

  // Initialize listeners on mount
  useEffect(() => {
    initializeListeners();
  }, [initializeListeners]);

  // Refresh balances periodically
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      refreshBalances();
      const interval = setInterval(refreshBalances, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, isCorrectNetwork, refreshBalances]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      onNotify('error', error);
      clearError();
    }
  }, [error, onNotify, clearError]);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      window.open('https://metamask.io/download/', '_blank');
      onNotify('info', '請安裝 MetaMask 錢包後重試');
      return;
    }

    const success = await connect();
    if (success) {
      onNotify('success', '錢包連接成功！');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onNotify('info', '錢包已斷開連接');
  };

  const handleSwitchNetwork = async () => {
    const success = await switchNetwork();
    if (success) {
      onNotify('success', '已切換到 BNB Smart Chain');
    } else {
      onNotify('error', '切換網路失敗');
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🦊</div>
          <h3 className="text-white font-bold mb-2">連接錢包</h3>
          <p className="text-gray-400 text-sm mb-4">
            連接 MetaMask 以使用 $FARM 代幣功能
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500
                     text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                連接中...
              </span>
            ) : (
              '連接 MetaMask'
            )}
          </button>
          {!isMetaMaskInstalled() && (
            <p className="text-yellow-400 text-xs mt-2">
              未檢測到 MetaMask，點擊按鈕將前往下載頁面
            </p>
          )}
        </div>
      </div>
    );
  }

  // Wrong network state
  if (!isCorrectNetwork) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-yellow-500/50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-yellow-400 font-bold mb-2">網路錯誤</h3>
          <p className="text-gray-400 text-sm mb-4">
            請切換到 BNB Smart Chain 網路
          </p>
          <button
            onClick={handleSwitchNetwork}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500
                     text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600
                     transition-all"
          >
            切換到 BSC
          </button>
        </div>
      </div>
    );
  }

  // Connected state
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">已連接</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-gray-400 hover:text-red-400 text-sm transition-colors"
        >
          斷開連接
        </button>
      </div>

      {/* Address */}
      <div className="bg-black/30 rounded-lg p-3 mb-4">
        <div className="text-gray-400 text-xs mb-1">錢包地址</div>
        <div className="text-white font-mono text-sm">
          {formatAddress(address || '')}
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        {/* BNB Balance */}
        <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💰</span>
            <span className="text-yellow-400 text-xs">BNB</span>
          </div>
          <div className="text-white font-bold">
            {formatTokenBalance(bnbBalance)}
          </div>
        </div>

        {/* FARM Balance */}
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌾</span>
            <span className="text-green-400 text-xs">$FARM</span>
          </div>
          <div className="text-white font-bold">
            {formatTokenBalance(farmBalance)}
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={refreshBalances}
        className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm
                 border border-white/10 rounded-lg hover:border-white/20 transition-all"
      >
        🔄 刷新餘額
      </button>
    </div>
  );
};
