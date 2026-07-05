"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, Copy, ExternalLink, Loader2, RefreshCw, Unplug, User, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { connectBrowserWallet, explorerAddressUrl } from "@/lib/wallets/client"
import type { UserWalletSnapshot } from "@/lib/wallets/types"
import { cn } from "@/lib/utils"

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function avatarColor(address: string) {
  const n = Number.parseInt(address.slice(2, 8), 16)
  const colors = ["#f472b6", "#c084fc", "#60a5fa", "#4ade80", "#fb923c"]
  return colors[n % colors.length]
}

function formatBalance(value: string) {
  const num = Number(value)
  if (!Number.isFinite(num)) return value
  if (num === 0) return "0"
  if (num < 0.0001) return "<0.0001"
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

type Props = {
  className?: string
  align?: "start" | "end"
}

export function SettingsWalletSection({ className, align = "start" }: Props) {
  const [wallet, setWallet] = useState<UserWalletSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/wallet", { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as { wallet: UserWalletSnapshot | null }
      setWallet(data.wallet)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function saveWalletMetadata() {
    const metadata = await connectBrowserWallet()
    const res = await fetch("/api/user/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to save wallet")
    setWallet(data.wallet as UserWalletSnapshot)
    return data.wallet as UserWalletSnapshot
  }

  async function handleConnect() {
    setActing(true)
    try {
      await saveWalletMetadata()
      toast.success("Wallet connected")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to connect wallet")
    } finally {
      setActing(false)
    }
  }

  async function handleRefresh() {
    setActing(true)
    try {
      await saveWalletMetadata()
      toast.success("Wallet updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to refresh wallet")
    } finally {
      setActing(false)
    }
  }

  async function handleDisconnect() {
    setActing(true)
    try {
      const res = await fetch("/api/user/wallet", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to disconnect")
      setWallet(null)
      toast.success("Wallet disconnected")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to disconnect")
    } finally {
      setActing(false)
    }
  }

  function copyAddress() {
    if (!wallet) return
    void navigator.clipboard.writeText(wallet.address)
    toast.success("Address copied")
  }

  if (loading) {
    return (
      <div className={cn("flex items-center py-2", align === "end" && "justify-end", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className={cn("flex items-center", align === "end" && "justify-end", className)}>
        <Button
          variant="outline"
          className="h-10 rounded-full px-4"
          disabled={acting}
          onClick={() => void handleConnect()}
        >
          {acting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          Connect wallet
        </Button>
      </div>
    )
  }

  const explorerUrl = explorerAddressUrl(wallet.chainId, wallet.address)

  return (
    <div className={cn("inline-flex", align === "end" && "self-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={acting}
            className="inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: avatarColor(wallet.address) }}
            >
              <User className="h-4 w-4 text-white" strokeWidth={2.25} />
            </span>
            <span className="font-mono text-sm font-medium text-neutral-900 dark:text-white">
              {shortenAddress(wallet.address)}
            </span>
            {acting ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-56">
          <div className="px-2 py-2 text-xs text-neutral-500">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{wallet.provider}</p>
            <p>{wallet.chainLabel}</p>
            <p className="mt-1 tabular-nums">
              {formatBalance(wallet.nativeBalance)} {wallet.nativeSymbol}
              {wallet.usdcBalance != null ? ` · ${formatBalance(wallet.usdcBalance)} USDC` : ""}
              {wallet.usdtBalance != null ? ` · ${formatBalance(wallet.usdtBalance)} USDT` : ""}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy address
          </DropdownMenuItem>
          {explorerUrl ? (
            <DropdownMenuItem asChild>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on explorer
              </a>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem disabled={acting} onClick={() => void handleRefresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh balances
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            disabled={acting}
            onClick={() => void handleDisconnect()}
          >
            <Unplug className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
