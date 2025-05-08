import { ethers } from "hardhat";

async function main() {
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const contract = await Marketplace.deploy();

  // En Ethers v6: deploy() ya devuelve el contrato listo
  console.log(`Marketplace deployed to: ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
