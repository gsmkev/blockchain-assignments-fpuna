import { useEffect, useState } from "react";
import {
  connectWallet,
  getAllListings,
  mintInitialBatch,
  purchaseNFT,
  type NFTItem,
} from "./utils/marketplace";
import NFTCard from "./components/NFTCard";
import WalletConnect from "./components/WalletConnect";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const CONTRACT_OWNER =
    "0x910b03584659f87344c8b0dffe23da6a1a3ff41c".toLowerCase();

  const loadItems = async () => {
    console.log("Loading NFTs...");
    const data = await getAllListings();
    console.log("NFTs loaded:", data);
    setNfts(data);
  };

  const silentConnect = async () => {
    if (
      window.ethereum &&
      (await window.ethereum.request({ method: "eth_accounts" })).length > 0
    ) {
      try {
        const acc = await connectWallet();
        setAccount(acc);
        localStorage.setItem("connected", "true");
      } catch (err) {
        console.warn("Silent wallet connect failed:", err);
      }
    }
  };

  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
      localStorage.setItem("connected", "true");
    } catch (err) {
      console.error("User rejected connection.");
    }
  };

  const handleBuy = async (tokenId: number, price: string) => {
    console.log(`Intentando comprar token ${tokenId} por ${price} ETH`);
    await purchaseNFT(tokenId, price);
    await loadItems();
  };

  const handleMint = async () => {
    try {
      if (!account) {
        await handleConnect();
      }
      await mintInitialBatch();
      await loadItems();
    } catch (err) {
      console.error("Mint failed:", err);
    }
  };

  useEffect(() => {
    silentConnect().finally(() => loadItems());
  }, []);

  const marketplaceNFTs = nfts.filter((nft) => !nft.isSold);

  const myMintedNFTs = nfts.filter(
    (nft) => !nft.isSold && nft.owner.toLowerCase() === account?.toLowerCase()
  );

  const myPurchasedNFTs = nfts.filter(
    (nft) => nft.isSold && nft.owner.toLowerCase() === account?.toLowerCase()
  );

  return (
    <div>
      <h1>NFT Marketplace</h1>
      <WalletConnect account={account} onConnect={handleConnect} />
      {account?.toLowerCase() === CONTRACT_OWNER && (
        <button onClick={handleMint}>Mint Lote Inicial</button>
      )}

      <h2>🛒 NFTs en venta</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {marketplaceNFTs.map((nft) => (
          <NFTCard
            key={nft.tokenId}
            nft={nft}
            onBuy={handleBuy}
            currentAccount={account || ""}
          />
        ))}
      </div>

      {account?.toLowerCase() === CONTRACT_OWNER && (
        <>
          <h2>🎨 NFTs que minteé</h2>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {myMintedNFTs.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onBuy={() => {}}
                currentAccount={account || ""}
              />
            ))}
          </div>
        </>
      )}

      <h2>🎁 NFTs que compré</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {myPurchasedNFTs.map((nft) => (
          <NFTCard
            key={nft.tokenId}
            nft={nft}
            onBuy={() => {}}
            currentAccount={account || ""}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
