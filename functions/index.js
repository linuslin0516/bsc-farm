import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ethers } from 'ethers';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Define secret for treasury private key (set via Firebase CLI)
const TREASURY_PRIVATE_KEY = defineSecret('TREASURY_PRIVATE_KEY');

// BSC Network Configuration
const BSC_CONFIG = {
  testnet: {
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: 97,
  },
  mainnet: {
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: 56,
  },
};

// Use testnet for now (change to 'mainnet' for production)
const NETWORK = 'testnet';

// ERC20 ABI (minimal for transfer)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

/**
 * Process withdrawal requests automatically
 * Triggered when a new withdrawal document is created in Firestore
 */
export const processWithdrawal = onDocumentCreated(
  {
    document: 'withdrawal_requests/{requestId}',
    secrets: [TREASURY_PRIVATE_KEY],
    region: 'asia-east1', // Choose region closest to your users
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data in withdrawal request');
      return;
    }

    const requestId = event.params.requestId;
    const data = snapshot.data();

    console.log(`Processing withdrawal request: ${requestId}`);
    console.log('Request data:', JSON.stringify(data, null, 2));

    // Validate request data
    const { userId, walletAddress, farmAmount, tokenAddress, status } = data;

    if (status !== 'pending') {
      console.log(`Request ${requestId} is not pending, skipping`);
      return;
    }

    if (!userId || !walletAddress || !farmAmount || !tokenAddress) {
      await updateRequestStatus(requestId, 'failed', 'Missing required fields');
      return;
    }

    if (farmAmount <= 0) {
      await updateRequestStatus(requestId, 'failed', 'Invalid amount');
      return;
    }

    try {
      // Update status to processing
      await updateRequestStatus(requestId, 'processing');

      // Get treasury private key from secret
      const privateKey = TREASURY_PRIVATE_KEY.value();
      if (!privateKey) {
        throw new Error('Treasury private key not configured');
      }

      // Connect to BSC
      const config = BSC_CONFIG[NETWORK];
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      console.log(`Treasury wallet: ${wallet.address}`);

      // Validate addresses
      const validatedTokenAddress = ethers.getAddress(tokenAddress);
      const validatedWalletAddress = ethers.getAddress(walletAddress);

      // Create contract instance
      const contract = new ethers.Contract(validatedTokenAddress, ERC20_ABI, wallet);

      // Get token decimals
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(farmAmount.toString(), decimals);

      // Check treasury balance
      const treasuryBalance = await contract.balanceOf(wallet.address);
      if (treasuryBalance < amountInWei) {
        throw new Error(`Insufficient treasury balance. Required: ${farmAmount}, Available: ${ethers.formatUnits(treasuryBalance, decimals)}`);
      }

      console.log(`Sending ${farmAmount} FARM to ${validatedWalletAddress}`);

      // Send tokens
      const tx = await contract.transfer(validatedWalletAddress, amountInWei);
      console.log(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      // Update request status to completed
      await updateRequestStatus(requestId, 'completed', null, tx.hash);

      // Update user's exchange data
      await updateUserExchangeData(userId, farmAmount);

      console.log(`Withdrawal ${requestId} completed successfully`);

    } catch (error) {
      console.error(`Withdrawal ${requestId} failed:`, error);
      await updateRequestStatus(requestId, 'failed', error.message);
    }
  }
);

/**
 * Update withdrawal request status in Firestore
 */
async function updateRequestStatus(requestId, status, errorMessage = null, txHash = null) {
  const updateData = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  if (txHash) {
    updateData.txHash = txHash;
  }

  if (status === 'completed') {
    updateData.completedAt = FieldValue.serverTimestamp();
  }

  await db.collection('withdrawal_requests').doc(requestId).update(updateData);
}

/**
 * Update user's exchange data after successful withdrawal
 */
async function updateUserExchangeData(userId, farmAmount) {
  const userExchangeRef = db.collection('user_exchange').doc(userId);
  const doc = await userExchangeRef.get();

  if (doc.exists) {
    await userExchangeRef.update({
      totalWithdrawn: FieldValue.increment(farmAmount),
      lastWithdrawalAt: FieldValue.serverTimestamp(),
    });
  }
}
