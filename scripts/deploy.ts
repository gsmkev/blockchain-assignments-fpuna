import { ethers } from "hardhat";

async function main() {
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const contract = await Marketplace.deploy(); // Despliega el contrato
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
