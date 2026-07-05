export type UserWalletRecord = {
  userId: string
  address: string
  chainId: number
  chainLabel: string
  provider: string
  nativeBalance: string
  nativeSymbol: string
  usdcBalance: string | null
  usdtBalance: string | null
  connectedAt: string
  updatedAt: string
}

export type UserWalletSnapshot = Omit<UserWalletRecord, "userId">
