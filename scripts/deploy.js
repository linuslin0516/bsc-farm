import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying FARM Token to BSC Testnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "BNB\n");

  if (balance === 0n) {
    console.error("❌ Deployer has no BNB! Get test BNB from:");
    console.error("   https://testnet.bnbchain.org/faucet-smart");
    process.exit(1);
  }

  // Use deployer as treasury for testing
  const treasuryAddress = deployer.address;
  console.log("🏦 Treasury address:", treasuryAddress);

  // Deploy FarmToken
  console.log("\n📦 Deploying FarmToken contract...");
  const FarmToken = await ethers.getContractFactory("FarmToken");
  const farmToken = await FarmToken.deploy(treasuryAddress);

  await farmToken.waitForDeployment();
  const contractAddress = await farmToken.getAddress();

  console.log("\n✅ FarmToken deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 BSCScan (Testnet):", `https://testnet.bscscan.com/token/${contractAddress}`);

  // Verify deployment
  const name = await farmToken.name();
  const symbol = await farmToken.symbol();
  const totalSupply = await farmToken.totalSupply();
  const deployerBalance = await farmToken.balanceOf(deployer.address);

  console.log("\n📊 Token Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", ethers.formatEther(totalSupply), "FARM");
  console.log("   Deployer Balance:", ethers.formatEther(deployerBalance), "FARM");

  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add to your .env file: VITE_FARM_TOKEN_ADDRESS=" + contractAddress);
  console.log("3. Add treasury: VITE_TREASURY_WALLET=" + treasuryAddress);
  console.log("4. Import token to MetaMask using the contract address");

  // Return for verification
  return {
    contractAddress,
    treasuryAddress,
    deployer: deployer.address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
