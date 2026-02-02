import { create } from 'zustand';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { NETWORK, FARM_TOKEN, ERC20_ABI } from '../config/constants';
import {
  WalletType,
  WalletInfo,
  detectWallets,
  getWalletOptions,
  setActiveWallet,
  getActiveProvider,
  getWalletDownloadUrl,
} from '../services/web3Service';

interface WalletStore {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  walletType: WalletType | null;

  // Balances
  bnbBalance: string;
  farmBalance: string;

  // Provider
  provider: BrowserProvider | null;

  // Wallet detection
  availableWallets: WalletInfo[];
  detectAvailableWallets: () => WalletInfo[];

  // Actions
  connect: (walletType?: WalletType) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshBalances: () => Promise<void>;

  // Token interactions
  transferFarm: (to: string, amount: string) => Promise<string | null>;

  // Helpers
  isCorrectNetwork: () => boolean;
  getDownloadUrl: (walletType: WalletType) => string;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  address: null,
  chainId: null,
  walletType: null,
  bnbBalance: '0',
  farmBalance: '0',
  provider: null,
  availableWallets: [],

  detectAvailableWallets: () => {
    const wallets = getWalletOptions();
    set({ availableWallets: wallets });
    return wallets;
  },

  connect: async (walletType?: WalletType) => {
    // Detect available wallets
    const wallets = detectWallets();

    if (wallets.length === 0) {
      alert('請安裝 Web3 錢包（MetaMask、OKX Wallet 或 Trust Wallet）');
      return false;
    }

    // Set the wallet type
    if (walletType) {
      const success = setActiveWallet(walletType);
      if (!success) {
        console.error('Failed to set wallet:', walletType);
        return false;
      }
    } else {
      // Use first available wallet
      setActiveWallet(wallets[0].type);
      walletType = wallets[0].type;
    }

    const activeProvider = getActiveProvider();
    if (!activeProvider) {
      alert('無法連接錢包');
      return false;
    }

    set({ isConnecting: true });

    try {
      const provider = new BrowserProvider(activeProvider as import('ethers').Eip1193Provider);
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
        walletType,
        provider,
      });

      // Setup event listeners
      activeProvider.on('accountsChanged', (newAccounts: unknown) => {
        const accounts = newAccounts as string[];
        if (accounts.length === 0) {
          get().disconnect();
        } else {
          set({ address: accounts[0] });
          get().refreshBalances();
        }
      });

      activeProvider.on('chainChanged', () => {
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
      walletType: null,
      bnbBalance: '0',
      farmBalance: '0',
      provider: null,
    });
  },

  switchNetwork: async () => {
    const activeProvider = getActiveProvider();
    if (!activeProvider) return false;

    try {
      await activeProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainIdHex }],
      });
      return true;
    } catch (switchError: unknown) {
      const error = switchError as { code: number };
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await activeProvider.request({
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

  getDownloadUrl: (walletType: WalletType) => {
    return getWalletDownloadUrl(walletType);
  },
}));
