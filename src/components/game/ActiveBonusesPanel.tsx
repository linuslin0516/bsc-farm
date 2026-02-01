import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { FARM_UPGRADES } from '../../data/upgrades';

export const ActiveBonusesPanel: React.FC = () => {
  const { playerUpgrades, getUpgradeBonuses } = useGameStore();
  const bonuses = getUpgradeBonuses();

  // Get active upgrades (level > 0)
  const activeUpgrades = FARM_UPGRADES.filter(
    (upgrade) => (playerUpgrades?.upgrades[upgrade.id] || 0) > 0
  );

  // Check if any bonuses are active
  const hasAnyBonus =
    bonuses.growthSpeedMultiplier < 1 ||
    bonuses.sellPriceMultiplier > 1 ||
    bonuses.expMultiplier > 1 ||
    bonuses.theftProtection > 0 ||
    bonuses.extraLandSlots > 0 ||
    bonuses.rareBonusMultiplier > 1;

  if (!hasAnyBonus) {
    return null;
  }

  return (
    <div className="glass-panel rounded-xl p-3 space-y-2">
      <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
        <span>🏗️</span>
        <span>設施加成</span>
      </div>

      {/* Active Bonuses */}
      <div className="space-y-1">
        {bonuses.growthSpeedMultiplier < 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">⚡ 生長速度</span>
            <span className="text-green-400 font-medium">
              -{((1 - bonuses.growthSpeedMultiplier) * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {bonuses.sellPriceMultiplier > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">💰 售價加成</span>
            <span className="text-yellow-400 font-medium">
              +{((bonuses.sellPriceMultiplier - 1) * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {bonuses.expMultiplier > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">✨ 經驗加成</span>
            <span className="text-blue-400 font-medium">
              +{((bonuses.expMultiplier - 1) * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {bonuses.theftProtection > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">🛡️ 防盜機率</span>
            <span className="text-purple-400 font-medium">
              {(bonuses.theftProtection * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {bonuses.extraLandSlots > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">📦 額外農地</span>
            <span className="text-orange-400 font-medium">
              +{bonuses.extraLandSlots} 格
            </span>
          </div>
        )}

        {bonuses.rareBonusMultiplier > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">🌟 稀有加成</span>
            <span className="text-pink-400 font-medium">
              +{((bonuses.rareBonusMultiplier - 1) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Active Upgrades Icons */}
      {activeUpgrades.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <div className="flex flex-wrap gap-1">
            {activeUpgrades.map((upgrade) => {
              const level = playerUpgrades?.upgrades[upgrade.id] || 0;
              return (
                <div
                  key={upgrade.id}
                  className="flex items-center gap-0.5 bg-black/30 rounded px-1.5 py-0.5"
                  title={`${upgrade.nameCn} Lv.${level}`}
                >
                  <span className="text-sm">{upgrade.icon}</span>
                  <span className="text-[10px] text-gray-400">Lv.{level}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
