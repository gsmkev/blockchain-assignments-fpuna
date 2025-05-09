import { ethers } from "hardhat"; // 👈 SÍ funciona si los tipos están cargados
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
  if (!CONTRACT_ADDRESS) {
    throw new Error("❌ VITE_CONTRACT_ADDRESS no está definido en .env");
  }

  const contract = await ethers.getContractAt("Marketplace", CONTRACT_ADDRESS);
  const count = await contract.tokenCounter();
  console.log("✅ Token Counter:", count.toString());
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
