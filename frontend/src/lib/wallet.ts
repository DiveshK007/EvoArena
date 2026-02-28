"use client";

import { ethers } from "ethers";
import { BSC_TESTNET_CHAIN_ID } from "./contracts";

const BSC_TESTNET_PARAMS = {
  chainId: "0x" + BSC_TESTNET_CHAIN_ID.toString(16),
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
  blockExplorerUrls: ["https://testnet.bscscan.com/"],
};

export type WalletType = "metamask" | "walletconnect" | "injected";

/**
 * #20 — Multi-Wallet Support
 *
 * Detects available wallet providers and lets the user pick one.
 */
export function getAvailableWallets(): WalletType[] {
  const wallets: WalletType[] = [];
  if (typeof window === "undefined") return wallets;

  const eth = (window as any).ethereum;
  if (eth) {
    if (eth.isMetaMask) wallets.push("metamask");
    // Generic injected provider fallback
    if (!eth.isMetaMask) wallets.push("injected");
  }

  // WalletConnect is always available as an option (requires @walletconnect/ethereum-provider at runtime)
  wallets.push("walletconnect");

  return wallets;
}

/**
 * Helper: resolve the correct ethereum provider object.
 * When multiple wallet extensions are installed, picks MetaMask explicitly.
 */
function getEthereumProvider(type: WalletType = "metamask"): any | null {
  if (typeof window === "undefined") return null;
  let ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  if (type === "metamask" && ethereum.providers?.length) {
    const mm = ethereum.providers.find((p: any) => p.isMetaMask && !p.isBraveWallet);
    if (mm) return mm;
  }
  return ethereum;
}

/**
 * Connect using the specified wallet type.
 * Falls back to window.ethereum for injected providers.
 * WalletConnect requires @walletconnect/ethereum-provider to be installed.
 */
export async function connectWallet(
  type: WalletType = "metamask"
): Promise<ethers.BrowserProvider | null> {
  if (typeof window === "undefined") return null;

  // ── WalletConnect ──────────────────────────────────────────────────
  if (type === "walletconnect") {
    try {
      const modPath = "@walletconnect/ethereum-provider";
      const mod = await import(/* webpackIgnore: true */ modPath);
      const EthereumProvider = mod.EthereumProvider || mod.default?.EthereumProvider;
      if (!EthereumProvider) throw new Error("WalletConnect package not found.");
      const wcProvider = await EthereumProvider.init({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "PLACEHOLDER",
        chains: [BSC_TESTNET_CHAIN_ID],
        showQrModal: true,
        metadata: {
          name: "EvoArena",
          description: "Adaptive AI-Driven AMM",
          url: "https://evoarena.xyz",
          icons: [],
        },
      });
      await wcProvider.connect();
      return new ethers.BrowserProvider(wcProvider as any);
    } catch (err: any) {
      console.error("WalletConnect error:", err);
      alert("WalletConnect is not available. Use MetaMask instead.");
      return null;
    }
  }

  // ── Injected (MetaMask / generic) ─────────────────────────────────
  const ethereum = getEthereumProvider(type);
  if (!ethereum) {
    alert("Please install MetaMask or a compatible wallet.");
    return null;
  }

  const provider = new ethers.BrowserProvider(ethereum);
  await provider.send("eth_requestAccounts", []);

  // Switch to BSC Testnet if needed
  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: BSC_TESTNET_PARAMS.chainId },
    ]);
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await provider.send("wallet_addEthereumChain", [BSC_TESTNET_PARAMS]);
    } else {
      throw switchError;
    }
  }

  return provider;
}

export async function getWalletSigner(): Promise<ethers.Signer | null> {
  const provider = await connectWallet();
  if (!provider) return null;
  return provider.getSigner();
}

/**
 * Silent check — returns the connected address without triggering a popup.
 * Uses eth_accounts (passive) instead of eth_requestAccounts (active).
 */
export async function getWalletAddress(): Promise<string | null> {
  const ethereum = getEthereumProvider("metamask");
  if (!ethereum) return null;
  try {
    const accounts: string[] = await ethereum.request({ method: "eth_accounts" });
    return accounts[0] || null;
  } catch {
    return null;
  }
}

/**
 * Silent reconnect — builds provider+signer from an already-connected account
 * without triggering any MetaMask popup.
 */
export async function silentReconnect(): Promise<ethers.BrowserProvider | null> {
  const ethereum = getEthereumProvider("metamask");
  if (!ethereum) return null;
  try {
    const accounts: string[] = await ethereum.request({ method: "eth_accounts" });
    if (!accounts[0]) return null;
    return new ethers.BrowserProvider(ethereum);
  } catch {
    return null;
  }
}
