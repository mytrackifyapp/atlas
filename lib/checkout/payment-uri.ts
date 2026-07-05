import type { Address } from "viem"

import { getChainConfig } from "@/lib/checkout/chains"
import type { CheckoutChainId, CheckoutStablecoin } from "@/lib/checkout/types"

export type PaymentQrWallet = "metamask" | "trust" | "address"

type PaymentUriInput = {
  chainId: CheckoutChainId
  stablecoin: CheckoutStablecoin
  tokenAddress: Address
  treasuryAddress: Address
  amountAtomic: bigint
}

/** Trust Wallet UAI coin prefix per supported checkout network. */
const TRUST_COIN_PREFIX: Record<CheckoutChainId, string> = {
  ethereum: "c60",
  polygon: "c966",
  base: "c8453",
}

/** Lowercase hex — mixed-case checksum breaks several wallet QR parsers. */
function hexAddress(address: Address): string {
  return address.toLowerCase()
}

/**
 * Express stablecoin atomic units as scientific notation (e.g. 15 USDC → 15e6).
 * MetaMask parses this reliably in deeplink query strings.
 */
function formatUint256Param(amountAtomic: bigint, decimals: number): string {
  const raw = amountAtomic.toString()
  if (raw === "0") return "0"

  const divisor = 10n ** BigInt(decimals)
  const whole = amountAtomic / divisor
  const fraction = amountAtomic % divisor

  if (fraction === 0n) {
    return `${whole}e${decimals}`
  }

  return raw
}

/** Human-readable token amount for Trust Wallet deeplinks (e.g. 15 USDC → "15"). */
function formatHumanAmount(amountAtomic: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = amountAtomic / divisor
  const fraction = amountAtomic % divisor

  if (fraction === 0n) {
    return whole.toString()
  }

  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "")
  return `${whole}.${fractionStr}`
}

/**
 * EIP-681 ERC-20 transfer URI — for copying/tapping, NOT for QR codes.
 * Phone cameras cannot read `ethereum:` scheme links.
 */
export function buildEip681PaymentUri(input: PaymentUriInput): string {
  const chain = getChainConfig(input.chainId)
  const token = hexAddress(input.tokenAddress)
  const recipient = hexAddress(input.treasuryAddress)
  const decimals = chain.tokens[input.stablecoin].decimals
  const amount = formatUint256Param(input.amountAtomic, decimals)

  return `ethereum:${token}@${chain.viemChain.id}/transfer?address=${recipient}&uint256=${amount}`
}

/**
 * MetaMask universal HTTPS link — works with the phone camera and opens MetaMask.
 * @see https://docs.metamask.io/metamask-connect/evm/guides/metamask-exclusive/use-deeplinks/
 */
export function buildMetaMaskPaymentLink(input: PaymentUriInput): string {
  const chain = getChainConfig(input.chainId)
  const token = hexAddress(input.tokenAddress)
  const recipient = hexAddress(input.treasuryAddress)
  const decimals = chain.tokens[input.stablecoin].decimals
  const amount = formatUint256Param(input.amountAtomic, decimals)

  return `https://link.metamask.io/send/${token}@${chain.viemChain.id}/transfer?address=${recipient}&uint256=${amount}`
}

/**
 * Trust Wallet HTTPS deeplink — works with the phone camera and opens Trust Wallet.
 * @see https://developer.trustwallet.com/developer/develop-for-trust/deeplinking
 */
export function buildTrustWalletPaymentLink(input: PaymentUriInput): string {
  const chain = getChainConfig(input.chainId)
  const token = hexAddress(input.tokenAddress)
  const recipient = hexAddress(input.treasuryAddress)
  const decimals = chain.tokens[input.stablecoin].decimals
  const amount = formatHumanAmount(input.amountAtomic, decimals)
  const coinPrefix = TRUST_COIN_PREFIX[input.chainId]
  const asset = `${coinPrefix}_t${token}`

  const params = new URLSearchParams({
    asset,
    address: recipient,
    amount,
  })

  return `https://link.trustwallet.com/send?${params.toString()}`
}

/**
 * Plain treasury address — scan inside any wallet app, then enter token + amount manually.
 * Does not work with the phone's default camera app.
 */
export function buildAddressOnlyQrValue(input: Pick<PaymentUriInput, "treasuryAddress">): string {
  return hexAddress(input.treasuryAddress)
}

/** QR payload — always HTTPS or plain address; never raw `ethereum:` in QR codes. */
export function buildPaymentQrUri(
  input: PaymentUriInput,
  wallet: PaymentQrWallet = "metamask",
): string {
  switch (wallet) {
    case "trust":
      return buildTrustWalletPaymentLink(input)
    case "address":
      return buildAddressOnlyQrValue(input)
    default:
      return buildMetaMaskPaymentLink(input)
  }
}

/** @deprecated Use buildPaymentQrUri or buildEip681PaymentUri */
export function buildStablecoinPaymentUri(input: {
  chainId: CheckoutChainId
  tokenAddress: Address
  treasuryAddress: Address
  amountAtomic: bigint
  stablecoin?: CheckoutStablecoin
}): string {
  const stablecoin = input.stablecoin ?? "USDC"

  return buildEip681PaymentUri({
    chainId: input.chainId,
    stablecoin,
    tokenAddress: input.tokenAddress,
    treasuryAddress: input.treasuryAddress,
    amountAtomic: input.amountAtomic,
  })
}
