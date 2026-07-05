function getErrorText(error: unknown): string {
  if (error instanceof Error) {
    const parts = [error.message]
    const extra = error as Error & { shortMessage?: string; cause?: unknown }
    if (extra.shortMessage && extra.shortMessage !== error.message) {
      parts.push(extra.shortMessage)
    }
    if (extra.cause) {
      const causeText = getErrorText(extra.cause)
      if (causeText) parts.push(causeText)
    }
    return parts.join("\n")
  }
  return typeof error === "string" ? error : ""
}

export function formatCheckoutWalletError(
  error: unknown,
  context?: { stablecoin?: string; amountDisplay?: string },
): string {
  const raw = getErrorText(error) || "Payment failed"

  const stablecoin = context?.stablecoin ?? "stablecoins"
  const amount = context?.amountDisplay

  if (/exceeds balance|insufficient funds|insufficient balance/i.test(raw)) {
    return amount
      ? `You don't have enough ${stablecoin} in your wallet. This payment requires ${amount} ${stablecoin}.`
      : `You don't have enough ${stablecoin} in your wallet to complete this payment.`
  }

  if (/user rejected|user denied|rejected the request|action_rejected|4001/i.test(raw)) {
    return "Transaction cancelled in your wallet."
  }

  if (/No Web3 wallet found/i.test(raw)) {
    return "No wallet found. Install MetaMask, Rabby, or Coinbase Wallet."
  }

  if (/Wallet disconnected/i.test(raw)) {
    return "Wallet disconnected. Reconnect and try again."
  }

  const revertReason =
    raw.match(/reverted(?: with the following reason)?:\s*([^\n]+)/i)?.[1]?.trim() ??
    raw.match(/reason:\s*([^\n]+)/i)?.[1]?.trim()

  if (revertReason) {
    if (/exceeds balance/i.test(revertReason)) {
      return amount
        ? `You don't have enough ${stablecoin} in your wallet. This payment requires ${amount} ${stablecoin}.`
        : `You don't have enough ${stablecoin} in your wallet to complete this payment.`
    }
    return `Payment failed: ${revertReason.replace(/\.$/, "")}.`
  }

  if (raw.length > 160 || raw.includes("viem.sh") || raw.includes("Contract Call:")) {
    return "Payment failed. Check your wallet has enough funds on the selected network, then try again."
  }

  return raw
}
