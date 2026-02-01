import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/useGameStore';
import { SHOP_ITEMS, LAND_PRICES } from '../../data/shop';

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const Shop: React.FC<ShopProps> = ({ isOpen, onClose, onNotify }) => {
  const { player, demoBalance, subtractDemoBalance, upgradeLand, addToInventory } =
    useGameStore();

  if (!player) return null;

  const handleBuyLand = (newSize: 4 | 5 | 6) => {
    const price = LAND_PRICES[newSize];

    // Must upgrade step by step: 3→4→5→6
    const expectedSize = player.landSize + 1;
    if (newSize !== expectedSize) {
      if (newSize < expectedSize) {
        onNotify('info', '你已經擁有這個或更大的農地了！');
      } else {
        onNotify('error', `必須先升級到 ${expectedSize}×${expectedSize}！`);
      }
      return;
    }

    if (demoBalance < price) {
      onNotify('error', `GOLD 不足！需要 ${price}`);
      return;
    }

    if (subtractDemoBalance(price)) {
      upgradeLand(newSize);
      onNotify('success', `成功升級到 ${newSize}×${newSize} 農地！`);
    }
  };

  const handleBuyItem = (itemId: string, price: number, name: string) => {
    if (demoBalance < price) {
      onNotify('error', `Not enough $FARM! Need ${price}`);
      return;
    }

    if (subtractDemoBalance(price)) {
      addToInventory(itemId, 1);
      onNotify('success', `Purchased ${name}!`);
    }
  };

  const landItems = SHOP_ITEMS.filter((item) => item.type === 'land');
  const toolItems = SHOP_ITEMS.filter((item) => item.type === 'tool');
  const boostItems = SHOP_ITEMS.filter((item) => item.type === 'boost');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shop" size="lg">
      <div className="space-y-6">
        {/* Balance display */}
        <div className="flex items-center justify-between p-3 bg-binance-gray rounded-lg">
          <span className="text-gray-300">Your Balance:</span>
          <span className="text-xl font-bold text-binance-yellow">
            {demoBalance.toFixed(0)} $FARM
          </span>
        </div>

        {/* Land Upgrades */}
        <div>
          <h3 className="text-lg font-bold text-binance-yellow mb-3">
            Land Upgrades
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {landItems.map((item) => {
              const size = parseInt(item.id.split('_')[1]) as 4 | 5 | 6;
              const isOwned = player.landSize >= size;
              const isNextLevel = size === player.landSize + 1;
              const isLocked = size > player.landSize + 1;
              const canAfford = demoBalance >= item.price;

              return (
                <div
                  key={item.id}
                  className={`card-hover p-4 text-center relative ${isOwned ? 'opacity-50' : ''} ${isLocked ? 'opacity-40' : ''}`}
                >
                  {isNextLevel && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      可升級
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <span className="text-gray-400 text-sm">🔒 先升級 {player.landSize + 1}×{player.landSize + 1}</span>
                    </div>
                  )}
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{item.nameCn}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  <div className="mt-3">
                    {isOwned ? (
                      <span className="text-green-400 text-sm">✓ 已擁有</span>
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
          <h3 className="text-lg font-bold text-binance-yellow mb-3">Tools</h3>
          <div className="grid grid-cols-3 gap-3">
            {toolItems.map((item) => {
              const canAfford = demoBalance >= item.price;

              return (
                <div key={item.id} className="card-hover p-4 text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{item.nameCn}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => handleBuyItem(item.id, item.price, item.nameCn)}
                    >
                      {item.price} $FARM
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Boosts */}
        <div>
          <h3 className="text-lg font-bold text-binance-yellow mb-3">Boosts</h3>
          <div className="grid grid-cols-3 gap-3">
            {boostItems.map((item) => {
              const canAfford = demoBalance >= item.price;

              return (
                <div key={item.id} className="card-hover p-4 text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{item.nameCn}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => handleBuyItem(item.id, item.price, item.nameCn)}
                    >
                      {item.price} $FARM
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
