import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getExpForLevel } from '../../config/constants';
import { getTimeOfDay } from '../../utils/timeOfDay';
import { useLanguageStore } from '../../store/useLanguageStore';
import { localizeText } from '../../utils/i18n';
import { ActiveBonusesPanel } from './ActiveBonusesPanel';

export const CharacterStatsPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { player, farmCells, demoBalance } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  if (!player) return null;

  const currentLevelExp = getExpForLevel(player.level);
  const expProgress = (player.experience / currentLevelExp) * 100;
  const timeOfDay = getTimeOfDay();
  const greeting = timeOfDay === 'dawn'
    ? l('Good morning', '早安')
    : timeOfDay === 'day'
      ? l('Hello', '你好')
      : timeOfDay === 'dusk'
        ? l('Good evening', '傍晚好')
        : l('Good night', '晚安');

  // Calculate farm stats
  const totalCells = farmCells.length;
  const plantedCells = farmCells.filter((c) => c.plantedCrop).length;
  const matureCells = farmCells.filter((c) => c.plantedCrop?.stage === 'mature').length;

  return (
    <div className="fixed right-3 top-20 z-40 pointer-events-auto">
      {/* Toggle button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all"
          title={l('Expand panel', '展開面板')}
        >
          <span className="text-xl">👤</span>
        </button>
      )}

      {/* Full panel */}
      {!isCollapsed && (
        <div className="glass-panel rounded-xl overflow-hidden w-56">
          {/* Header with close button */}
          <div className="bg-binance-yellow/20 px-4 py-2 flex justify-between items-center">
            <span className="text-sm font-bold text-binance-yellow">
              {greeting}！
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-gray-400 hover:text-white transition-colors text-lg"
            >
              ×
            </button>
          </div>

          {/* Player info */}
          <div className="p-4 space-y-4">
            {/* Name and ID */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white truncate">
                {player.name}
              </h3>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                ID: <span className="font-mono text-binance-yellow">{player.oderId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(player.oderId)}
                  className="text-gray-500 hover:text-binance-yellow transition-colors"
                  title={l('Copy ID', '複製 ID')}
                >
                  📋
                </button>
              </p>
            </div>

            {/* Level */}
            <div className="bg-binance-gray/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">{l('Level', '等級')}</span>
                <span className="text-sm font-bold text-binance-yellow">
                  Lv. {player.level}
                </span>
              </div>
              <div className="h-2 bg-binance-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-farm-green to-farm-green-light transition-all duration-300"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 text-right">
                {player.experience} / {currentLevelExp} XP
              </p>
            </div>

            {/* Farm Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-binance-gray/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-farm-green">{player.landSize}×{player.landSize}</p>
                <p className="text-[10px] text-gray-400">{l('Farmland', '農地')}</p>
              </div>
              <div className="bg-binance-gray/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-binance-yellow">{demoBalance}</p>
                <p className="text-[10px] text-gray-400">$FARM</p>
              </div>
            </div>

            {/* Crop Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{l('Planted', '種植中')}</span>
                <span className="text-farm-green">{plantedCells} / {totalCells}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{l('Ready', '可收成')}</span>
                <span className="text-binance-yellow">{matureCells}</span>
              </div>
            </div>

            {/* Active Bonuses */}
            <ActiveBonusesPanel />

            {/* Quick Actions */}
            <div className="pt-2 border-t border-binance-gray-light">
              <button
                className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors"
                onClick={() => {
                  // Could add more actions here
                }}
              >
                {l('View achievements →', '查看成就 →')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
