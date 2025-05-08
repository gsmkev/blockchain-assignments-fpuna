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
import { FaStore, FaPalette, FaGift } from "react-icons/fa";
import "./App.css";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [activeTab, setActiveTab] = useState<"store" | "minted" | "purchased">(
    "store"
  );

  const CONTRACT_OWNER =
    "0x910b03584659f87344c8b0dffe23da6a1a3ff41c".toLowerCase();

  const loadItems = async () => {
    const data = await getAllListings();
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

  const tabStyle = (tab: string) => ({
    padding: "12px 24px",
    margin: "0 8px",
    borderRadius: "8px",
    backgroundColor: activeTab === tab ? "#007bff" : "#333",
    color: activeTab === tab ? "#fff" : "#ccc",
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
  });

  return (
    <div className="container">
      <h1 style={{ marginBottom: "10px" }}>NFT Marketplace</h1>
      <WalletConnect account={account} onConnect={handleConnect} />

      {account?.toLowerCase() === CONTRACT_OWNER && (
        <button
          onClick={handleMint}
          style={{
            margin: "20px 0",
            padding: "10px 24px",
            backgroundColor: "#28a745",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🧙‍♂️ Mint Lote Inicial
        </button>
      )}

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}
      >
        <button style={tabStyle("store")} onClick={() => setActiveTab("store")}>
          <FaStore /> Tienda
        </button>
        {account?.toLowerCase() === CONTRACT_OWNER && (
          <button
            style={tabStyle("minted")}
            onClick={() => setActiveTab("minted")}
          >
            <FaPalette /> Mis Minteados
          </button>
        )}
        <button
          style={tabStyle("purchased")}
          onClick={() => setActiveTab("purchased")}
        >
          <FaGift /> Mis Comprados
        </button>
      </div>

      <div className="grid">
        {activeTab === "store" &&
          marketplaceNFTs.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              onBuy={handleBuy}
              currentAccount={account || ""}
            />
          ))}

        {activeTab === "minted" &&
          myMintedNFTs.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              onBuy={() => {}}
              currentAccount={account || ""}
            />
          ))}

        {activeTab === "purchased" &&
          myPurchasedNFTs.map((nft) => (
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
