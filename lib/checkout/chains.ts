import type { Address } from "viem"
import { arbitrum, base, mainnet, polygon } from "viem/chains"

import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"

export type ChainConfig = {
  id: CheckoutChainId
  viemChain: typeof base | typeof polygon | typeof mainnet | typeof arbitrum
  label: string
  shortLabel: string
  explorerTxUrl: (hash: string) => string
  rpcUrl: string
  treasuryAddress: Address
  tokens: Record<
    CheckoutStablecoin,
    {
      address: Address
      decimals: number
    }
  >
}

function envAddress(key: string, fallback: Address): Address {
  const value = process.env[key]?.trim()
  return (value || fallback) as Address
}

function envRpc(key: string, fallback: string) {
  return process.env[key]?.trim() || fallback
}

const DEFAULT_TREASURY = "0x0000000000000000000000000000000000000001" as Address

export const CHECKOUT_CHAINS: Record<CheckoutChainId, ChainConfig> = {
  base: {
    id: "base",
    viemChain: base,
    label: "Base",
    shortLabel: "Base",
    explorerTxUrl: (hash) => `https://basescan.org/tx/${hash}`,
    rpcUrl: envRpc("CHECKOUT_RPC_BASE", "https://mainnet.base.org"),
    treasuryAddress: envAddress("CHECKOUT_TREASURY_BASE", DEFAULT_TREASURY),
    tokens: {
      USDC: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
      },
      USDT: {
        address: "0xfde4C96c859c6C7B8BfD3422C5E71563ac57dB93",
        decimals: 6,
      },
    },
  },
  polygon: {
    id: "polygon",
    viemChain: polygon,
    label: "Polygon",
    shortLabel: "Polygon",
    explorerTxUrl: (hash) => `https://polygonscan.com/tx/${hash}`,
    rpcUrl: envRpc("CHECKOUT_RPC_POLYGON", "https://polygon-rpc.com"),
    treasuryAddress: envAddress("CHECKOUT_TREASURY_POLYGON", DEFAULT_TREASURY),
    tokens: {
      USDC: {
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        decimals: 6,
      },
      USDT: {
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
      },
    },
  },
  ethereum: {
    id: "ethereum",
    viemChain: mainnet,
    label: "Ethereum",
    shortLabel: "ETH",
    explorerTxUrl: (hash) => `https://etherscan.io/tx/${hash}`,
    rpcUrl: envRpc("CHECKOUT_RPC_ETHEREUM", "https://ethereum.publicnode.com"),
    treasuryAddress: envAddress("CHECKOUT_TREASURY_ETHEREUM", DEFAULT_TREASURY),
    tokens: {
      USDC: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
      },
      USDT: {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
      },
    },
  },
}

export function getChainConfig(chainId: CheckoutChainId): ChainConfig {
  return CHECKOUT_CHAINS[chainId]
}

export function usdToAtomic(amountUsd: number, decimals: number): bigint {
  const [whole, fraction = ""] = amountUsd.toFixed(decimals).split(".")
  const padded = `${whole}${fraction.padEnd(decimals, "0").slice(0, decimals)}`
  return BigInt(padded)
}

export function atomicToDisplay(amountAtomic: bigint, decimals: number): string {
  const raw = amountAtomic.toString().padStart(decimals + 1, "0")
  const whole = raw.slice(0, -decimals) || "0"
  const fraction = raw.slice(-decimals).replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : whole
}

export function isCheckoutConfigured(): boolean {
  return Object.values(CHECKOUT_CHAINS).some(
    (chain) => chain.treasuryAddress !== DEFAULT_TREASURY,
  )
}
