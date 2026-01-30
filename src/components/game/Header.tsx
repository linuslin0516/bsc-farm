import { Logo } from './Logo';
import { useGameStore } from '../../store/useGameStore';
import { useWalletStore } from '../../store/useWalletStore';
import { Button } from '../ui/Button';
import { getExpForLevel } from '../../config/constants';

interface HeaderProps {
  onOpenShop: () => void;
  onOpenFriends?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShop, onOpenFriends }) => {
  const { player, demoBalance } = useGameStore();
  const { isConnected, address, disconnect } = useWalletStore();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const expProgress = player
    ? (player.experience / getExpForLevel(player.level)) * 100
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-binance-dark/90 backdrop-blur-md border-b-2 border-binance-yellow/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo size="sm" />

          {/* Player Stats */}
          {player && (
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Level & EXP */}
              <div className="hidden sm:flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Lv.</span>
                  <span className="text-lg font-bold text-binance-gold">
                    {player.level}
                  </span>
                </div>
                <div className="w-20 h-1.5 bg-binance-gray-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-binance-yellow to-binance-gold transition-all duration-500"
                    style={{ width: `${expProgress}%` }}
                  />
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-binance-gray rounded-lg border border-binance-yellow/30">
                <span className="text-xl">🪙</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">$FARM</span>
                  <span className="text-base font-bold text-binance-yellow">
                    {demoBalance.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onOpenFriends && (
                  <Button onClick={onOpenFriends} variant="secondary" size="sm">
                    👥 好友
                  </Button>
                )}
                <Button onClick={onOpenShop} variant="secondary" size="sm">
                  🛒 商店
                </Button>
              </div>

              {/* Player Info */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-white text-sm">{player.name}</span>
                  <span className="text-[10px] text-binance-gold font-mono">
                    ID: {player.oderId}
                  </span>
                  {isConnected && address && (
                    <span className="text-[10px] text-gray-400">
                      {truncateAddress(address)}
                    </span>
                  )}
                </div>

                {isConnected && (
                  <button
                    onClick={disconnect}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Disconnect wallet"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
