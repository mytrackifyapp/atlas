"use client"

import {
  createWalletClient,
  custom,
  erc20Abi,
  type Address,
  type Hash,
} from "viem"

import { getChainConfig, type ChainConfig } from "@/lib/checkout/chains"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum
  return eth ?? null
}

export async function connectCheckoutWallet(chain: ChainConfig): Promise<{
  address: Address
  client: ReturnType<typeof createWalletClient>
}> {
  const ethereum = getEthereum()
  if (!ethereum) {
    throw new Error("No Web3 wallet found. Install MetaMask, Rabby, or Coinbase Wallet.")
  }

  const client = createWalletClient({
    chain: chain.viemChain,
    transport: custom(ethereum),
  })

  const [address] = await client.requestAddresses()

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chain.viemChain.id.toString(16)}` }],
    })
  } catch (switchError) {
    const err = switchError as { code?: number }
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${chain.viemChain.id.toString(16)}`,
            chainName: chain.label,
            nativeCurrency: chain.viemChain.nativeCurrency,
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.viemChain.blockExplorers?.default.url],
          },
        ],
      })
    } else {
      throw switchError
    }
  }

  return { address, client }
}

export async function sendStablecoinTransfer(input: {
  chain: ChainConfig
  tokenAddress: Address
  treasuryAddress: Address
  amountAtomic: bigint
  fromAddress: Address
  stablecoin?: string
  amountDisplay?: string
}): Promise<Hash> {
  const ethereum = getEthereum()
  if (!ethereum) throw new Error("Wallet disconnected")

  const client = createWalletClient({
    chain: input.chain.viemChain,
    transport: custom(ethereum),
    account: input.fromAddress,
  })

  try {
    return await client.writeContract({
      address: input.tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [input.treasuryAddress, input.amountAtomic],
    })
  } catch (error) {
    throw new Error(
      formatCheckoutWalletError(error, {
        stablecoin: input.stablecoin,
        amountDisplay: input.amountDisplay,
      }),
    )
  }
}
