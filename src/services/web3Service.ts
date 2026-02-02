import { ethers } from 'ethers';
import { NETWORK, USE_MAINNET, ERC20_ABI } from '../config/constants';

// $FARM Token Contract Address (trim to remove any whitespace/newlines)
export const FARM_TOKEN_ADDRESS = (import.meta.env.VITE_FARM_TOKEN_ADDRESS || '').trim();

// Debug: Log token configuration on load
console.log('🌾 [Web3] FARM Token Address:', FARM_TOKEN_ADDRESS || '(not set)');
console.log('🌾 [Web3] Network:', NETWORK.chainName, '(Chain ID:', NETWORK.chainId, ')');
console.log('🌾 [Web3] Mode:', USE_MAINNET ? '🔴 MAINNET (Production)' : '🟡 TESTNET (Development)');

// Wallet provider types
export type WalletType = 'metamask' | 'okx' | 'trust' | 'coinbase' | 'gmgn' | 'generic';

export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  provider: EthereumProvider | null;
  installed: boolean;
}

// EIP-1193 Provider interface
interface EthereumProvider {
  isMetaMask?: boolean;
  isOkxWallet?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isGmgn?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

// Extend Window interface for multiple wallets
declare global {
  interface Window {
    ethereum?: EthereumProvider;
    okxwallet?: EthereumProvider;
    trustwallet?: EthereumProvider;
    coinbaseWalletExtension?: EthereumProvider;
    gmgn?: EthereumProvider;
  }
}

// Current active provider (set when user selects a wallet)
let activeProvider: EthereumProvider | null = null;

/**
 * Detect all available wallet providers
 */
export const detectWallets = (): WalletInfo[] => {
  const wallets: WalletInfo[] = [];

  // MetaMask
  if (window.ethereum?.isMetaMask) {
    wallets.push({
      type: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      provider: window.ethereum,
      installed: true,
    });
  }

  // OKX Wallet
  if (window.okxwallet) {
    wallets.push({
      type: 'okx',
      name: 'OKX Wallet',
      icon: '⭕',
      provider: window.okxwallet,
      installed: true,
    });
  } else if (window.ethereum?.isOkxWallet) {
    wallets.push({
      type: 'okx',
      name: 'OKX Wallet',
      icon: '⭕',
      provider: window.ethereum,
      installed: true,
    });
  }

  // Trust Wallet
  if (window.trustwallet) {
    wallets.push({
      type: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      provider: window.trustwallet,
      installed: true,
    });
  } else if (window.ethereum?.isTrust) {
    wallets.push({
      type: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      provider: window.ethereum,
      installed: true,
    });
  }

  // Coinbase Wallet
  if (window.coinbaseWalletExtension) {
    wallets.push({
      type: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      provider: window.coinbaseWalletExtension,
      installed: true,
    });
  } else if (window.ethereum?.isCoinbaseWallet) {
    wallets.push({
      type: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      provider: window.ethereum,
      installed: true,
    });
  }

  // GMGN Wallet
  if (window.gmgn) {
    wallets.push({
      type: 'gmgn',
      name: 'GMGN Wallet',
      icon: '🟢',
      provider: window.gmgn,
      installed: true,
    });
  } else if (window.ethereum?.isGmgn) {
    wallets.push({
      type: 'gmgn',
      name: 'GMGN Wallet',
      icon: '🟢',
      provider: window.ethereum,
      installed: true,
    });
  }

  // Generic Web3 provider (fallback if no specific wallet detected)
  if (window.ethereum && wallets.length === 0) {
    wallets.push({
      type: 'generic',
      name: 'Web3 Wallet',
      icon: '🔗',
      provider: window.ethereum,
      installed: true,
    });
  }

  return wallets;
};

/**
 * Get available wallet options (including not installed for UI)
 */
export const getWalletOptions = (): WalletInfo[] => {
  const detected = detectWallets();
  const detectedTypes = new Set(detected.map(w => w.type));

  const options: WalletInfo[] = [...detected];

  // Add not-installed options for download links
  if (!detectedTypes.has('metamask')) {
    options.push({
      type: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      provider: null,
      installed: false,
    });
  }

  if (!detectedTypes.has('okx')) {
    options.push({
      type: 'okx',
      name: 'OKX Wallet',
      icon: '⭕',
      provider: null,
      installed: false,
    });
  }

  if (!detectedTypes.has('trust')) {
    options.push({
      type: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      provider: null,
      installed: false,
    });
  }

  if (!detectedTypes.has('gmgn')) {
    options.push({
      type: 'gmgn',
      name: 'GMGN Wallet',
      icon: '🟢',
      provider: null,
      installed: false,
    });
  }

  return options;
};

/**
 * Set active wallet provider
 */
export const setActiveWallet = (walletType: WalletType): boolean => {
  const wallets = detectWallets();
  const wallet = wallets.find(w => w.type === walletType);

  if (wallet?.provider) {
    activeProvider = wallet.provider;
    console.log(`🔗 Active wallet set to: ${wallet.name}`);
    return true;
  }

  // Fallback to default ethereum provider
  if (window.ethereum) {
    activeProvider = window.ethereum;
    console.log('🔗 Fallback to default Web3 provider');
    return true;
  }

  return false;
};

/**
 * Get active provider
 */
export const getActiveProvider = (): EthereumProvider | null => {
  return activeProvider || window.ethereum || null;
};

/**
 * Get wallet download URL
 */
export const getWalletDownloadUrl = (walletType: WalletType): string => {
  switch (walletType) {
    case 'metamask':
      return 'https://metamask.io/download/';
    case 'okx':
      return 'https://www.okx.com/web3';
    case 'trust':
      return 'https://trustwallet.com/download';
    case 'coinbase':
      return 'https://www.coinbase.com/wallet';
    case 'gmgn':
      return 'https://gmgn.ai/';
    default:
      return '';
  }
};

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  bnbBalance: string;
  farmBalance: string;
  isCorrectNetwork: boolean;
}

/**
 * Check if any Web3 wallet is installed
 */
export const isWalletInstalled = (): boolean => {
  return detectWallets().length > 0;
};

/**
 * Check if MetaMask is installed (legacy support)
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask === true;
};

/**
 * Get the current provider
 */
export const getProvider = (): ethers.BrowserProvider | null => {
  const provider = getActiveProvider();
  if (!provider) return null;
  return new ethers.BrowserProvider(provider as ethers.Eip1193Provider);
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
 * Connect to Web3 wallet
 */
export const connectWallet = async (walletType?: WalletType): Promise<Web3State> => {
  // Set active wallet if specified
  if (walletType) {
    setActiveWallet(walletType);
  }

  const provider = getActiveProvider();
  if (!provider) {
    throw new Error('請安裝 Web3 錢包（MetaMask、OKX 或 Trust Wallet）');
  }

  try {
    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('無法獲取錢包地址');
    }

    const address = accounts[0];

    // Get chain ID
    const chainIdHex = await provider.request({
      method: 'eth_chainId',
    }) as string;
    const chainId = parseInt(chainIdHex, 16);

    // Check if on correct network
    const isCorrectNetwork = chainId === NETWORK.chainId;

    // Get balances
    const ethersProvider = getProvider()!;
    const bnbBalance = await ethersProvider.getBalance(address);

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
 * This will open wallet's account selection popup
 */
export const switchWalletAccount = async (): Promise<Web3State> => {
  const provider = getActiveProvider();
  if (!provider) {
    throw new Error('請安裝 Web3 錢包');
  }

  try {
    // Request permissions again - this forces wallet to show account selection
    await provider.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });

    // After user selects account, get the new account
    const accounts = await provider.request({
      method: 'eth_accounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('無法獲取錢包地址');
    }

    const address = accounts[0];

    // Get chain ID
    const chainIdHex = await provider.request({
      method: 'eth_chainId',
    }) as string;
    const chainId = parseInt(chainIdHex, 16);

    // Check if on correct network
    const isCorrectNetwork = chainId === NETWORK.chainId;

    // Get balances
    const ethersProvider = getProvider()!;
    const bnbBalance = await ethersProvider.getBalance(address);

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
  const provider = getActiveProvider();
  if (!provider) return false;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    // This error code indicates that the chain has not been added to wallet
    if ((switchError as { code?: number }).code === 4902) {
      try {
        await provider.request({
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
 * Note: Uses ethers.getAddress() to prevent ENS resolution on BSC
 */
export const getFarmBalance = async (address: string): Promise<string> => {
  console.log('🌾 [FARM] Getting balance for:', address);
  console.log('🌾 [FARM] Token address:', FARM_TOKEN_ADDRESS);

  if (!FARM_TOKEN_ADDRESS) {
    console.warn('🌾 [FARM] Token address not configured!');
    return '0';
  }

  const provider = getProvider();
  if (!provider) {
    console.warn('🌾 [FARM] No provider available');
    return '0';
  }

  try {
    // Validate and checksum addresses to prevent ENS resolution
    const validatedTokenAddress = ethers.getAddress(FARM_TOKEN_ADDRESS);
    const validatedAddress = ethers.getAddress(address);

    // Check current network
    const network = await provider.getNetwork();
    console.log('🌾 [FARM] Current network:', network.chainId.toString());

    // If not on testnet, try using a direct RPC provider
    if (network.chainId !== BigInt(NETWORK.chainId)) {
      console.log('🌾 [FARM] Wrong network, using direct RPC...');
      const rpcProvider = new ethers.JsonRpcProvider(NETWORK.rpcUrls[0]);
      const contract = new ethers.Contract(validatedTokenAddress, ERC20_ABI, rpcProvider);
      const balance = await contract.balanceOf(validatedAddress);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      console.log('🌾 [FARM] Balance (via RPC):', formatted);
      return formatted;
    }

    const contract = new ethers.Contract(validatedTokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(validatedAddress);
    const decimals = await contract.decimals();
    const formatted = ethers.formatUnits(balance, decimals);
    console.log('🌾 [FARM] Balance:', formatted);
    return formatted;
  } catch (error) {
    console.error('🌾 [FARM] Failed to get balance:', error);
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
 * Note: Uses ethers.getAddress() to prevent ENS resolution on BSC
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
    // Validate and checksum the addresses to prevent ENS resolution
    const validatedTokenAddress = ethers.getAddress(FARM_TOKEN_ADDRESS);
    const validatedToAddress = ethers.getAddress(toAddress);

    const contract = new ethers.Contract(validatedTokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    console.log('🌾 [Transfer] To:', validatedToAddress, 'Amount:', amount);
    const tx = await contract.transfer(validatedToAddress, amountInWei);
    const receipt = await tx.wait();

    console.log('🌾 [Transfer] Success:', receipt.hash);
    return receipt.hash;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

/**
 * Approve spending of FARM tokens (for future DEX integration)
 * Note: Uses ethers.getAddress() to prevent ENS resolution on BSC
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
    // Validate and checksum addresses to prevent ENS resolution
    const validatedTokenAddress = ethers.getAddress(FARM_TOKEN_ADDRESS);
    const validatedSpenderAddress = ethers.getAddress(spenderAddress);

    const contract = new ethers.Contract(validatedTokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    const tx = await contract.approve(validatedSpenderAddress, amountInWei);
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
  const provider = getActiveProvider();
  if (!provider) return;
  provider.on('accountsChanged', callback as (...args: unknown[]) => void);
};

/**
 * Listen for chain changes
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  const provider = getActiveProvider();
  if (!provider) return;
  provider.on('chainChanged', callback as (...args: unknown[]) => void);
};

/**
 * Remove account change listener
 */
export const removeAccountsChangedListener = (callback: (accounts: string[]) => void): void => {
  const provider = getActiveProvider();
  if (!provider) return;
  provider.removeListener('accountsChanged', callback as (...args: unknown[]) => void);
};

/**
 * Remove chain change listener
 */
export const removeChainChangedListener = (callback: (chainId: string) => void): void => {
  const provider = getActiveProvider();
  if (!provider) return;
  provider.removeListener('chainChanged', callback as (...args: unknown[]) => void);
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
