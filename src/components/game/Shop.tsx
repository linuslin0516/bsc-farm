import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { localizeText } from '../../utils/i18n';
import { SHOP_ITEMS, LAND_PRICES } from '../../data/shop';

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const Shop: React.FC<ShopProps> = ({ isOpen, onClose, onNotify }) => {
  const { player, demoBalance, subtractDemoBalance, upgradeLand, addToInventory } =
    useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  if (!player) return null;

  const handleBuyLand = (newSize: 4 | 5 | 6) => {
    const price = LAND_PRICES[newSize];

    // Must upgrade step by step: 3→4→5→6
    const expectedSize = player.landSize + 1;
    if (newSize !== expectedSize) {
      if (newSize < expectedSize) {
        onNotify('info', l('You already own this or a larger farm!', '你已經擁有這個或更大的農地了！'));
      } else {
        onNotify('error', l(`Must upgrade to ${expectedSize}×${expectedSize} first!`, `必須先升級到 ${expectedSize}×${expectedSize}！`));
      }
      return;
    }

    if (demoBalance < price) {
      onNotify('error', l(`Not enough GOLD! Need ${price}`, `GOLD 不足！需要 ${price}`));
      return;
    }

    if (subtractDemoBalance(price)) {
      upgradeLand(newSize);
      onNotify('success', l(`Successfully upgraded to ${newSize}×${newSize} farm!`, `成功升級到 ${newSize}×${newSize} 農地！`));
    }
  };

  const handleBuyItem = (itemId: string, price: number, name: string, nameCn: string) => {
    if (demoBalance < price) {
      onNotify('error', l(`Not enough GOLD! Need ${price}`, `GOLD 不足！需要 ${price}`));
      return;
    }

    const displayName = language === 'en' ? name : l(name, nameCn);
    if (subtractDemoBalance(price)) {
      addToInventory(itemId, 1);
      onNotify('success', l(`Purchased ${displayName}!`, `購買了 ${displayName}！`));
    }
  };

  const landItems = SHOP_ITEMS.filter((item) => item.type === 'land');
  const toolItems = SHOP_ITEMS.filter((item) => item.type === 'tool');
  const boostItems = SHOP_ITEMS.filter((item) => item.type === 'boost');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={l('Shop', '商店')} size="lg">
      <div className="space-y-6">
        {/* Balance display */}
        <div className="flex items-center justify-between p-3 bg-space-gray rounded-lg">
          <span className="text-gray-300">{l('Your Balance:', '你的餘額：')}</span>
          <span className="text-xl font-bold text-space-cyan">
            {demoBalance.toFixed(0)} GOLD
          </span>
        </div>

        {/* Land Upgrades */}
        <div>
          <h3 className="text-lg font-bold text-space-cyan mb-3">
            {l('Land Upgrades', '農地升級')}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {landItems.map((item) => {
              const size = parseInt(item.id.split('_')[1]) as 4 | 5 | 6;
              const isOwned = player.landSize >= size;
              const isNextLevel = size === player.landSize + 1;
              const isLocked = size > player.landSize + 1;
              const canAfford = demoBalance >= item.price;
              const itemName = language === 'en' ? item.name : l(item.name, item.nameCn);
              const itemDesc = language === 'en' ? item.description : l(item.description, item.descriptionCn || item.description);

              return (
                <div
                  key={item.id}
                  className={`card-hover p-4 text-center relative ${isOwned ? 'opacity-50' : ''} ${isLocked ? 'opacity-40' : ''}`}
                >
                  {isNextLevel && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {l('Upgradable', '可升級')}
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <span className="text-gray-400 text-sm">🔒 {l(`Upgrade to ${player.landSize + 1}×${player.landSize + 1} first`, `先升級 ${player.landSize + 1}×${player.landSize + 1}`)}</span>
                    </div>
                  )}
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{itemName}</h4>
                  <p className="text-xs text-gray-400 mt-1">{itemDesc}</p>
                  <div className="mt-3">
                    {isOwned ? (
                      <span className="text-green-400 text-sm">✓ {l('Owned', '已擁有')}</span>
                    ) : isLocked ? (
                      <span className="text-gray-500 text-sm">{item.price} GOLD</span>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handleBuyLand(size)}
                      >
                        {item.price} GOLD
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-lg font-bold text-space-cyan mb-3">{l('Tools', '工具')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {toolItems.map((item) => {
              const canAfford = demoBalance >= item.price;
              const itemName = language === 'en' ? item.name : l(item.name, item.nameCn);
              const itemDesc = language === 'en' ? item.description : l(item.description, item.descriptionCn || item.description);

              return (
                <div key={item.id} className="card-hover p-4 text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{itemName}</h4>
                  <p className="text-xs text-gray-400 mt-1">{itemDesc}</p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => handleBuyItem(item.id, item.price, item.name, item.nameCn)}
                    >
                      {item.price} GOLD
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Boosts */}
        <div>
          <h3 className="text-lg font-bold text-space-cyan mb-3">{l('Boosts', '加成道具')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {boostItems.map((item) => {
              const canAfford = demoBalance >= item.price;
              const itemName = language === 'en' ? item.name : l(item.name, item.nameCn);
              const itemDesc = language === 'en' ? item.description : l(item.description, item.descriptionCn || item.description);

              return (
                <div key={item.id} className="card-hover p-4 text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{itemName}</h4>
                  <p className="text-xs text-gray-400 mt-1">{itemDesc}</p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => handleBuyItem(item.id, item.price, item.name, item.nameCn)}
                    >
                      {item.price} GOLD
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
