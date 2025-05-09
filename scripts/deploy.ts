import { ethers } from "hardhat";

async function main() {
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const contract = await Marketplace.deploy();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
