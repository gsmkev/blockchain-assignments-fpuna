import type { NFTItem } from "../utils/marketplace";

type Props = {
  nft: NFTItem;
  onBuy: (tokenId: number, price: string) => void;
  currentAccount?: string;
};

export default function NFTCard({ nft, onBuy, currentAccount }: Props) {
  const isOwner = currentAccount?.toLowerCase() === nft.owner.toLowerCase();
  const isSold = nft.isSold;
  const cardStyle = {
    border: "1px solid #333",
    borderRadius: "10px",
    width: "220px",
    margin: "10px",
    padding: "10px",
    backgroundColor: isSold ? "#f2f2f2" : "#1e1e1e",
    color: isSold ? "#888" : "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    textAlign: "center" as const,
  };

  return (
    <div style={cardStyle}>
      <img
        src={nft.uri}
        alt={`NFT ${nft.tokenId}`}
        width="180"
        height="180"
        style={{ objectFit: "cover", borderRadius: "8px" }}
      />
      <h3 style={{ margin: "10px 0 5px" }}>{`NFT ${nft.tokenId}`}</h3>
      <p style={{ margin: "5px 0" }}>#{nft.tokenId}</p>
      <p style={{ margin: "5px 0" }}>Precio: {nft.price} ETH</p>
      {nft.isSold && (
        <p style={{ color: "green", fontWeight: "bold" }}>✅ Comprado</p>
      )}
      {!isOwner && !nft.isSold && (
        <button
          onClick={() => onBuy(nft.tokenId, nft.price)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Comprar
        </button>
      )}
      {isOwner && !nft.isSold && (
        <p style={{ color: "orange", fontWeight: "bold" }}>
          🪙 A la venta (tuyo)
        </p>
      )}
    </div>
  );
}
