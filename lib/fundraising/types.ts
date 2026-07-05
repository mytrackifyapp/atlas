import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"

export type FundraisePaymentIntentStatus =
  | "pending"
  | "submitted"
  | "confirmed"
  | "expired"
  | "failed"

export type FundraisePaymentIntent = {
  id: string
  fundraiseId: string
  founderUserId: string
  payerUserId: string
  amountUsd: number
  amountAtomic: string
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  treasuryAddress: string
  tokenAddress: string
  payerAddress?: string
  txHash?: string
  status: FundraisePaymentIntentStatus
  expiresAt: string
  confirmedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export type FundraisePayment = {
  id: string
  fundraiseId: string
  founderUserId: string
  payerUserId: string
  payerAddress: string
  amountUsd: number
  amountAtomic: string
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  txHash: string
  treasuryAddress: string
  createdAt: string
}

export type ActiveFundraise = {
  id: string
  userId: string
  roundType: string
  targetAmount: number
  committedAmount: number
  minInvestment: number | null
  maxInvestment: number | null
  receivingWalletAddress: string | null
  receivingChainId: number | null
  receivingChainLabel: string | null
  status: string
}

export type PlatformFeeStatus = "pending" | "paid"

export type PlatformFee = {
  id: string
  fundraiseId: string
  founderUserId: string
  paymentId: string
  paymentTxHash: string
  grossAmountUsd: number
  feeBps: number
  feeAmountUsd: number
  stablecoin: CheckoutStablecoin
  chainId: CheckoutChainId
  treasuryAddress: string
  tokenAddress: string
  status: PlatformFeeStatus
  settlementTxHash?: string
  paidAt?: string
  createdAt: string
}

export type PlatformFeeSummary = {
  feeBps: number
  grossReceivedUsd: number
  feesOwedUsd: number
  feesPaidUsd: number
  pendingCount: number
  totalFeeCount: number
}
