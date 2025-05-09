import { Contract, BrowserProvider, formatEther, parseEther } from "ethers";
import abi from "../abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

declare global {
  interface Window {
    ethereum?: any;
  }
}

const getContract = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, abi, signer);
};

export interface NFTItem {
  tokenId: number;
  owner: string;
  buyer: string;
  price: string;
  isSold: boolean;
  uri: string;
}

export async function connectWallet(): Promise<string> {
  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return address;
}

export async function getAllListings(): Promise<NFTItem[]> {
  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(CONTRACT_ADDRESS, abi, provider);
  const items: NFTItem[] = [];

  const code = await provider.getCode(CONTRACT_ADDRESS);
  if (code === "0x") {
    throw new Error("❌ No hay contrato en esta dirección.");
  }

  const total = await contract.tokenCounter();

  for (let i = 0; i < Number(total); i++) {
    try {
      const [owner, buyer, price, isSold] = await contract.getListing(i);
      const uri = await contract.tokenURI(i);
      items.push({
        tokenId: i,
        owner,
        buyer,
        price: formatEther(price),
        isSold,
        uri,
      });
    } catch (e) {
      console.warn(`Error cargando NFT ${i}`, e);
      continue;
    }
  }

  return items;
}

export async function purchaseNFT(tokenId: number, price: string) {
  const contract = await getContract();
  const tx = await contract.buy(tokenId, {
    value: parseEther(price),
  });
  await tx.wait();
}

export async function mintInitialBatch(count: number = 10) {
  const contract = await getContract();

  for (let i = 0; i < count; i++) {
    const seed = Date.now() + i;
    const uri = `https://picsum.photos/200?random=${seed}`;
    const price = parseEther("0.01");

    try {
      const tx = await contract.mintAndList(uri, price);
      await tx.wait();
    } catch (e) {
      console.error(`Error minting NFT ${i + 1}:`, e);
    }
  }
}

export async function withdrawFunds(): Promise<void> {
  const contract = await getContract();
  const tx = await contract.withdraw();
  await tx.wait();
}

export async function getPendingWithdrawal(account: string): Promise<string> {
  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(CONTRACT_ADDRESS, abi, provider);
  const amount = await contract.pendingWithdrawals(account);
  return formatEther(amount);
}
