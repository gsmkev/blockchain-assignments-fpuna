import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "";

  const contract = await ethers.getContractAt("Marketplace", CONTRACT_ADDRESS);
  const count = await contract.tokenCounter();
  console.log("Token Counter:", count.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
