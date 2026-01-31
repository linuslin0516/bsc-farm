import React, { useState, useEffect } from 'react';
import { useWeb3Store } from '../../store/useWeb3Store';
import { useGameStore } from '../../store/useGameStore';
import {
  getExchangeRate,
  calculateGoldToFarm,
  calculateFarmToGold,
  exchangeGoldForFarm,
  exchangeFarmForGold,
  canExchange,
  getUserExchangeData,
  formatGold,
  formatFarm,
} from '../../services/exchangeService';
import { ExchangeRate, UserExchangeData } from '../../types';
import { Modal } from '../ui/Modal';

interface TokenExchangePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

type ExchangeDirection = 'gold_to_farm' | 'farm_to_gold';

export const TokenExchangePanel: React.FC<TokenExchangePanelProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const { isConnected, address, farmBalance, refreshBalances } = useWeb3Store();
  const { goldBalance, subtractGoldBalance, addGoldBalance, player } = useGameStore();

  const [direction, setDirection] = useState<ExchangeDirection>('farm_to_gold');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [userData, setUserData] = useState<UserExchangeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);

  // Calculate output
  const [outputAmount, setOutputAmount] = useState(0);
  const [fee, setFee] = useState(0);

  // Load exchange rate and user data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [rateData, userDataResult] = await Promise.all([
          getExchangeRate(),
          player?.oderId ? getUserExchangeData(player.oderId) : null,
        ]);
        setRate(rateData);
        if (userDataResult) setUserData(userDataResult);
      } catch (error) {
        console.error('Failed to load exchange data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, player?.oderId]);

  // Calculate output when amount changes
  useEffect(() => {
    const calculateOutput = async () => {
      const numAmount = parseFloat(amount) || 0;
      if (numAmount <= 0) {
        setOutputAmount(0);
        setFee(0);
        return;
      }

      try {
        if (direction === 'gold_to_farm') {
          const result = await calculateGoldToFarm(numAmount);
          setOutputAmount(result.netFarmAmount);
          setFee(result.fee);
        } else {
          const result = await calculateFarmToGold(numAmount);
          setOutputAmount(result.netGoldAmount);
          setFee(result.fee);
        }
      } catch (error) {
        console.error('Failed to calculate:', error);
      }
    };

    calculateOutput();
  }, [amount, direction]);

  // Handle exchange
  const handleExchange = async () => {
    if (!isConnected || !address || !player?.oderId) {
      onNotify('error', '請先連接錢包');
      return;
    }

    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      onNotify('error', '請輸入有效金額');
      return;
    }

    setIsExchanging(true);

    try {
      if (direction === 'gold_to_farm') {
        // Check GOLD balance
        if (goldBalance < numAmount) {
          throw new Error(`GOLD 餘額不足。當前餘額: ${formatGold(goldBalance)}`);
        }

        // Check daily limit
        const limitCheck = await canExchange(player.oderId, outputAmount);
        if (!limitCheck.canExchange) {
          throw new Error(limitCheck.reason);
        }

        // Deduct GOLD first
        if (!subtractGoldBalance(numAmount)) {
          throw new Error('扣除 GOLD 失敗');
        }

        // Create exchange request
        const tx = await exchangeGoldForFarm(player.oderId, address, numAmount);

        onNotify('success', `兌換請求已提交！交易 ID: ${tx.id.slice(0, 8)}...`);
        onNotify('info', 'FARM 將在確認後發送到您的錢包');
      } else {
        // FARM to GOLD
        const tx = await exchangeFarmForGold(player.oderId, address, numAmount);

        // Add GOLD to game balance
        addGoldBalance(Math.floor(outputAmount));

        onNotify('success', `兌換成功！獲得 ${formatGold(Math.floor(outputAmount))} GOLD`);
        if (tx.txHash) {
          onNotify('info', `交易哈希: ${tx.txHash.slice(0, 10)}...`);
        }

        // Refresh wallet balance
        await refreshBalances();
      }

      // Reset form
      setAmount('');
      setOutputAmount(0);
      setFee(0);

      // Reload user data
      if (player?.oderId) {
        const newUserData = await getUserExchangeData(player.oderId);
        setUserData(newUserData);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '兌換失敗';
      onNotify('error', message);

      // If GOLD was deducted but exchange failed, refund it
      if (direction === 'gold_to_farm') {
        addGoldBalance(numAmount);
      }
    } finally {
      setIsExchanging(false);
    }
  };

  // Set max amount
  const handleMax = () => {
    if (direction === 'gold_to_farm') {
      setAmount(goldBalance.toString());
    } else {
      setAmount(farmBalance);
    }
  };

  // Toggle direction
  const toggleDirection = () => {
    setDirection((prev) =>
      prev === 'gold_to_farm' ? 'farm_to_gold' : 'gold_to_farm'
    );
    setAmount('');
    setOutputAmount(0);
    setFee(0);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💱 代幣兌換">
      <div className="space-y-4">
        {/* Connection Warning */}
        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-yellow-400">請先連接錢包以使用兌換功能</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">載入中...</p>
          </div>
        ) : (
          <>
            {/* Exchange Rate Info */}
            {rate && (
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-2">當前匯率</div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold">1 $FARM</span>
                    <span className="text-gray-400 mx-2">=</span>
                    <span className="text-yellow-400 font-bold">
                      {formatGold(rate.goldPerFarm)} GOLD
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    手續費: {(rate.exchangeFee * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}

            {/* Daily Limit */}
            {userData && rate && (
              <div className="bg-blue-500/10 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">今日已兌換</span>
                  <span className="text-white">
                    {formatFarm(userData.dailyExchanged)} / {rate.dailyExchangeLimit} FARM
                  </span>
                </div>
              </div>
            )}

            {/* Exchange Form */}
            <div className="bg-black/20 rounded-xl p-4 space-y-4">
              {/* From */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">從</span>
                  <button
                    onClick={handleMax}
                    className="text-green-400 text-xs hover:underline"
                  >
                    最大
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-white text-xl font-bold outline-none"
                    disabled={!isConnected}
                  />
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                    <span className="text-2xl">
                      {direction === 'gold_to_farm' ? '🪙' : '🌾'}
                    </span>
                    <span className="text-white font-bold">
                      {direction === 'gold_to_farm' ? 'GOLD' : '$FARM'}
                    </span>
                  </div>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  餘額:{' '}
                  {direction === 'gold_to_farm'
                    ? formatGold(goldBalance)
                    : formatFarm(farmBalance)}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={toggleDirection}
                  className="p-3 bg-green-500/20 rounded-full hover:bg-green-500/30 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* To */}
              <div>
                <div className="text-gray-400 text-sm mb-2">到</div>
                <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                  <div className="flex-1 text-white text-xl font-bold">
                    {direction === 'gold_to_farm'
                      ? formatFarm(outputAmount)
                      : formatGold(Math.floor(outputAmount))}
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                    <span className="text-2xl">
                      {direction === 'gold_to_farm' ? '🌾' : '🪙'}
                    </span>
                    <span className="text-white font-bold">
                      {direction === 'gold_to_farm' ? '$FARM' : 'GOLD'}
                    </span>
                  </div>
                </div>
                {fee > 0 && (
                  <div className="text-gray-400 text-xs mt-1">
                    手續費: {direction === 'gold_to_farm' ? formatFarm(fee) : formatGold(Math.floor(fee))}
                  </div>
                )}
              </div>
            </div>

            {/* Exchange Button */}
            <button
              onClick={handleExchange}
              disabled={!isConnected || isExchanging || !amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500
                       text-white font-bold rounded-xl text-lg
                       hover:from-green-600 hover:to-emerald-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all transform hover:scale-[1.02]"
            >
              {isExchanging ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  處理中...
                </span>
              ) : (
                <>
                  {direction === 'gold_to_farm' ? '兌換 $FARM (提現)' : '兌換 GOLD (充值)'}
                </>
              )}
            </button>

            {/* Info */}
            <div className="text-gray-400 text-xs space-y-1">
              <p>• GOLD → FARM: 將遊戲金幣兌換成鏈上代幣</p>
              <p>• FARM → GOLD: 將鏈上代幣充值到遊戲中使用</p>
              <p>• 兌換需要支付 {rate ? (rate.exchangeFee * 100).toFixed(0) : 5}% 手續費</p>
              <p>• 每日兌換上限: {rate?.dailyExchangeLimit || 100} FARM</p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
