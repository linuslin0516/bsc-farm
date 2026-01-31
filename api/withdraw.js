import { ethers } from 'ethers';
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    // Handle private key - Vercel stores it with literal \n, need to convert to actual newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    // Replace literal \n with actual newlines (handles both \\n and \n)
    privateKey = privateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (initError) {
    console.error('Firebase Admin initialization failed:', initError);
  }
}

const db = admin.firestore();

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

// Use environment variable to determine network
const NETWORK = process.env.USE_MAINNET === 'true' ? 'mainnet' : 'testnet';

// ERC20 ABI (minimal for transfer)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { requestId, userId, walletAddress } = req.body;

  if (!requestId || !userId || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check environment variables
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Missing Firebase environment variables');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Firebase not configured'
    });
  }

  if (!process.env.TREASURY_PRIVATE_KEY) {
    console.error('Missing TREASURY_PRIVATE_KEY');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Treasury not configured'
    });
  }

  try {
    // Get withdrawal request from Firestore
    console.log('Fetching withdrawal request:', requestId);
    const requestRef = db.collection('withdrawal_requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const data = requestDoc.data();
    const { userId: storedUserId, walletAddress: storedWallet, farmAmount, tokenAddress, status } = data;

    // Verify request data matches (security check)
    if (storedUserId !== userId || storedWallet.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({
        error: 'Request verification failed',
      });
    }

    // Check if already processed
    if (status !== 'pending') {
      return res.status(400).json({
        error: `Request already ${status}`,
        status
      });
    }

    // Update status to processing
    await requestRef.update({
      status: 'processing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get treasury private key
    const privateKey = process.env.TREASURY_PRIVATE_KEY;

    // Connect to BSC
    const config = BSC_CONFIG[NETWORK];
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Processing withdrawal: ${requestId}`);
    console.log(`Network: ${NETWORK}`);
    console.log(`Treasury: ${wallet.address}`);
    console.log(`To: ${walletAddress}`);
    console.log(`Amount: ${farmAmount} FARM`);

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
    console.log(`Treasury balance: ${ethers.formatUnits(treasuryBalance, decimals)} FARM`);

    if (treasuryBalance < amountInWei) {
      throw new Error(`Insufficient treasury balance. Has: ${ethers.formatUnits(treasuryBalance, decimals)}, Needs: ${farmAmount}`);
    }

    // Send tokens
    const tx = await contract.transfer(validatedWalletAddress, amountInWei);
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.hash}`);

    // Update request status to completed
    await requestRef.update({
      status: 'completed',
      txHash: receipt.hash,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update transaction record
    if (data.transactionId) {
      await db.collection('exchange_transactions').doc(data.transactionId).update({
        status: 'completed',
        txHash: receipt.hash,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({
      success: true,
      txHash: receipt.hash,
      message: 'Withdrawal processed successfully',
    });

  } catch (error) {
    console.error('Withdrawal failed:', error);

    // Update request status to failed
    try {
      await db.collection('withdrawal_requests').doc(requestId).update({
        status: 'failed',
        errorMessage: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (updateError) {
      console.error('Failed to update request status:', updateError);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
