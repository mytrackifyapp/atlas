import {
  createPublicClient,
  decodeEventLog,
  http,
  parseAbiItem,
  type Address,
  type Hash,
} from "viem"

import { getChainConfig, type ChainConfig } from "@/lib/checkout/chains"
import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
)

export type VerifiedTransfer = {
  from: Address
  to: Address
  value: bigint
  tokenAddress: Address
  blockNumber: bigint
}

export async function verifyStablecoinTransfer(input: {
  chainId: CheckoutChainId
  stablecoin: CheckoutStablecoin
  txHash: string
  expectedTreasury: Address
  expectedAmountAtomic: bigint
  expectedTokenAddress: Address
  /** Reject transfers mined before this unix timestamp (checkout session start). */
  minCreatedAtSec?: bigint
}): Promise<VerifiedTransfer> {
  const chain = getChainConfig(input.chainId)
  const client = createPublicClient({
    chain: chain.viemChain,
    transport: http(chain.rpcUrl),
  })

  const hash = input.txHash as Hash
  let receipt
  try {
    receipt = await client.getTransactionReceipt({ hash })
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error)
    if (/could not be found|not found yet|not be processed on a block yet/i.test(raw)) {
      throw new Error("Transaction not found yet. Wait for confirmations and try again.")
    }
    throw error
  }

  if (!receipt) {
    throw new Error("Transaction not found yet. Wait for confirmations and try again.")
  }
  if (receipt.status !== "success") {
    throw new Error("Transaction failed on-chain")
  }

  const block = await client.getBlock({ blockNumber: receipt.blockNumber })
  if (input.minCreatedAtSec && block.timestamp < input.minCreatedAtSec) {
    throw new Error("This transaction was sent before the checkout session started.")
  }

  const transfer = findMatchingTransfer(receipt.logs, input)
  if (!transfer) {
    throw new Error(
      "No matching stablecoin transfer to the treasury address was found in this transaction.",
    )
  }

  if (transfer.value < input.expectedAmountAtomic) {
    throw new Error("Transfer amount is less than the required checkout amount.")
  }

  return {
    ...transfer,
    blockNumber: receipt.blockNumber,
  }
}

function findMatchingTransfer(
  logs: Awaited<ReturnType<ReturnType<typeof createPublicClient>["getTransactionReceipt"]>>["logs"],
  input: {
    expectedTreasury: Address
    expectedAmountAtomic: bigint
    expectedTokenAddress: Address
  },
): VerifiedTransfer | null {
  for (const log of logs) {
    if (log.address.toLowerCase() !== input.expectedTokenAddress.toLowerCase()) continue
    try {
      const decoded = decodeEventLog({
        abi: [transferEvent],
        data: log.data,
        topics: log.topics,
      })
      if (decoded.eventName !== "Transfer") continue
      const { from, to, value } = decoded.args
      if (to.toLowerCase() !== input.expectedTreasury.toLowerCase()) continue
      if (value < input.expectedAmountAtomic) continue
      return {
        from,
        to,
        value,
        tokenAddress: log.address,
        blockNumber: 0n,
      }
    } catch {
      continue
    }
  }
  return null
}
