import { Logo } from './Logo';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../ui/Button';
import { getExpForLevel } from '../../config/constants';

interface HeaderProps {
  onOpenShop: () => void;
  onOpenFriends?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShop, onOpenFriends }) => {
  const { player, demoBalance } = useGameStore();

  const expProgress = player
    ? (player.experience / getExpForLevel(player.level)) * 100
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-space-dark/90 backdrop-blur-md border-b-2 border-space-cyan/30">
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
                  <span className="text-lg font-bold text-space-cyan">
                    {player.level}
                  </span>
                </div>
                <div className="w-20 h-1.5 bg-space-gray rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-space-blue to-space-cyan transition-all duration-500"
                    style={{ width: `${expProgress}%` }}
                  />
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-space-gray rounded-lg border border-space-cyan/30">
                <span className="text-xl">⚡</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">GOLD</span>
                  <span className="text-base font-bold text-space-cyan">
                    {demoBalance.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onOpenFriends && (
                  <Button onClick={onOpenFriends} variant="secondary" size="sm">
                    👥
                  </Button>
                )}
                <Button onClick={onOpenShop} variant="secondary" size="sm">
                  🛒
                </Button>
              </div>

              {/* Player Info */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-white text-sm">{player.name}</span>
                  <span className="text-[10px] text-space-cyan font-mono">
                    ID: {player.oderId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
