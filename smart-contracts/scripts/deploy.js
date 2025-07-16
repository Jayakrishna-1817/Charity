const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment...");

  // 1. Get contract factories
  const CharityRegistry = await ethers.getContractFactory("CharityRegistry");
  const AuditTrail = await ethers.getContractFactory("AuditTrail");
  const DonationManager = await ethers.getContractFactory("DonationManager");

  // 2. Deploy contracts
  const charityRegistry = await CharityRegistry.deploy();
  await charityRegistry.waitForDeployment(); // ✅ Correct for Ethers v6
  console.log("✅ CharityRegistry address:", await charityRegistry.getAddress());

  const auditTrail = await AuditTrail.deploy();
  await auditTrail.waitForDeployment();
  console.log("✅ AuditTrail address:", await auditTrail.getAddress());

  const donationManager = await DonationManager.deploy(await charityRegistry.getAddress());
  await donationManager.waitForDeployment();
  console.log("✅ DonationManager address:", await donationManager.getAddress());

  // 3. Set permissions
  await auditTrail.addAuthorizedContract(await donationManager.getAddress());
  console.log("✅ Permissions set.");

  // 4. Save to file
  const output = {
    network: "localhost",
    contracts: {
      CharityRegistry: await charityRegistry.getAddress(),
      AuditTrail: await auditTrail.getAddress(),
      DonationManager: await donationManager.getAddress()
    },
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync("./deployment-addresses.json", JSON.stringify(output, null, 2));
  console.log("🎉 Done! Saved to deployment-addresses.json");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
