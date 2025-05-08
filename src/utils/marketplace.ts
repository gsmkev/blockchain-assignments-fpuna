import { ethers } from "ethers";
import abi from "../abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
declare global {
  interface Window {
    ethereum?: any;
  }
}

const getContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
};

export interface NFTItem {
  tokenId: number;
  owner: string;
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
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    abi,
    provider.getSigner()
  );
  const items: NFTItem[] = [];

  // Obtener el total real de NFTs creados
  const total = await contract.tokenCounter();

  for (let i = 0; i < Number(total); i++) {
    try {
      const [owner, price, isSold] = await contract.getListing(i);
      const uri = await contract.tokenURI(i);
      items.push({
        tokenId: i,
        owner,
        price: ethers.utils.formatEther(price),
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
    value: ethers.utils.formatEther(price),
  });
  await tx.wait();
}

export async function mintInitialBatch(count: number = 10) {
  const contract = await getContract();

  for (let i = 0; i < count; i++) {
    const seed = Date.now() + i;
    const uri = `https://picsum.photos/200?random=${seed}`;
    const price = ethers.utils.parseEther("0.01");

    try {
      console.log(`Minting NFT ${i + 1} with URI: ${uri} and price: ${price}`);
      const tx = await contract.mintAndList(uri, price);
      await tx.wait();
    } catch (e) {
      console.error(`Error minting NFT ${i + 1}:`, e);
    }
  }
}
