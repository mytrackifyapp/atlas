import {
  createPublicClient,
  erc20Abi,
  http,
  type Address,
  type Hash,
} from "viem"

import { getChainConfig } from "@/lib/checkout/chains"
import type { CheckoutChainId } from "@/lib/checkout/types"
import { getDatabase } from "@/lib/db"

const BLOCKS_PER_MINUTE: Record<CheckoutChainId, number> = {
  base: 30,
  polygon: 60,
  ethereum: 5,
}

export type TreasuryPaymentWatchTarget = {
  chainId: CheckoutChainId
  tokenAddress: string
  treasuryAddress: string
  amountAtomic: string
  createdAt: string
  payerAddress?: string
}

export type DiscoveredPayment = {
  txHash: Hash
  payerAddress: Address
  blockNumber: bigint
}

export async function getUsedCheckoutTxHashes(): Promise<Set<string>> {
  const db = await getDatabase()
  const hashes = new Set<string>()

  const intentDocs = await db
    .collection("checkout_intents")
    .find(
      { txHash: { $exists: true, $ne: null } },
      { projection: { txHash: 1 } },
    )
    .toArray()

  for (const doc of intentDocs) {
    if (doc.txHash) hashes.add(String(doc.txHash).toLowerCase())
  }

  const paymentDocs = await db
    .collection("checkout_payments")
    .find({}, { projection: { txHash: 1 } })
    .toArray()

  for (const doc of paymentDocs) {
    if (doc.txHash) hashes.add(String(doc.txHash).toLowerCase())
  }

  return hashes
}

export async function findCheckoutPaymentOnChain(
  intent: TreasuryPaymentWatchTarget & { id?: string },
  options?: { payerAddress?: string; usedTxHashes?: Set<string> },
): Promise<DiscoveredPayment | null> {
  return findTreasuryPaymentOnChain(intent, options)
}

export async function findTreasuryPaymentOnChain(
  target: TreasuryPaymentWatchTarget,
  options?: { payerAddress?: string; usedTxHashes?: Set<string> },
): Promise<DiscoveredPayment | null> {
  const payerHint = options?.payerAddress?.toLowerCase() ?? target.payerAddress?.toLowerCase()
  const chain = getChainConfig(target.chainId)
  const client = createPublicClient({
    chain: chain.viemChain,
    transport: http(chain.rpcUrl),
  })

  const latestBlock = await client.getBlockNumber()
  const minutesSinceCreation = Math.max(
    2,
    (Date.now() - new Date(target.createdAt).getTime()) / 60_000 + 2,
  )
  const lookback = BigInt(
    Math.ceil(minutesSinceCreation * BLOCKS_PER_MINUTE[target.chainId]),
  )
  const fromBlock = latestBlock > lookback ? latestBlock - lookback : 0n

  const treasury = target.treasuryAddress as Address
  const token = target.tokenAddress as Address
  const amount = BigInt(target.amountAtomic)
  const createdAtSec = BigInt(Math.floor(new Date(target.createdAt).getTime() / 1000))
  const usedTxHashes = options?.usedTxHashes ?? new Set<string>()

  const logs = await client.getContractEvents({
    abi: erc20Abi,
    address: token,
    eventName: "Transfer",
    args: { to: treasury },
    fromBlock,
    toBlock: "latest",
  })

  type Candidate = DiscoveredPayment & { timestamp: bigint }
  const candidates: Candidate[] = []

  for (const log of logs) {
    const { from, value } = log.args
    if (value !== amount) continue
    if (payerHint && from.toLowerCase() !== payerHint) continue

    const hash = log.transactionHash.toLowerCase()
    if (usedTxHashes.has(hash)) continue

    const block = await client.getBlock({ blockNumber: log.blockNumber })
    if (block.timestamp < createdAtSec) continue

    candidates.push({
      txHash: log.transactionHash,
      payerAddress: from,
      blockNumber: log.blockNumber,
      timestamp: block.timestamp,
    })
  }

  candidates.sort((a, b) => Number(a.blockNumber - b.blockNumber))
  const match = candidates[0]
  if (!match) return null

  return {
    txHash: match.txHash,
    payerAddress: match.payerAddress,
    blockNumber: match.blockNumber,
  }
}
