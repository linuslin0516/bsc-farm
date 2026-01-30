import { useState, useEffect } from 'react';
import { Logo } from '../game/Logo';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useAuthStore } from '../../store/useAuthStore';
import { GAME_CONFIG } from '../../config/constants';
import { Player } from '../../types';
import { createUser } from '../../services/userService';
import { initializeFriendData } from '../../services/friendService';

interface SetupPageProps {
  onComplete: () => void;
}

// Generate a random 6-digit user ID
const generateUserId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const SetupPage: React.FC<SetupPageProps> = ({ onComplete }) => {
  const { twitterProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedId] = useState(() => generateUserId());

  const { setPlayer, initializeFarm, setDemoBalance } = useGameStore();
  const { address, isConnected } = useWalletStore();

  // Auto-fill name from Twitter profile
  useEffect(() => {
    if (twitterProfile?.displayName && !name) {
      setName(twitterProfile.displayName);
    }
  }, [twitterProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError('名稱至少需要 2 個字元');
      return;
    }

    if (trimmedName.length > 20) {
      setError('名稱不能超過 20 個字元');
      return;
    }

    setIsSubmitting(true);

    // Create new player with generated ID
    const newPlayer: Player = {
      oderId: generatedId,
      walletAddress: address || undefined,
      twitterUid: twitterProfile?.uid,
      twitterHandle: twitterProfile?.handle || undefined,
      avatarUrl: twitterProfile?.photoURL || undefined,
      name: trimmedName,
      level: 1,
      experience: 0,
      landSize: GAME_CONFIG.INITIAL_LAND_SIZE as 3,
      createdAt: Date.now(),
      farmBalance: GAME_CONFIG.INITIAL_FARM_BALANCE,
    };

    // Initialize game state
    setPlayer(newPlayer);
    initializeFarm(GAME_CONFIG.INITIAL_LAND_SIZE);
    setDemoBalance(GAME_CONFIG.INITIAL_FARM_BALANCE);

    // Save to Firebase
    try {
      await createUser(
        generatedId,
        trimmedName,
        GAME_CONFIG.INITIAL_LAND_SIZE,
        GAME_CONFIG.INITIAL_FARM_BALANCE,
        address || undefined,
        twitterProfile?.uid,
        twitterProfile?.handle || undefined,
        twitterProfile?.photoURL || undefined
      );
      await initializeFriendData(generatedId);
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      setError('無法連接伺服器，請稍後再試');
      setIsSubmitting(false);
      return;
    }

    // Small delay for animation
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <h2 className="text-2xl font-bold text-center text-binance-yellow mb-2">
          歡迎，農夫！
        </h2>
        <p className="text-gray-400 text-center mb-6">
          設定你的資料，開始你的農場之旅
        </p>

        {/* Twitter Profile Display */}
        {twitterProfile && (
          <div className="mb-6 p-4 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 rounded-lg flex items-center gap-4">
            {twitterProfile.photoURL ? (
              <img
                src={twitterProfile.photoURL}
                alt="Twitter Avatar"
                className="w-12 h-12 rounded-full border-2 border-[#1DA1F2]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400">已連接 X (Twitter)</p>
              <p className="text-white font-medium">{twitterProfile.displayName}</p>
              {twitterProfile.handle && (
                <p className="text-xs text-[#1DA1F2]">@{twitterProfile.handle}</p>
              )}
            </div>
          </div>
        )}

        {/* Generated ID display */}
        <div className="mb-6 p-4 bg-binance-gray rounded-lg text-center">
          <span className="text-xs text-gray-400">你的專屬 ID</span>
          <p className="text-3xl font-bold text-binance-yellow font-mono">
            {generatedId}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            分享這個 ID 讓朋友加你好友！
          </p>
        </div>

        {isConnected && address && (
          <div className="mb-4 p-3 bg-binance-gray rounded-lg text-center">
            <span className="text-xs text-gray-400">已連接錢包</span>
            <p className="text-sm text-binance-gold font-mono">
              {address.slice(0, 10)}...{address.slice(-8)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              農場名稱
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入你的農場名稱..."
              className="input-field w-full text-lg"
              maxLength={20}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full text-lg py-3"
            disabled={!name.trim()}
          >
            開始種田！🚀
          </Button>
        </form>

        {/* Starter pack info */}
        <div className="mt-6 p-4 bg-binance-yellow/10 border border-binance-yellow/30 rounded-lg">
          <h3 className="text-sm font-bold text-binance-yellow mb-2">
            🎁 新手禮包
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• {GAME_CONFIG.INITIAL_LAND_SIZE}x{GAME_CONFIG.INITIAL_LAND_SIZE} 農地 ({GAME_CONFIG.INITIAL_LAND_SIZE * GAME_CONFIG.INITIAL_LAND_SIZE} 格)</li>
            <li>• {GAME_CONFIG.INITIAL_FARM_BALANCE} $FARM 代幣</li>
            <li>• 基本作物已解鎖</li>
            <li>• 專屬 6 位數 ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
