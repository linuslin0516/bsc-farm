import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CropRarity } from '../types';
import { getAllCrops, getCropById } from '../data/crops';

const MARKET_COLLECTION = 'market';
const MARKET_DOC_ID = 'global_prices';

// Price fluctuation ranges based on rarity
const FLUCTUATION_RANGES: Record<CropRarity, number> = {
  common: 0.05,      // ±5%
  uncommon: 0.10,    // ±10%
  rare: 0.15,        // ±15%
  epic: 0.20,        // ±20%
  legendary: 0.30,   // ±30%
};

export interface CropMarketPrice {
  cropId: string;
  basePrice: number;
  currentPrice: number;
  priceMultiplier: number; // Percentage from base (e.g., 1.15 = +15%)
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

export interface MarketData {
  prices: Record<string, CropMarketPrice>;
  lastGlobalUpdate: number;
}

/**
 * Generate price fluctuation using time-based sine wave
 * This creates natural-looking price cycles
 */
const generatePriceFluctuation = (
  cropId: string,
  rarity: CropRarity,
  timestamp: number
): number => {
  const range = FLUCTUATION_RANGES[rarity];

  // Use crop ID as seed for consistent but different patterns
  const seed = cropId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Create hourly cycles with some randomness
  const hourlyPhase = (timestamp / (1000 * 60 * 60)) + (seed * 0.1);

  // Combine multiple sine waves for more natural fluctuation
  const primary = Math.sin(hourlyPhase * Math.PI);
  const secondary = Math.sin(hourlyPhase * Math.PI * 2.3 + seed) * 0.5;
  const tertiary = Math.sin(hourlyPhase * Math.PI * 0.7 + seed * 1.3) * 0.3;

  // Combine waves and scale to range
  const combined = (primary + secondary + tertiary) / 1.8;
  return 1 + (combined * range);
};

/**
 * Initialize market data with base prices
 */
export const initializeMarketData = async (): Promise<MarketData> => {
  const crops = getAllCrops();
  const now = Date.now();

  const prices: Record<string, CropMarketPrice> = {};

  crops.forEach(crop => {
    const multiplier = generatePriceFluctuation(crop.id, crop.rarity, now);
    const currentPrice = Math.round(crop.sellPrice * multiplier);

    prices[crop.id] = {
      cropId: crop.id,
      basePrice: crop.sellPrice,
      currentPrice,
      priceMultiplier: multiplier,
      trend: 'stable',
      lastUpdated: now,
    };
  });

  const marketData: MarketData = {
    prices,
    lastGlobalUpdate: now,
  };

  // Save to Firebase
  const docRef = doc(db, MARKET_COLLECTION, MARKET_DOC_ID);
  await setDoc(docRef, {
    ...marketData,
    updatedAt: serverTimestamp(),
  });

  return marketData;
};

/**
 * Get current market data
 */
export const getMarketData = async (): Promise<MarketData> => {
  const docRef = doc(db, MARKET_COLLECTION, MARKET_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Initialize if doesn't exist
    return await initializeMarketData();
  }

  const data = docSnap.data();

  // Check if needs update (update every hour)
  const lastUpdate = data.lastGlobalUpdate;
  const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);

  if (hoursSinceUpdate >= 1) {
    // Time to update prices
    return await updateMarketPrices();
  }

  return {
    prices: data.prices,
    lastGlobalUpdate: data.lastGlobalUpdate,
  };
};

/**
 * Update all market prices
 */
export const updateMarketPrices = async (): Promise<MarketData> => {
  const crops = getAllCrops();
  const now = Date.now();

  // Get current data to compare trends
  const docRef = doc(db, MARKET_COLLECTION, MARKET_DOC_ID);
  const docSnap = await getDoc(docRef);
  const oldPrices = docSnap.exists() ? docSnap.data().prices : {};

  const prices: Record<string, CropMarketPrice> = {};

  crops.forEach(crop => {
    const newMultiplier = generatePriceFluctuation(crop.id, crop.rarity, now);
    const newPrice = Math.round(crop.sellPrice * newMultiplier);

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (oldPrices[crop.id]) {
      const oldPrice = oldPrices[crop.id].currentPrice;
      const priceDiff = newPrice - oldPrice;
      const changePercent = Math.abs(priceDiff / oldPrice);

      if (changePercent > 0.02) { // More than 2% change
        trend = priceDiff > 0 ? 'up' : 'down';
      }
    }

    prices[crop.id] = {
      cropId: crop.id,
      basePrice: crop.sellPrice,
      currentPrice: newPrice,
      priceMultiplier: newMultiplier,
      trend,
      lastUpdated: now,
    };
  });

  const marketData: MarketData = {
    prices,
    lastGlobalUpdate: now,
  };

  // Save to Firebase
  await setDoc(docRef, {
    ...marketData,
    updatedAt: serverTimestamp(),
  });

  console.log('💰 [Market] Prices updated at', new Date(now).toLocaleTimeString());

  return marketData;
};

/**
 * Get current price for a specific crop
 */
export const getCropPrice = async (cropId: string): Promise<number> => {
  const marketData = await getMarketData();
  const priceData = marketData.prices[cropId];

  if (!priceData) {
    // Fallback to base price if not found
    const crop = getCropById(cropId);
    return crop?.sellPrice || 0;
  }

  return priceData.currentPrice;
};

/**
 * Get price trend for a crop
 */
export const getCropPriceTrend = async (cropId: string): Promise<'up' | 'down' | 'stable'> => {
  const marketData = await getMarketData();
  const priceData = marketData.prices[cropId];
  return priceData?.trend || 'stable';
};

/**
 * Get all crops sorted by price multiplier (best deals first)
 */
export const getBestDeals = async (limit: number = 5): Promise<CropMarketPrice[]> => {
  const marketData = await getMarketData();
  const prices = Object.values(marketData.prices);

  // Sort by multiplier descending (highest prices = best to sell)
  return prices
    .sort((a, b) => b.priceMultiplier - a.priceMultiplier)
    .slice(0, limit);
};

/**
 * Get price change percentage from base
 */
export const getPriceChangePercent = (priceData: CropMarketPrice): number => {
  return Math.round((priceData.priceMultiplier - 1) * 100);
};
