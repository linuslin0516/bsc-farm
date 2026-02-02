import { useGameStore } from '../../store/useGameStore';
import { useWeb3Store } from '../../store/useWeb3Store';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Logo } from './Logo';
import { getExpForLevel } from '../../config/constants';
import { formatAddress } from '../../services/web3Service';
import { localizeText } from '../../utils/i18n';

interface HUDProps {
  onOpenShop: () => void;
  onOpenFriends: () => void;
  onOpenAchievements: () => void;
  onOpenDailyTasks: () => void;
  onOpenLeaderboard: () => void;
  onOpenCodex: () => void;
  onOpenWallet: () => void;
  onOpenExchange: () => void;
  onOpenUpgrades: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  onOpenShop,
  onOpenFriends,
  onOpenAchievements,
  onOpenDailyTasks,
  onOpenLeaderboard,
  onOpenCodex,
  onOpenWallet,
  onOpenExchange,
  onOpenUpgrades,
}) => {
  const { player, goldBalance } = useGameStore();
  const { isConnected, address } = useWeb3Store();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  if (!player) return null;

  const currentLevelExp = getExpForLevel(player.level);
  const expProgress = (player.experience / currentLevelExp) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="p-3 flex justify-between items-start gap-4">
        {/* Left side - Logo, Balance, and Wallet */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo */}
          <div className="glass-panel p-2 rounded-xl">
            <Logo size="sm" />
          </div>

          {/* GOLD Balance */}
          <div className="glass-panel px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">GOLD</p>
                <p className="text-base font-bold text-yellow-400">
                  {goldBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Exchange Button */}
          <button
            onClick={onOpenExchange}
            className="glass-panel px-3 py-2 rounded-xl hover:bg-white/20 transition-all
                     bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
            title={l('Token Exchange (GOLD ↔ FARM)', '代幣兌換 (GOLD ↔ FARM)')}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-lg">💱</span>
              <span className="text-white text-xs font-medium hidden md:inline">{l('Exchange', '兌換')}</span>
            </div>
          </button>

          {/* Wallet Button */}
          <button
            onClick={onOpenWallet}
            className={`glass-panel px-3 py-2 rounded-xl hover:bg-white/20 transition-all
                      ${isConnected ? 'border border-green-500/50' : ''}`}
            title={isConnected ? l(`Connected: ${address}`, `已連接: ${address}`) : l('Connect Wallet', '連接錢包')}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{isConnected ? '✅' : '🦊'}</span>
              <span className="text-white text-xs font-medium hidden md:inline">
                {isConnected ? formatAddress(address || '') : l('Wallet', '錢包')}
              </span>
            </div>
          </button>
        </div>

        {/* Center - Level */}
        <div className="glass-panel px-4 py-2 rounded-xl pointer-events-auto hidden sm:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-binance-yellow to-binance-gold flex items-center justify-center">
              <span className="text-binance-dark font-bold text-lg">{player.level}</span>
            </div>
            <div className="min-w-[120px]">
              <p className="text-xs text-gray-400">{l('Level', '等級')} {player.level}</p>
              <div className="h-2 bg-binance-gray rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-binance-yellow to-binance-gold transition-all duration-300"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {player.experience} / {currentLevelExp} XP
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Daily Tasks */}
          <button
            onClick={onOpenDailyTasks}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group relative"
            title={l('Daily Tasks', '每日任務')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📋</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Achievements', '成就')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
          </button>

          {/* Crop Codex */}
          <button
            onClick={onOpenCodex}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Crop Codex', '作物圖鑑')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📚</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Leaderboard', '排行榜')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏅</span>
          </button>

          {/* Shop */}
          <button
            onClick={onOpenShop}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Shop', '商店')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏪</span>
          </button>

          {/* Upgrades */}
          <button
            onClick={onOpenUpgrades}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Farm Upgrades', '農場升級')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏗️</span>
          </button>

          {/* Friends */}
          <button
            onClick={onOpenFriends}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Friends', '好友')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">👥</span>
          </button>
        </div>
      </div>
    </div>
  );
};
