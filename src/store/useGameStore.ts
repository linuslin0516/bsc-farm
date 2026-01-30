import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Player,
  FarmCell,
  PlantedCrop,
  InventoryItem,
  Transaction,
  CropStage,
  Position,
} from '../types';
import { getCropById } from '../data/crops';
import { GAME_CONFIG, getExpForLevel, STORAGE_KEYS } from '../config/constants';
import { updateFarmCells } from '../services/userService';

interface GameStore {
  // Player state
  player: Player | null;
  setPlayer: (player: Player | null) => void;
  updatePlayerName: (name: string) => void;
  addExperience: (exp: number) => void;
  upgradeLand: (newSize: 4 | 5 | 6) => void;

  // Farm state
  farmCells: FarmCell[];
  initializeFarm: (size: number) => void;
  plantCrop: (position: Position, cropId: string) => void;
  harvestCrop: (position: Position) => PlantedCrop | null;
  updateCropStages: () => void;
  syncFarmToFirebase: () => Promise<void>;

  // Inventory
  inventory: InventoryItem[];
  addToInventory: (itemId: string, quantity: number) => void;
  removeFromInventory: (itemId: string, quantity: number) => boolean;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;

  // Selection state
  selectedCrop: string | null;
  setSelectedCrop: (cropId: string | null) => void;

  // Demo mode balance (when no real token)
  demoBalance: number;
  setDemoBalance: (balance: number) => void;
  addDemoBalance: (amount: number) => void;
  subtractDemoBalance: (amount: number) => boolean;

  // Reset
  resetGame: () => void;
}

const createInitialFarmCells = (size: number): FarmCell[] => {
  const cells: FarmCell[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      cells.push({
        position: { x, y },
        isUnlocked: true,
      });
    }
  }
  return cells;
};

const getCropStage = (plantedAt: number, growthTime: number): CropStage => {
  const now = Date.now();
  const elapsed = (now - plantedAt) / 1000; // in seconds
  const progress = elapsed / growthTime;

  if (progress < 0.25) return 'seed';
  if (progress < 0.5) return 'sprout';
  if (progress < 1) return 'growing';
  return 'mature';
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Player
      player: null,
      setPlayer: (player) => set({ player }),
      updatePlayerName: (name) =>
        set((state) => ({
          player: state.player ? { ...state.player, name } : null,
        })),
      addExperience: (exp) =>
        set((state) => {
          if (!state.player) return state;
          let newExp = state.player.experience + exp;
          let newLevel = state.player.level;

          // Check for level up
          while (newExp >= getExpForLevel(newLevel) && newLevel < GAME_CONFIG.MAX_LEVEL) {
            newExp -= getExpForLevel(newLevel);
            newLevel++;
          }

          return {
            player: {
              ...state.player,
              experience: newExp,
              level: newLevel,
            },
          };
        }),
      upgradeLand: (newSize) =>
        set((state) => {
          if (!state.player) return state;
          const newCells = createInitialFarmCells(newSize);

          // Preserve existing planted crops
          state.farmCells.forEach((oldCell) => {
            const newCell = newCells.find(
              (c) => c.position.x === oldCell.position.x && c.position.y === oldCell.position.y
            );
            if (newCell && oldCell.plantedCrop) {
              newCell.plantedCrop = oldCell.plantedCrop;
            }
          });

          return {
            player: { ...state.player, landSize: newSize },
            farmCells: newCells,
          };
        }),

      // Farm
      farmCells: [],
      initializeFarm: (size) => set({ farmCells: createInitialFarmCells(size) }),
      plantCrop: (position, cropId) =>
        set((state) => {
          const crop = getCropById(cropId);
          if (!crop) return state;

          const newPlantedCrop: PlantedCrop = {
            id: `${cropId}_${Date.now()}`,
            cropId,
            plantedAt: Date.now(),
            position,
            stage: 'seed',
          };

          return {
            farmCells: state.farmCells.map((cell) =>
              cell.position.x === position.x && cell.position.y === position.y
                ? { ...cell, plantedCrop: newPlantedCrop }
                : cell
            ),
          };
        }),
      harvestCrop: (position) => {
        const state = get();
        const cell = state.farmCells.find(
          (c) => c.position.x === position.x && c.position.y === position.y
        );
        if (!cell?.plantedCrop) return null;

        const crop = getCropById(cell.plantedCrop.cropId);
        if (!crop) return null;

        const stage = getCropStage(cell.plantedCrop.plantedAt, crop.growthTime);
        if (stage !== 'mature') return null;

        const harvestedCrop = cell.plantedCrop;

        set({
          farmCells: state.farmCells.map((c) =>
            c.position.x === position.x && c.position.y === position.y
              ? { ...c, plantedCrop: undefined }
              : c
          ),
        });

        return harvestedCrop;
      },
      updateCropStages: () =>
        set((state) => ({
          farmCells: state.farmCells.map((cell) => {
            if (!cell.plantedCrop) return cell;
            const crop = getCropById(cell.plantedCrop.cropId);
            if (!crop) return cell;

            const newStage = getCropStage(cell.plantedCrop.plantedAt, crop.growthTime);
            if (newStage === cell.plantedCrop.stage) return cell;

            return {
              ...cell,
              plantedCrop: { ...cell.plantedCrop, stage: newStage },
            };
          }),
        })),
      syncFarmToFirebase: async () => {
        const state = get();
        if (state.player?.oderId) {
          try {
            await updateFarmCells(state.player.oderId, state.farmCells);
          } catch (error) {
            console.error('Failed to sync farm to Firebase:', error);
          }
        }
      },

      // Inventory
      inventory: [],
      addToInventory: (itemId, quantity) =>
        set((state) => {
          const existing = state.inventory.find((i) => i.itemId === itemId);
          if (existing) {
            return {
              inventory: state.inventory.map((i) =>
                i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            inventory: [...state.inventory, { itemId, quantity }],
          };
        }),
      removeFromInventory: (itemId, quantity) => {
        const state = get();
        const existing = state.inventory.find((i) => i.itemId === itemId);
        if (!existing || existing.quantity < quantity) return false;

        set({
          inventory: state.inventory
            .map((i) =>
              i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
            )
            .filter((i) => i.quantity > 0),
        });
        return true;
      },

      // Transactions
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            { ...transaction, id: `tx_${Date.now()}` },
            ...state.transactions.slice(0, 99), // Keep last 100
          ],
        })),

      // Selection
      selectedCrop: null,
      setSelectedCrop: (cropId) => set({ selectedCrop: cropId }),

      // Demo balance
      demoBalance: GAME_CONFIG.INITIAL_FARM_BALANCE,
      setDemoBalance: (balance) => set({ demoBalance: balance }),
      addDemoBalance: (amount) =>
        set((state) => ({ demoBalance: state.demoBalance + amount })),
      subtractDemoBalance: (amount) => {
        const state = get();
        if (state.demoBalance < amount) return false;
        set({ demoBalance: state.demoBalance - amount });
        return true;
      },

      // Reset
      resetGame: () =>
        set({
          player: null,
          farmCells: [],
          inventory: [],
          transactions: [],
          selectedCrop: null,
          demoBalance: GAME_CONFIG.INITIAL_FARM_BALANCE,
        }),
    }),
    {
      name: STORAGE_KEYS.FARM_STATE,
      partialize: (state) => ({
        player: state.player,
        farmCells: state.farmCells,
        inventory: state.inventory,
        transactions: state.transactions,
        demoBalance: state.demoBalance,
      }),
    }
  )
);
