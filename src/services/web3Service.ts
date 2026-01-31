import { ethers } from 'ethers';
import { BSC_TESTNET, ERC20_ABI } from '../config/constants';

// Use testnet for development
const NETWORK = BSC_TESTNET;

// $FARM Token Contract Address (replace with your actual contract after deploying on FLAP)
// For testing, we'll use a placeholder - you'll update this after launching on FLAP
export const FARM_TOKEN_ADDRESS = import.meta.env.VITE_FARM_TOKEN_ADDRESS || '';

// Extend Window interface for ethereum
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

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  bnbBalance: string;
  farmBalance: string;
  isCorrectNetwork: boolean;
}

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask === true;
};

/**
 * Get the current provider
 */
export const getProvider = (): ethers.BrowserProvider | null => {
  if (!isMetaMaskInstalled()) return null;
  return new ethers.BrowserProvider(window.ethereum!);
};

/**
 * Get the signer for transactions
 */
export const getSigner = async (): Promise<ethers.Signer | null> => {
  const provider = getProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch {
    return null;
  }
};

/**
 * Connect to MetaMask
 */
export const connectWallet = async (): Promise<Web3State> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('請安裝 MetaMask 錢包');
  }

  try {
    // Request account access
    const accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('無法獲取錢包地址');
    }

    const address = accounts[0];

    // Get chain ID
    const chainIdHex = await window.ethereum!.request({
      method: 'eth_chainId',
    }) as string;
    const chainId = parseInt(chainIdHex, 16);

    // Check if on correct network
    const isCorrectNetwork = chainId === NETWORK.chainId;

    // Get balances
    const provider = getProvider()!;
    const bnbBalance = await provider.getBalance(address);

    let farmBalance = '0';
    if (FARM_TOKEN_ADDRESS && isCorrectNetwork) {
      try {
        farmBalance = await getFarmBalance(address);
      } catch (error) {
        console.warn('Failed to get FARM balance:', error);
      }
    }

    return {
      isConnected: true,
      address,
      chainId,
      bnbBalance: ethers.formatEther(bnbBalance),
      farmBalance,
      isCorrectNetwork,
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

/**
 * Disconnect wallet (clear state, MetaMask doesn't truly disconnect)
 */
export const disconnectWallet = (): Web3State => {
  return {
    isConnected: false,
    address: null,
    chainId: null,
    bnbBalance: '0',
    farmBalance: '0',
    isCorrectNetwork: false,
  };
};

/**
 * Switch to a different wallet account
 * This will open MetaMask's account selection popup
 */
export const switchWalletAccount = async (): Promise<Web3State> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('請安裝 MetaMask 錢包');
  }

  try {
    // Request permissions again - this forces MetaMask to show account selection
    await window.ethereum!.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });

    // After user selects account, get the new account
    const accounts = await window.ethereum!.request({
      method: 'eth_accounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('無法獲取錢包地址');
    }

    const address = accounts[0];

    // Get chain ID
    const chainIdHex = await window.ethereum!.request({
      method: 'eth_chainId',
    }) as string;
    const chainId = parseInt(chainIdHex, 16);

    // Check if on correct network
    const isCorrectNetwork = chainId === NETWORK.chainId;

    // Get balances
    const provider = getProvider()!;
    const bnbBalance = await provider.getBalance(address);

    let farmBalance = '0';
    if (FARM_TOKEN_ADDRESS && isCorrectNetwork) {
      try {
        farmBalance = await getFarmBalance(address);
      } catch (error) {
        console.warn('Failed to get FARM balance:', error);
      }
    }

    return {
      isConnected: true,
      address,
      chainId,
      bnbBalance: ethers.formatEther(bnbBalance),
      farmBalance,
      isCorrectNetwork,
    };
  } catch (error) {
    console.error('Failed to switch wallet:', error);
    throw error;
  }
};

/**
 * Switch to BSC network
 */
export const switchToBSC = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;

  try {
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    if ((switchError as { code?: number }).code === 4902) {
      try {
        await window.ethereum!.request({
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
        return false;
      }
    }
    return false;
  }
};

/**
 * Get FARM token balance
 */
export const getFarmBalance = async (address: string): Promise<string> => {
  if (!FARM_TOKEN_ADDRESS) {
    console.warn('FARM token address not configured');
    return '0';
  }

  const provider = getProvider();
  if (!provider) return '0';

  try {
    const contract = new ethers.Contract(FARM_TOKEN_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Failed to get FARM balance:', error);
    return '0';
  }
};

/**
 * Get BNB balance
 */
export const getBnbBalance = async (address: string): Promise<string> => {
  const provider = getProvider();
  if (!provider) return '0';

  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get BNB balance:', error);
    return '0';
  }
};

/**
 * Transfer FARM tokens
 */
export const transferFarm = async (
  toAddress: string,
  amount: string
): Promise<string | null> => {
  if (!FARM_TOKEN_ADDRESS) {
    throw new Error('FARM token address not configured');
  }

  const signer = await getSigner();
  if (!signer) {
    throw new Error('Wallet not connected');
  }

  try {
    const contract = new ethers.Contract(FARM_TOKEN_ADDRESS, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const tx = await contract.transfer(toAddress, amountInWei);
    const receipt = await tx.wait();

    return receipt.hash;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

/**
 * Approve spending of FARM tokens (for future DEX integration)
 */
export const approveFarmSpending = async (
  spenderAddress: string,
  amount: string
): Promise<string | null> => {
  if (!FARM_TOKEN_ADDRESS) {
    throw new Error('FARM token address not configured');
  }

  const signer = await getSigner();
  if (!signer) {
    throw new Error('Wallet not connected');
  }

  try {
    const contract = new ethers.Contract(FARM_TOKEN_ADDRESS, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const tx = await contract.approve(spenderAddress, amountInWei);
    const receipt = await tx.wait();

    return receipt.hash;
  } catch (error) {
    console.error('Approval failed:', error);
    throw error;
  }
};

/**
 * Listen for account changes
 */
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (!isMetaMaskInstalled()) return;
  window.ethereum!.on('accountsChanged', callback as (...args: unknown[]) => void);
};

/**
 * Listen for chain changes
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (!isMetaMaskInstalled()) return;
  window.ethereum!.on('chainChanged', callback as (...args: unknown[]) => void);
};

/**
 * Remove account change listener
 */
export const removeAccountsChangedListener = (callback: (accounts: string[]) => void): void => {
  if (!isMetaMaskInstalled()) return;
  window.ethereum!.removeListener('accountsChanged', callback as (...args: unknown[]) => void);
};

/**
 * Remove chain change listener
 */
export const removeChainChangedListener = (callback: (chainId: string) => void): void => {
  if (!isMetaMaskInstalled()) return;
  window.ethereum!.removeListener('chainChanged', callback as (...args: unknown[]) => void);
};

/**
 * Format address for display (0x1234...5678)
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format token balance for display
 */
export const formatTokenBalance = (balance: string, decimals: number = 4): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
};
