// Health check endpoint to diagnose configuration issues
export default async function handler(req, res) {
  const checks = {
    firebase: {
      projectId: !!process.env.FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) || 'N/A',
    },
    treasury: {
      privateKey: !!process.env.TREASURY_PRIVATE_KEY,
      privateKeyLength: process.env.TREASURY_PRIVATE_KEY?.length || 0,
    },
    network: {
      useMainnet: process.env.USE_MAINNET,
    },
  };

  // Try to initialize Firebase Admin
  let firebaseStatus = 'not tested';
  try {
    const admin = await import('firebase-admin');

    if (!admin.default.apps.length) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }

    // Try to access Firestore
    const db = admin.default.firestore();
    await db.collection('test').doc('health').get();
    firebaseStatus = 'connected';
  } catch (error) {
    firebaseStatus = `error: ${error.message}`;
  }

  // Try to initialize ethers wallet
  let walletStatus = 'not tested';
  try {
    const { ethers } = await import('ethers');
    const privateKey = process.env.TREASURY_PRIVATE_KEY;
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey);
      walletStatus = `address: ${wallet.address}`;
    } else {
      walletStatus = 'no private key';
    }
  } catch (error) {
    walletStatus = `error: ${error.message}`;
  }

  return res.status(200).json({
    status: 'ok',
    checks,
    firebaseStatus,
    walletStatus,
    timestamp: new Date().toISOString(),
  });
}
