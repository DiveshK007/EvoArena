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

export async function connectWallet(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    alert("Please install MetaMask or a compatible wallet.");
    return null;
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);

  // Request account access
  await provider.send("eth_requestAccounts", []);

  // Switch to BSC Testnet if needed
  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: BSC_TESTNET_PARAMS.chainId },
    ]);
  } catch (switchError: any) {
    // Chain not added — add it
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

export async function getWalletAddress(): Promise<string | null> {
  if (typeof window === "undefined" || !(window as any).ethereum) return null;
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  try {
    const accounts = await provider.send("eth_accounts", []);
    return accounts[0] || null;
  } catch {
    return null;
  }
}
