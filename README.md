# 🛒 NFT Marketplace - Final Project FCE - GSMKev

Este proyecto es una aplicación completa de un Marketplace NFT basada en Ethereum. Permite crear, listar, visualizar, comprar y retirar fondos por NFTs en la blockchain.

> 🔗 Desarrollado con **Solidity, Hardhat, React, TypeScript, Vite y Ethers.js**.

---

## 🌐 Deployment en Producción

El proyecto ya está desplegado y funcionando en:

👉 https://kevinmajo-blockchain.vercel.app/
Puedes probar directamente la aplicación Web3 en esa URL, mintear, comprar y retirar NFTs con MetaMask. 🚀

## 📌 Funcionalidades

- 🚀 Deploy automático del contrato inteligente `Marketplace`.
- 🧙‍♂️ Mint y listado de NFTs personalizados con URI e imagen aleatoria.
- 🛍 Visualización por pestañas: NFTs en tienda, minteados, vendidos y comprados.
- 👛 Integración con wallets (como MetaMask).
- 🛒 Compra segura de NFTs usando ETH.
- 🏦 Retiro de fondos para los vendedores.
- 🔥 UI moderna con `React`, `Toastify`, `Icons` y diseño responsivo.

---

## 📦 Estructura del Proyecto
```bash
nft-marketplace/
├── contracts/ # Contratos inteligentes (Solidity)
│ └── Marketplace.sol
├── scripts/ # Scripts Hardhat para deploy y chequeo
│ ├── deploy.ts
│ └── check-tokenCounter.ts
├── src/ # Frontend con React + Vite + TypeScript
│ ├── App.tsx
│ ├── utils/marketplace.ts # Funciones Web3
│ ├── components/ # Componentes UI
│ ├── abi.json # ABI del contrato
│ ├── index.css, App.css # Estilos generales
├── hardhat.config.ts # Configuración Hardhat
├── package.json # Dependencias y scripts
├── vite.config.ts # Configuración de Vite
├── README.md # Este archivo
└── .env # Variables como VITE_CONTRACT_ADDRESS
```

---

## ⚙️ Instalación y Setup

1. **Clona el repositorio**:

```bash
git clone https://github.com/tu-usuario/gsmkev-blockchain-assignments-fpuna.git
cd gsmkev-blockchain-assignments-fpuna
```
2. **Instala dependencias (usando --legacy-peer-deps por compatibilidad con ethers v6)**:
```bash
npm install --legacy-peer-deps
```
3. **Configura .env con tu red y contrato**:
```bash
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_RPC_URL=https://your-eth-node-url
PRIVATE_KEY=tu_clave_privada
```
## 🧠 Contrato Inteligente

El contrato Marketplace.sol está escrito en Solidity 0.8.28 e implementa:

- 🎨 mintAndList(uri, price) → Mintea y lista NFTs.
- 💸 buy(tokenId) → Permite compra con ETH.
- 🏧 withdraw() → Vendedor puede retirar fondos.
- 📦 getListing(tokenId) → Devuelve estado de un NFT.

Todos los NFTs usan el estándar ERC721 (OpenZeppelin).
🖼 Frontend React

Incluye una UI funcional con:
- connectWallet → Conecta MetaMask.
- getAllListings → Carga todos los NFTs.
- purchaseNFT → Realiza compra de NFT.
- withdrawFunds → Retira ETH.
- mintInitialBatch(count) → Mintea NFTs aleatorios con URI.

## 🧪 Scripts útiles

Desplegar contrato
```bash
npx hardhat run scripts/deploy.ts --network ephemery
```
Ver el contador de tokens
```bash
npx hardhat run scripts/check-tokenCounter.ts --network ephemery
```
## 🔧 Herramientas y Librerías
 - Hardhat: Testing, deploy y compilación de contratos.
 - OpenZeppelin Contracts: Seguridad y estándares.
 - ethers.js: Conexión blockchain desde frontend.
 - React + Vite: Interfaz moderna.
 - TypeScript: Tipado estricto.
 - react-toastify, react-icons: Experiencia de usuario.
