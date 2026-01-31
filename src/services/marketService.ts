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

// Price fluctuation ranges based on rarity (ONLY UPWARD - price protection)
// Prices can go UP by this percentage, but never below base price
const FLUCTUATION_RANGES: Record<CropRarity, { min: number; max: number }> = {
  common: { min: 0, max: 0.10 },      // 0% to +10%
  uncommon: { min: 0, max: 0.15 },    // 0% to +15%
  rare: { min: 0, max: 0.20 },        // 0% to +20%
  epic: { min: 0, max: 0.25 },        // 0% to +25%
  legendary: { min: 0, max: 0.35 },   // 0% to +35%
};

// Minimum profit margin - ensures players always make profit
const MIN_PROFIT_MARGIN = 0.1; // At least 10% profit on base sell price

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
 * IMPORTANT: Prices only go UP, never below base price (price protection)
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

  // Combine waves and normalize to 0-1 range (instead of -1 to 1)
  const combined = ((primary + secondary + tertiary) / 1.8 + 1) / 2; // Now 0 to 1

  // Scale to the allowed range (min to max)
  const fluctuation = range.min + (combined * (range.max - range.min));

  // Return multiplier (always >= 1.0, so price never drops below base)
  return 1 + fluctuation;
};

/**
 * Calculate minimum sell price with profit protection
 * Ensures players always make at least MIN_PROFIT_MARGIN profit
 */
const getMinimumSellPrice = (cost: number, baseSellPrice: number): number => {
  const minFromCost = cost * (1 + MIN_PROFIT_MARGIN); // At least 10% above cost
  return Math.max(minFromCost, baseSellPrice); // Never below base sell price
};

/**
 * Initialize market data with base prices
 * Includes price protection to ensure players always profit
 */
export const initializeMarketData = async (): Promise<MarketData> => {
  const crops = getAllCrops();
  const now = Date.now();

  const prices: Record<string, CropMarketPrice> = {};

  crops.forEach(crop => {
    const multiplier = generatePriceFluctuation(crop.id, crop.rarity, now);
    const calculatedPrice = Math.round(crop.sellPrice * multiplier);

    // Apply price protection: never sell below cost + profit margin
    const minPrice = getMinimumSellPrice(crop.cost, crop.sellPrice);
    const currentPrice = Math.max(calculatedPrice, minPrice);

    prices[crop.id] = {
      cropId: crop.id,
      basePrice: crop.sellPrice,
      currentPrice,
      priceMultiplier: currentPrice / crop.sellPrice,
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

  console.log('💰 [Market] Initialized with price protection');

  return marketData;
};

/**
 * Force reset market data (use when crop prices have been updated)
 */
export const forceResetMarketData = async (): Promise<MarketData> => {
  console.log('💰 [Market] Force resetting market data...');
  return await initializeMarketData();
};

/**
 * Get current market data
 * Automatically resets if base prices have changed (after crop updates)
 */
export const getMarketData = async (): Promise<MarketData> => {
  const docRef = doc(db, MARKET_COLLECTION, MARKET_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Initialize if doesn't exist
    return await initializeMarketData();
  }

  const data = docSnap.data();
  const crops = getAllCrops();

  // Check if base prices have changed (crop data was updated)
  // If any crop's base price in Firebase doesn't match current definition, reset
  let needsReset = false;
  for (const crop of crops) {
    const storedPrice = data.prices?.[crop.id];
    if (!storedPrice || storedPrice.basePrice !== crop.sellPrice) {
      console.log(`💰 [Market] Detected price change for ${crop.id}: ${storedPrice?.basePrice} -> ${crop.sellPrice}`);
      needsReset = true;
      break;
    }
  }

  if (needsReset) {
    console.log('💰 [Market] Base prices changed, resetting market data...');
    return await initializeMarketData();
  }

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
 * Update all market prices with price protection
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
    const calculatedPrice = Math.round(crop.sellPrice * newMultiplier);

    // Apply price protection: never sell below cost + profit margin
    const minPrice = getMinimumSellPrice(crop.cost, crop.sellPrice);
    const newPrice = Math.max(calculatedPrice, minPrice);

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
      priceMultiplier: newPrice / crop.sellPrice,
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

  console.log('💰 [Market] Prices updated with protection at', new Date(now).toLocaleTimeString());

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
