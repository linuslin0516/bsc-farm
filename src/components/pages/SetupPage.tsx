import { useState, useEffect } from 'react';
import { Logo } from '../game/Logo';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { GAME_CONFIG } from '../../config/constants';
import { Player } from '../../types';
import { createUser, getUserByTwitterUid } from '../../services/userService';
import { initializeFriendData } from '../../services/friendService';
import { useT } from '../../translations';

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
  const [bnbAddress, setBnbAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedId] = useState(() => generateUserId());
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const { t } = useT();

  const { setPlayer, initializeFarm, setFarmCells, setDemoBalance, setGoldBalance } = useGameStore();

  // Auto-fill name from Twitter profile
  useEffect(() => {
    if (twitterProfile?.displayName && !name) {
      setName(twitterProfile.displayName);
    }
  }, [twitterProfile]);

  // Check for existing user when Twitter profile is available
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkExistingUser = async () => {
      if (!twitterProfile?.uid) return;

      setIsCheckingExisting(true);

      timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsCheckingExisting(false);
        }
      }, 10000);

      try {
        const existingUser = await getUserByTwitterUid(twitterProfile.uid);

        if (!isMounted) return;

        if (existingUser) {
          const player: Player = {
            oderId: existingUser.oderId,
            bnbAddress: existingUser.bnbAddress,
            twitterUid: existingUser.twitterUid,
            twitterHandle: existingUser.twitterHandle,
            avatarUrl: existingUser.avatarUrl,
            name: existingUser.name,
            level: existingUser.level,
            experience: existingUser.experience,
            landSize: existingUser.landSize as 3 | 4 | 5 | 6,
            createdAt: existingUser.createdAt || Date.now(),
            farmBalance: existingUser.farmBalance || GAME_CONFIG.INITIAL_FARM_BALANCE,
          };

          setPlayer(player);
          setGoldBalance(player.farmBalance);

          if (existingUser.farmCells && existingUser.farmCells.length > 0) {
            setFarmCells(existingUser.farmCells);
          } else {
            initializeFarm(player.landSize);
          }

          clearTimeout(timeoutId);
          onComplete();
          return;
        }
      } catch (error) {
        console.error('Failed to check existing user:', error);
        setError(t.setup.errors.loadError);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setIsCheckingExisting(false);
        }
      }
    };

    checkExistingUser();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [twitterProfile?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError(t.setup.errors.nameTooShort);
      return;
    }

    if (trimmedName.length > 20) {
      setError(t.setup.errors.nameTooLong);
      return;
    }

    // Validate BNB address format if provided
    const trimmedBnb = bnbAddress.trim();
    if (trimmedBnb && !/^0x[a-fA-F0-9]{40}$/.test(trimmedBnb)) {
      setError('BNB address format is invalid (should start with 0x followed by 40 hex characters)');
      return;
    }

    setIsSubmitting(true);

    const newPlayer: Player = {
      oderId: generatedId,
      bnbAddress: trimmedBnb || undefined,
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

    setPlayer(newPlayer);
    initializeFarm(GAME_CONFIG.INITIAL_LAND_SIZE);
    setDemoBalance(GAME_CONFIG.INITIAL_FARM_BALANCE);

    try {
      await createUser(
        generatedId,
        trimmedName,
        GAME_CONFIG.INITIAL_LAND_SIZE,
        GAME_CONFIG.INITIAL_FARM_BALANCE,
        trimmedBnb || undefined,
        twitterProfile?.uid,
        twitterProfile?.handle || undefined,
        twitterProfile?.photoURL || undefined
      );
      await initializeFriendData(generatedId);
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
      setError(t.setup.errors.serverError);
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 500);
  };

  if (isCheckingExisting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-space-cyan border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">{t.setup.loadingData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <h2 className="text-2xl font-bold text-center text-space-cyan mb-2">
          {t.setup.welcome}
        </h2>
        <p className="text-gray-400 text-center mb-6">
          {t.setup.subtitle}
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
              <p className="text-sm text-gray-400">{t.setup.twitterConnected}</p>
              <p className="text-white font-medium">{twitterProfile.displayName}</p>
              {twitterProfile.handle && (
                <p className="text-xs text-[#1DA1F2]">@{twitterProfile.handle}</p>
              )}
            </div>
          </div>
        )}

        {/* Generated ID display */}
        <div className="mb-6 p-4 bg-space-gray rounded-lg text-center">
          <span className="text-xs text-gray-400">{t.setup.yourId}</span>
          <p className="text-3xl font-bold text-space-cyan font-mono">
            {generatedId}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t.setup.shareIdHint}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.setup.farmName}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.setup.farmNamePlaceholder}
              className="input-field w-full text-lg"
              maxLength={20}
              autoFocus
            />
          </div>

          {/* BNB Address - Optional */}
          <div className="mb-6">
            <label
              htmlFor="bnbAddress"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              BNB Receiving Address <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              id="bnbAddress"
              value={bnbAddress}
              onChange={(e) => setBnbAddress(e.target.value)}
              placeholder="0x..."
              className="input-field w-full text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fill in your BNB address to receive airdrop rewards based on leaderboard ranking.
            </p>
          </div>

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full text-lg py-3"
            disabled={!name.trim()}
          >
            {t.setup.startFarming}
          </Button>
        </form>

        {/* Starter pack info */}
        <div className="mt-6 p-4 bg-space-blue/10 border border-space-blue/30 rounded-lg">
          <h3 className="text-sm font-bold text-space-cyan mb-2">
            {t.setup.starterPack}
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>- {GAME_CONFIG.INITIAL_LAND_SIZE}x{GAME_CONFIG.INITIAL_LAND_SIZE} {t.setup.starterPackItems.land} ({GAME_CONFIG.INITIAL_LAND_SIZE * GAME_CONFIG.INITIAL_LAND_SIZE} {t.setup.starterPackItems.plots})</li>
            <li>- {GAME_CONFIG.INITIAL_FARM_BALANCE} {t.setup.starterPackItems.gold}</li>
            <li>- {t.setup.starterPackItems.cropsUnlocked}</li>
            <li>- {t.setup.starterPackItems.uniqueId}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
