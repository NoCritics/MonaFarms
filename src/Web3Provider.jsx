"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { defineChain } from "viem";

// Define Monad Testnet
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MONAD',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
  testnet: true,
});

// Use the project ID from your connectkit.key.txt file
const WALLET_CONNECT_PROJECT_ID = "efc32a8e0fcebd5b40dddc9acf6edc35";

const config = createConfig(
  getDefaultConfig({
    // Supporting mainnet, sepolia testnet, and monad testnet
    chains: [mainnet, sepolia, monadTestnet],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
    },
    // Required API Keys
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
    // Required App Info
    appName: "Monad Deployer",
    // Optional App Info
    appDescription: "A simple web3 wallet connection app",
    appUrl: "http://localhost:5173",
    appIcon: "https://example.com/icon.png" // placeholder icon
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};