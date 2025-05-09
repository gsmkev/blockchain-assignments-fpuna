import { useEffect, useRef, useState } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "./App.css";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "store" | "minted" | "purchased" | "sold"
  >("store");
  const [mintCount, setMintCount] = useState<number>(1);

  const CONTRACT_OWNER =
    "0x910b03584659f87344c8b0dffe23da6a1a3ff41c".toLowerCase();

  const firstLoadDone = useRef(false);

  const loadItems = async () => {
    const data = await getAllListings();
    setNfts(data);

    if (!firstLoadDone.current) {
      if (data.length === 0) {
        toast.info("No hay NFTs disponibles en la tienda.");
      } else {
        toast.success("NFTs cargados correctamente.");
      }
      firstLoadDone.current = true;
    }
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
        toast.info("👋 Bienvenido de vuelta.");
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
      toast.success("🔗 Wallet conectada correctamente");
    } catch (err) {
      console.error("Conexión rechazada.");
      toast.error("❌ El usuario rechazó la conexión.");
    }
  };

  const handleBuy = async (tokenId: number, price: string) => {
    try {
      await purchaseNFT(tokenId, price);
      toast.success(`¡Compra exitosa del NFT #${tokenId} por ${price} ETH!`);
      await loadItems();
    } catch (err) {
      console.error("Error al comprar:", err);
      toast.error("Hubo un problema al realizar la compra.");
    }
  };

  const handleMint = async () => {
    try {
      if (!account) {
        await handleConnect();
      }
      await mintInitialBatch(mintCount);
      toast.success(`🎉 Se mintearon ${mintCount} NFT(s) exitosamente`);
      await loadItems();
    } catch (err) {
      console.error("Mint fallido:", err);
      toast.error("❌ Error al mintear los NFTs.");
    }
  };

  useEffect(() => {
    silentConnect().then(() => loadItems());
  }, []);

  const marketplaceNFTs = nfts.filter((nft) => !nft.isSold);
  const myMintedNFTs = nfts;
  const myPurchasedNFTs = nfts.filter(
    (nft) =>
      nft.isSold &&
      nft.owner.toLowerCase() === account?.toLowerCase() &&
      account?.toLowerCase() !== CONTRACT_OWNER
  );
  const soldNFTs = nfts.filter((nft) => nft.isSold);

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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          <button
            onClick={handleMint}
            style={{
              padding: "10px 24px",
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🧙‍♂️ Mint {mintCount} NFT{mintCount > 1 ? "s" : ""}
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1f1f1f",
              border: "1px solid #555",
              borderRadius: "8px",
              padding: "6px",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setMintCount((prev) => Math.max(1, prev - 1))}
              style={{
                padding: "6px 12px",
                backgroundColor: "#444",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "18px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#555")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#444")
              }
            >
              –
            </button>

            <span
              style={{
                minWidth: "40px",
                textAlign: "center",
                fontSize: "16px",
                color: "#fff",
              }}
            >
              {mintCount}
            </span>

            <button
              onClick={() => setMintCount((prev) => Math.min(10, prev + 1))}
              style={{
                padding: "6px 12px",
                backgroundColor: "#444",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "18px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#555")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#444")
              }
            >
              +
            </button>
          </div>
        </div>
      )}

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}
      >
        <button style={tabStyle("store")} onClick={() => setActiveTab("store")}>
          <FaStore /> Tienda
        </button>
        {account?.toLowerCase() === CONTRACT_OWNER ? (
          <>
            <button
              style={tabStyle("minted")}
              onClick={() => setActiveTab("minted")}
            >
              <FaPalette /> Mis Minteados
            </button>
            <button
              style={tabStyle("sold")}
              onClick={() => setActiveTab("sold")}
            >
              🛒 Vendidos
            </button>
          </>
        ) : (
          <button
            style={tabStyle("purchased")}
            onClick={() => setActiveTab("purchased")}
          >
            <FaGift /> Mis Comprados
          </button>
        )}
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

        {activeTab === "sold" &&
          soldNFTs.map((nft) => (
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
