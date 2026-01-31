import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  connectWallet,
  disconnectWallet,
  switchToBSC,
  switchWalletAccount,
  getFarmBalance,
  getBnbBalance,
  onAccountsChanged,
  onChainChanged,
  isMetaMaskInstalled,
  Web3State,
} from '../services/web3Service';
import { BSC_TESTNET } from '../config/constants';

interface Web3Store extends Web3State {
  // State
  isConnecting: boolean;
  error: string | null;

  // Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  switchWallet: () => Promise<boolean>;
  switchNetwork: () => Promise<boolean>;
  refreshBalances: () => Promise<void>;
  clearError: () => void;
  initializeListeners: () => void;

  // Internal
  setError: (error: string | null) => void;
  updateState: (state: Partial<Web3State>) => void;
}

export const useWeb3Store = create<Web3Store>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      address: null,
      chainId: null,
      bnbBalance: '0',
      farmBalance: '0',
      isCorrectNetwork: false,
      isConnecting: false,
      error: null,

      // Connect wallet
      connect: async () => {
        if (!isMetaMaskInstalled()) {
          set({ error: '請安裝 MetaMask 錢包' });
          return false;
        }

        set({ isConnecting: true, error: null });

        try {
          const state = await connectWallet();
          set({
            ...state,
            isConnecting: false,
            error: null,
          });

          // If not on correct network, prompt to switch
          if (!state.isCorrectNetwork) {
            const switched = await get().switchNetwork();
            if (!switched) {
              set({ error: '請切換到 BNB Smart Chain 網路' });
            }
          }

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : '連接錢包失敗';
          set({
            isConnecting: false,
            error: message,
          });
          return false;
        }
      },

      // Disconnect wallet
      disconnect: () => {
        const state = disconnectWallet();
        set({
          ...state,
          error: null,
        });
      },

      // Switch to a different wallet account
      switchWallet: async () => {
        set({ isConnecting: true, error: null });

        try {
          const state = await switchWalletAccount();
          set({
            ...state,
            isConnecting: false,
            error: null,
          });

          // If not on correct network, prompt to switch
          if (!state.isCorrectNetwork) {
            const switched = await get().switchNetwork();
            if (!switched) {
              set({ error: '請切換到 BNB Smart Chain 網路' });
            }
          }

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : '切換錢包失敗';
          set({
            isConnecting: false,
            error: message,
          });
          return false;
        }
      },

      // Switch to BSC network
      switchNetwork: async () => {
        try {
          const success = await switchToBSC();
          if (success) {
            set({ isCorrectNetwork: true, chainId: BSC_TESTNET.chainId });
            // Refresh balances after switching
            await get().refreshBalances();
          }
          return success;
        } catch (error) {
          console.error('Failed to switch network:', error);
          return false;
        }
      },

      // Refresh balances
      refreshBalances: async () => {
        const { address, isConnected } = get();
        if (!isConnected || !address) return;

        try {
          const [bnbBalance, farmBalance] = await Promise.all([
            getBnbBalance(address),
            getFarmBalance(address),
          ]);

          set({ bnbBalance, farmBalance });
        } catch (error) {
          console.error('Failed to refresh balances:', error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set error
      setError: (error) => set({ error }),

      // Update state
      updateState: (newState) => set(newState),

      // Initialize event listeners
      initializeListeners: () => {
        // Account change handler
        const handleAccountsChanged = async (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected
            get().disconnect();
          } else {
            // Account changed
            set({ address: accounts[0] });
            await get().refreshBalances();
          }
        };

        // Chain change handler
        const handleChainChanged = (chainIdHex: string) => {
          const chainId = parseInt(chainIdHex, 16);
          const isCorrectNetwork = chainId === BSC_TESTNET.chainId;
          set({ chainId, isCorrectNetwork });

          if (isCorrectNetwork) {
            get().refreshBalances();
          }
        };

        onAccountsChanged(handleAccountsChanged);
        onChainChanged(handleChainChanged);
      },
    }),
    {
      name: 'bsc-farm-web3',
      partialize: (state) => ({
        // Only persist essential connection info
        address: state.address,
        isConnected: state.isConnected,
      }),
    }
  )
);
