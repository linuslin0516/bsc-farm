import { create } from 'zustand';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { NETWORK, FARM_TOKEN, ERC20_ABI } from '../config/constants';

interface WalletStore {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;

  // Balances
  bnbBalance: string;
  farmBalance: string;

  // Provider
  provider: BrowserProvider | null;

  // Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshBalances: () => Promise<void>;

  // Token interactions
  transferFarm: (to: string, amount: string) => Promise<string | null>;

  // Helpers
  isCorrectNetwork: () => boolean;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  address: null,
  chainId: null,
  bnbBalance: '0',
  farmBalance: '0',
  provider: null,

  connect: async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application!');
      return false;
    }

    set({ isConnecting: true });

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        set({ isConnecting: false });
        return false;
      }

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const address = accounts[0] as string;

      set({
        isConnected: true,
        isConnecting: false,
        address,
        chainId,
        provider,
      });

      // Setup event listeners
      window.ethereum.on('accountsChanged', (newAccounts: unknown) => {
        const accounts = newAccounts as string[];
        if (accounts.length === 0) {
          get().disconnect();
        } else {
          set({ address: accounts[0] });
          get().refreshBalances();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Refresh balances
      await get().refreshBalances();

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ isConnecting: false });
      return false;
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      chainId: null,
      bnbBalance: '0',
      farmBalance: '0',
      provider: null,
    });
  },

  switchNetwork: async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainIdHex }],
      });
      return true;
    } catch (switchError: unknown) {
      const error = switchError as { code: number };
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NETWORK.chainIdHex,
                chainName: NETWORK.chainName,
                nativeCurrency: NETWORK.nativeCurrency,
                rpcUrls: NETWORK.rpcUrls,
                blockExplorerUrls: NETWORK.blockExplorerUrls,
              },
            ],
          });
          return true;
        } catch {
          console.error('Failed to add network');
          return false;
        }
      }
      console.error('Failed to switch network:', switchError);
      return false;
    }
  },

  refreshBalances: async () => {
    const { provider, address } = get();
    if (!provider || !address) return;

    try {
      // Get BNB balance
      const bnbBalance = await provider.getBalance(address);
      set({ bnbBalance: formatEther(bnbBalance) });

      // Get FARM token balance if contract address is set
      if (FARM_TOKEN.address) {
        const tokenContract = new Contract(FARM_TOKEN.address, ERC20_ABI, provider);
        const farmBalance = await tokenContract.balanceOf(address);
        set({ farmBalance: formatEther(farmBalance) });
      }
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  },

  transferFarm: async (to: string, amount: string) => {
    const { provider, address } = get();
    if (!provider || !address || !FARM_TOKEN.address) {
      console.error('Wallet not connected or token address not set');
      return null;
    }

    try {
      const signer = await provider.getSigner();
      const tokenContract = new Contract(FARM_TOKEN.address, ERC20_ABI, signer);

      const tx = await tokenContract.transfer(to, parseEther(amount));
      await tx.wait();

      await get().refreshBalances();
      return tx.hash;
    } catch (error) {
      console.error('Transfer failed:', error);
      return null;
    }
  },

  isCorrectNetwork: () => {
    const { chainId } = get();
    return chainId === NETWORK.chainId;
  },
}));
