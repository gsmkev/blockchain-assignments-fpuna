import { useEffect, useRef, useState } from "react";
import {
  connectWallet,
  getAllListings,
  getPendingWithdrawal,
  mintInitialBatch,
  purchaseNFT,
  withdrawFunds,
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
  const [pendingAmount, setPendingAmount] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const CONTRACT_OWNER =
    "0x910b03584659f87344c8b0dffe23da6a1a3ff41c".toLowerCase();

  const firstLoadDone = useRef(false);

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllListings();
    setNfts(data);
    setLoading(false);

    if (!firstLoadDone.current) {
      toast.dismiss();
      if (data.length === 0) {
        toast.info("No hay NFTs disponibles en la tienda.", {
          toastId: "no-nfts",
        });
      } else {
        toast.success("NFTs cargados correctamente.", {
          toastId: "nfts-loaded",
        });
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
        toast.info("👋 Bienvenido de vuelta.", {
          toastId: "welcome-back",
        });
      } catch (err) {
        console.warn("Silent wallet connect failed:", err);
        toast.dismiss();
        toast.error("❌ Error al conectar la billetera.", {
          toastId: "silent-connect-error",
        });
      }
    }
  };

  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
      localStorage.setItem("connected", "true");
      toast.dismiss();
      toast.success("🔗 Wallet conectada correctamente", {
        toastId: "wallet-connected",
      });
    } catch (err) {
      console.error("Conexión rechazada.");
      toast.dismiss();
      toast.error("❌ El usuario rechazó la conexión.", {
        toastId: "connection-rejected",
      });
    }
  };

  const handleBuy = async (tokenId: number, price: string) => {
    try {
      setLoading(true);
      await purchaseNFT(tokenId, price);
      setLoading(false);
      toast.dismiss();
      toast.success(`¡Compra exitosa del NFT #${tokenId} por ${price} ETH!`, {
        toastId: "purchase-success",
      });
      await loadItems();
    } catch (err) {
      setLoading(false);
      console.error("Error al comprar:", err);
      toast.dismiss();
      toast.error("Hubo un problema al realizar la compra.", {
        toastId: "purchase-error",
      });
    }
  };

  const handleMint = async () => {
    try {
      if (!account) {
        await handleConnect();
      }
      setLoading(true);
      await mintInitialBatch(mintCount);
      setLoading(false);
      toast.dismiss();
      toast.success(`🎉 Se mintearon ${mintCount} NFT(s) exitosamente`, {
        toastId: "mint-success",
      });
      await loadItems();
    } catch (err) {
      setLoading(false);
      console.error("Mint fallido:", err);
      toast.dismiss();
      toast.error("❌ Error al mintear los NFTs.", {
        toastId: "mint-error",
      });
    }
  };

  const checkPending = async () => {
    if (account) {
      const amount = await getPendingWithdrawal(account);
      setPendingAmount(amount);
      if (Number(amount) > 0) {
        toast.dismiss();
        toast.info(`Tienes ${amount} ETH pendientes para retirar.`, {
          toastId: "pending-withdrawal",
        });
      }
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!account) {
        await handleConnect();
      }
      if (pendingAmount === "0") {
        return;
      }
      setLoading(true);
      await withdrawFunds();
      setLoading(false);
      toast.dismiss();
      toast.success("✅ Retiro exitoso", {
        toastId: "withdraw-success",
      });
      await checkPending();
    } catch (err) {
      setLoading(false);
      console.error("Error al retirar:", err);
      toast.dismiss();
      toast.error("❌ Error al intentar retirar fondos", {
        toastId: "withdraw-error",
      });
    }
  };

  useEffect(() => {
    silentConnect().then(() => {
      loadItems();
      checkPending();
    });
  }, [account]);

  useEffect(() => {
    silentConnect().then(() => loadItems());
  }, []);

  const marketplaceNFTs = nfts.filter((nft) => !nft.isSold);
  const myMintedNFTs = nfts;
  const myPurchasedNFTs = nfts.filter(
    (nft) => nft.isSold && nft.buyer?.toLowerCase() === account?.toLowerCase()
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
            gap: "20px",
            margin: "20px 0",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
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
            <span
              style={{
                visibility: "hidden",
                width: "200px",
                backgroundColor: "#555",
                color: "#fff",
                textAlign: "center",
                borderRadius: "6px",
                padding: "5px",
                position: "absolute",
                zIndex: 1,
                bottom: "125%",
                left: "50%",
                marginLeft: "-100px",
                opacity: 0,
                transition: "opacity 0.3s",
              }}
              className="tooltip-text"
            >
              Mintea NFTs para la tienda
            </span>
          </div>

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

          {Number(pendingAmount) > 0 && (
            <div style={{ position: "relative" }}>
              <button
                onClick={handleWithdraw}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#ffc107",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                🔓 Retirar Fondos ({pendingAmount} ETH)
              </button>

              <div className="tooltip-container">
                <span className="tooltip-text">
                  Retira tus fondos acumulados por ventas
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <style>
        {`
          .tooltip-text {
        visibility: hidden;
        opacity: 0;
          }

          div:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
          }
        `}
      </style>

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
        style={{ zIndex: 10000 }}
      />
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              border: "8px solid #f3f3f3",
              borderTop: "8px solid #3498db",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
