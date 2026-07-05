"use client"

import {
  createPublicClient,
  custom,
  erc20Abi,
  formatUnits,
  type Address,
} from "viem"
import { base, mainnet, polygon } from "viem/chains"

import { CHECKOUT_CHAINS } from "@/lib/checkout/chains"
import type { CheckoutChainId } from "@/lib/checkout/types"

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  isMetaMask?: boolean
  isRabby?: boolean
  isCoinbaseWallet?: boolean
}

const VIEM_CHAIN_BY_ID: Record<number, typeof base | typeof polygon | typeof mainnet> = {
  [base.id]: base,
  [polygon.id]: polygon,
  [mainnet.id]: mainnet,
}

const CHECKOUT_CHAIN_ID_BY_NUM: Partial<Record<number, CheckoutChainId>> = {
  [base.id]: "base",
  [polygon.id]: "polygon",
  [mainnet.id]: "ethereum",
}

export type WalletConnectMetadata = {
  address: Address
  chainId: number
  chainLabel: string
  provider: string
  nativeBalance: string
  nativeSymbol: string
  usdcBalance: string | null
  usdtBalance: string | null
}

function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null
  return (window as Window & { ethereum?: EthereumProvider }).ethereum ?? null
}

function detectProvider(ethereum: EthereumProvider): string {
  if (ethereum.isMetaMask) return "MetaMask"
  if (ethereum.isRabby) return "Rabby"
  if (ethereum.isCoinbaseWallet) return "Coinbase Wallet"
  return "Browser wallet"
}

function chainLabelForId(chainId: number): string {
  const checkoutId = CHECKOUT_CHAIN_ID_BY_NUM[chainId]
  if (checkoutId) return CHECKOUT_CHAINS[checkoutId].label
  const viemChain = VIEM_CHAIN_BY_ID[chainId]
  return viemChain?.name ?? `Chain ${chainId}`
}

async function readStablecoinBalances(
  ethereum: EthereumProvider,
  chainId: number,
  address: Address,
): Promise<{ usdc: string | null; usdt: string | null }> {
  const checkoutId = CHECKOUT_CHAIN_ID_BY_NUM[chainId]
  if (!checkoutId) return { usdc: null, usdt: null }

  const viemChain = VIEM_CHAIN_BY_ID[chainId]
  if (!viemChain) return { usdc: null, usdt: null }

  const chainConfig = CHECKOUT_CHAINS[checkoutId]
  const client = createPublicClient({
    chain: viemChain,
    transport: custom(ethereum),
  })

  async function readBalance(symbol: "USDC" | "USDT") {
    const token = chainConfig.tokens[symbol]
    try {
      const raw = await client.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      })
      return formatUnits(raw, token.decimals)
    } catch {
      return null
    }
  }

  const [usdc, usdt] = await Promise.all([readBalance("USDC"), readBalance("USDT")])
  return { usdc, usdt }
}

export async function connectBrowserWallet(): Promise<WalletConnectMetadata> {
  const ethereum = getEthereum()
  if (!ethereum) {
    throw new Error("No Web3 wallet found. Install MetaMask, Rabby, or Coinbase Wallet.")
  }

  const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[]
  const address = accounts[0] as Address
  if (!address) throw new Error("No wallet account returned")

  const chainIdHex = (await ethereum.request({ method: "eth_chainId" })) as string
  const chainId = Number.parseInt(chainIdHex, 16)
  const viemChain = VIEM_CHAIN_BY_ID[chainId]

  let nativeBalance = "0"
  let nativeSymbol = "ETH"

  if (viemChain) {
    const client = createPublicClient({
      chain: viemChain,
      transport: custom(ethereum),
    })
    const wei = await client.getBalance({ address })
    nativeBalance = formatUnits(wei, viemChain.nativeCurrency.decimals)
    nativeSymbol = viemChain.nativeCurrency.symbol
  }

  const { usdc, usdt } = await readStablecoinBalances(ethereum, chainId, address)

  return {
    address,
    chainId,
    chainLabel: chainLabelForId(chainId),
    provider: detectProvider(ethereum),
    nativeBalance,
    nativeSymbol,
    usdcBalance: usdc,
    usdtBalance: usdt,
  }
}

export function explorerAddressUrl(chainId: number, address: string): string | null {
  const checkoutId = CHECKOUT_CHAIN_ID_BY_NUM[chainId]
  if (!checkoutId) return null
  const chain = CHECKOUT_CHAINS[checkoutId]
  const baseUrl = chain.viemChain.blockExplorers?.default.url
  if (!baseUrl) return null
  return `${baseUrl}/address/${address}`
}
