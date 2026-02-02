import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { localizeText } from '../../utils/i18n';
import {
  getUpgradesByCategory,
  getUpgradeCost,
  formatUpgradeEffect,
  UPGRADE_DETAILS,
} from '../../data/upgrades';
import { FarmUpgrade, UpgradeCategory } from '../../types';
import { Modal } from '../ui/Modal';

interface UpgradeShopPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void;
}

const CATEGORY_INFO: Record<UpgradeCategory, { name: string; nameCn: string; icon: string }> = {
  production: { name: 'Production', nameCn: '生產', icon: '🌱' },
  protection: { name: 'Protection', nameCn: '防護', icon: '🛡️' },
  expansion: { name: 'Expansion', nameCn: '擴建', icon: '📦' },
  special: { name: 'Special', nameCn: '特殊', icon: '⭐' },
};

const RARITY_COLORS: Record<number, string> = {
  0: 'border-gray-500 bg-gray-500/10', // Not purchased
  1: 'border-green-500 bg-green-500/10', // Level 1
  2: 'border-blue-500 bg-blue-500/10', // Level 2
  3: 'border-purple-500 bg-purple-500/10', // Level 3 (max)
};

export const UpgradeShopPanel: React.FC<UpgradeShopPanelProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const { player, goldBalance, subtractGoldBalance, playerUpgrades, purchaseUpgrade } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);
  const [selectedCategory, setSelectedCategory] = useState<UpgradeCategory>('production');
  const [selectedUpgrade, setSelectedUpgrade] = useState<FarmUpgrade | null>(null);

  const playerLevel = player?.level || 1;

  // Get upgrades for selected category
  const categoryUpgrades = useMemo(() => {
    return getUpgradesByCategory(selectedCategory);
  }, [selectedCategory]);

  // Get current level of an upgrade
  const getUpgradeLevel = (upgradeId: string): number => {
    return playerUpgrades?.upgrades[upgradeId] || 0;
  };

  // Check if upgrade is unlocked
  const isUpgradeUnlocked = (upgrade: FarmUpgrade): boolean => {
    return playerLevel >= upgrade.unlockLevel;
  };

  // Check if upgrade is maxed
  const isUpgradeMaxed = (upgrade: FarmUpgrade): boolean => {
    return getUpgradeLevel(upgrade.id) >= upgrade.maxLevel;
  };

  // Handle purchase
  const handlePurchase = (upgrade: FarmUpgrade) => {
    const currentLevel = getUpgradeLevel(upgrade.id);
    const cost = getUpgradeCost(upgrade, currentLevel);
    const upgradeName = language === 'en' ? upgrade.name : upgrade.nameCn;

    if (!isUpgradeUnlocked(upgrade)) {
      onNotify('error', l(`Requires level ${upgrade.unlockLevel} to purchase`, `需要達到等級 ${upgrade.unlockLevel} 才能購買`), 3000);
      return;
    }

    if (isUpgradeMaxed(upgrade)) {
      onNotify('info', l('This upgrade is already at max level', '此升級已達到最高等級'), 3000);
      return;
    }

    if (goldBalance < cost) {
      onNotify('error', l(`Not enough GOLD! Need ${cost.toLocaleString()} GOLD`, `GOLD 不足！需要 ${cost.toLocaleString()} GOLD`), 3000);
      return;
    }

    // Deduct gold and purchase upgrade
    if (subtractGoldBalance(cost)) {
      purchaseUpgrade(upgrade.id, cost);
      onNotify('success', l(`Successfully purchased ${upgradeName} Lv.${currentLevel + 1}!`, `成功購買 ${upgradeName} Lv.${currentLevel + 1}！`), 3000);
      setSelectedUpgrade(null);
    } else {
      onNotify('error', l('Purchase failed, please try again', '購買失敗，請稍後再試'), 3000);
    }
  };

  // Format gold amount
  const formatGold = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={l('🏗️ Farm Upgrades', '🏗️ 農場升級')}>
      <div className="space-y-4">
        {/* Gold Balance */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between">
          <span className="text-yellow-400">💰 {l('GOLD Balance', 'GOLD 餘額')}</span>
          <span className="text-yellow-400 font-bold text-lg">
            {formatGold(goldBalance)}
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(Object.keys(CATEGORY_INFO) as UpgradeCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-black/30 text-gray-400 hover:bg-black/50 hover:text-white'
              }`}
            >
              <span>{CATEGORY_INFO[category].icon}</span>
              <span>{language === 'en' ? CATEGORY_INFO[category].name : CATEGORY_INFO[category].nameCn}</span>
            </button>
          ))}
        </div>

        {/* Upgrades Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {categoryUpgrades.map((upgrade) => {
            const currentLevel = getUpgradeLevel(upgrade.id);
            const isUnlocked = isUpgradeUnlocked(upgrade);
            const isMaxed = isUpgradeMaxed(upgrade);
            const cost = getUpgradeCost(upgrade, currentLevel);

            return (
              <button
                key={upgrade.id}
                onClick={() => setSelectedUpgrade(upgrade)}
                disabled={!isUnlocked}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  isUnlocked
                    ? `${RARITY_COLORS[currentLevel]} hover:scale-[1.02]`
                    : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Icon and Name */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{upgrade.icon}</span>
                  <div>
                    <div className="text-white font-bold text-sm">{language === 'en' ? upgrade.name : upgrade.nameCn}</div>
                    <div className="text-gray-400 text-xs">{language === 'en' ? upgrade.nameCn : upgrade.name}</div>
                  </div>
                </div>

                {/* Level Indicator */}
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < currentLevel ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Status */}
                {!isUnlocked ? (
                  <div className="text-gray-500 text-xs">
                    🔒 {l(`Requires level ${upgrade.unlockLevel}`, `需要等級 ${upgrade.unlockLevel}`)}
                  </div>
                ) : isMaxed ? (
                  <div className="text-purple-400 text-xs font-bold">
                    ✨ {l('Max Level', '已滿級')}
                  </div>
                ) : (
                  <div className="text-yellow-400 text-xs">
                    💰 {formatGold(cost)} GOLD
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Upgrade Detail */}
        {selectedUpgrade && (
          <div className="bg-black/40 rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{selectedUpgrade.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold text-lg">{language === 'en' ? selectedUpgrade.name : selectedUpgrade.nameCn}</h3>
                  <span className="text-gray-400 text-sm">
                    Lv.{getUpgradeLevel(selectedUpgrade.id)} / {selectedUpgrade.maxLevel}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{language === 'en' ? selectedUpgrade.description : selectedUpgrade.descriptionCn}</p>

                {/* Detailed Explanation */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                  <p className="text-blue-300 text-xs leading-relaxed">
                    💡 {UPGRADE_DETAILS[selectedUpgrade.id]}
                  </p>
                </div>

                {/* Current Effects */}
                <div className="bg-black/30 rounded-lg p-2 mb-3">
                  <div className="text-xs text-gray-500 mb-1">{l('Effect Preview:', '效果預覽：')}</div>
                  {selectedUpgrade.effects.map((effect, i) => {
                    const currentLevel = getUpgradeLevel(selectedUpgrade.id);
                    const nextLevel = Math.min(currentLevel + 1, selectedUpgrade.maxLevel);
                    return (
                      <div key={i} className="flex items-center justify-between text-sm py-1">
                        <span className={currentLevel > 0 ? 'text-green-400' : 'text-gray-400'}>
                          {currentLevel > 0 ? `✓ ${formatUpgradeEffect(effect, currentLevel)}` : formatUpgradeEffect(effect, 1)}
                        </span>
                        {!isUpgradeMaxed(selectedUpgrade) && (
                          <span className="text-yellow-400 text-xs">
                            {l('Next:', '下一級:')} {formatUpgradeEffect(effect, nextLevel)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Purchase Button */}
                {isUpgradeUnlocked(selectedUpgrade) && !isUpgradeMaxed(selectedUpgrade) && (
                  <button
                    onClick={() => handlePurchase(selectedUpgrade)}
                    disabled={goldBalance < getUpgradeCost(selectedUpgrade, getUpgradeLevel(selectedUpgrade.id))}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      goldBalance >= getUpgradeCost(selectedUpgrade, getUpgradeLevel(selectedUpgrade.id))
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {l(`Upgrade to Lv.${getUpgradeLevel(selectedUpgrade.id) + 1}`, `升級到 Lv.${getUpgradeLevel(selectedUpgrade.id) + 1}`)} - 💰 {formatGold(getUpgradeCost(selectedUpgrade, getUpgradeLevel(selectedUpgrade.id)))} GOLD
                  </button>
                )}

                {isUpgradeMaxed(selectedUpgrade) && (
                  <div className="w-full py-3 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-center">
                    ✨ {l('Max level reached', '已達到最高等級')}
                  </div>
                )}

                {!isUpgradeUnlocked(selectedUpgrade) && (
                  <div className="w-full py-3 rounded-lg bg-gray-700 text-gray-400 font-bold text-center">
                    🔒 {l(`Requires level ${selectedUpgrade.unlockLevel}`, `需要達到等級 ${selectedUpgrade.unlockLevel}`)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Total Spent */}
        {playerUpgrades && playerUpgrades.totalSpent > 0 && (
          <div className="text-center text-gray-500 text-sm">
            {l('Total invested:', '累計投資:')} {formatGold(playerUpgrades.totalSpent)} GOLD
          </div>
        )}
      </div>
    </Modal>
  );
};
