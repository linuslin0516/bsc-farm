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
    if (demoBalance < price) {
      onNotify('error', `Not enough $FARM! Need ${price}`);
      return;
    }

    if (player.landSize >= newSize) {
      onNotify('info', 'You already have this land size or larger!');
      return;
    }

    if (subtractDemoBalance(price)) {
      upgradeLand(newSize);
      onNotify('success', `Upgraded to ${newSize}x${newSize} land!`);
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
              const canAfford = demoBalance >= item.price;

              return (
                <div
                  key={item.id}
                  className={`card-hover p-4 text-center ${isOwned ? 'opacity-50' : ''}`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-bold mt-2">{item.nameCn}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  <div className="mt-3">
                    {isOwned ? (
                      <span className="text-green-400 text-sm">Owned</span>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handleBuyLand(size)}
                      >
                        {item.price} $FARM
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
