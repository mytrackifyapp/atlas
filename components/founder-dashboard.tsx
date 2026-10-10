"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, AudioLines, DollarSign, Flame, Mic, RefreshCw, TrendingUp, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { FinnaOrb } from "@/components/finna-orb"
import { FinnaVoiceBeam } from "@/components/finna-voice-beam"
import { KPIStrip } from "@/components/kpi-card"
import { StartFundraiseDialog } from "@/components/start-fundraise-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useFinnaVoice } from "@/hooks/use-finna-voice"
import { cn } from "@/lib/utils"

interface FounderStats {
  kpis: {
    monthlyRevenue: {
      value: string
      change: string
      trend: "up" | "down"
    }
    burnRate: {
      value: string
      change: string
      trend: "up" | "down"
    }
    runway: {
      value: string
      change: string
      trend: "up" | "down"
    }
    activeInvestors: {
      value: string
      change: string
      trend: "up" | "down"
    }
  }
  currentFundraise: {
    roundType: string
    target: number
    committed: number
    percentage: number
    status: string
  } | null
  revenueData: Array<{ month: string; revenue: number; expenses: number }>
  cashFlowData: Array<{ month: string; cash: number }>
}

function formatMillions(value: number) {
  return `$${(value / 1000000).toFixed(1)}M`
}

export function FounderDashboard() {
  const router = useRouter()
  const [startFundraiseOpen, setStartFundraiseOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FounderStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const voice = useFinnaVoice({
    onFinalTranscript: (text) => {
      const next = [draft, text].filter(Boolean).join(" ").trim()
      setDraft(next)
    },
  })

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/founder/stats")
      const result = await response.json()

      if (result.success && result.data) {
        setStats(result.data)
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (err) {
      console.error("Error fetching founder stats:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const askFinna = (text?: string) => {
    const query = (text ?? draft).trim()
    if (!query) {
      router.push("/finna")
      return
    }
    router.push(`/finna?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <StartFundraiseDialog
        open={startFundraiseOpen}
        onOpenChange={setStartFundraiseOpen}
        onSuccess={fetchStats}
      />

      {stats ? (
        <KPIStrip
          items={[
            {
              title: "Monthly Revenue",
              value: stats.kpis.monthlyRevenue.value,
              change: stats.kpis.monthlyRevenue.change,
              trend: stats.kpis.monthlyRevenue.trend,
              icon: DollarSign,
            },
            {
              title: "Burn Rate",
              value: stats.kpis.burnRate.value,
              change: stats.kpis.burnRate.change,
              trend: stats.kpis.burnRate.trend,
              icon: Flame,
            },
            {
              title: "Runway",
              value: stats.kpis.runway.value,
              change: stats.kpis.runway.change,
              trend: stats.kpis.runway.trend,
              icon: TrendingUp,
            },
            {
              title: "Active Investors",
              value: stats.kpis.activeInvestors.value,
              change: stats.kpis.activeInvestors.change,
              trend: stats.kpis.activeInvestors.trend,
              icon: Users,
            },
          ]}
        />
      ) : null}

      <div className="mx-auto w-full max-w-2xl space-y-4 pt-8 text-center sm:pt-14">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <FinnaOrb size={20} />
            <p className="text-sm font-medium text-muted-foreground">Finna</p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What do you want to work on next?
          </h1>
        </div>
        <FinnaVoiceBeam stream={voice.listening ? voice.stream : null}>
          <div className="flex gap-2 rounded-xl border border-border/60 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:bg-neutral-900">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  askFinna()
                }
              }}
              placeholder={voice.listening ? "Listening…" : "Ask Finna anything…"}
              className="min-h-11 flex-1 border-0 bg-transparent text-left shadow-none focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 shrink-0 rounded-xl",
                voice.listening && "text-red-500 hover:text-red-500",
              )}
              onClick={() => void voice.toggle()}
              aria-label={voice.listening ? "Stop listening" : "Voice input"}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => askFinna()}
              aria-label="Ask Finna"
            >
              <AudioLines className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </div>
        </FinnaVoiceBeam>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="h-8 rounded-full" asChild>
            <Link href="/founder/updates">Open lounge</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full"
            onClick={() => setStartFundraiseOpen(true)}
          >
            Start fundraising
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full" asChild>
            <Link href="/founder/fundraising">View raise</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full"
            onClick={() => askFinna("Summarize my runway and what I should do next")}
          >
            Ask about runway
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error && !stats ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="flex flex-col rounded-2xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Active fundraising</CardTitle>
                  {stats?.currentFundraise ? (
                    <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                      {stats.currentFundraise.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  {stats?.currentFundraise
                    ? `${stats.currentFundraise.roundType} round progress`
                    : "No live raise yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                {stats?.currentFundraise ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-semibold">{formatMillions(stats.currentFundraise.target)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Committed</span>
                        <span className="font-semibold text-emerald-600">
                          {formatMillions(stats.currentFundraise.committed)} ({stats.currentFundraise.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${Math.min(stats.currentFundraise.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Start a raise to track committed capital here.</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit rounded-full"
                  onClick={() =>
                    stats?.currentFundraise
                      ? router.push("/founder/fundraising")
                      : setStartFundraiseOpen(true)
                  }
                >
                  {stats?.currentFundraise ? "View raise" : "Start fundraising"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col rounded-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Revenue & expenses</CardTitle>
                <CardDescription>Monthly comparison in thousands (USD)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                {stats && stats.revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" width={28} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
                    No revenue data available
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-fit rounded-full" asChild>
                  <Link href="/founder/finance">
                    View finance
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col rounded-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Cash flow</CardTitle>
                <CardDescription>Available cash in thousands (USD)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                {stats && stats.cashFlowData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={stats.cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" width={28} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Line type="monotone" dataKey="cash" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
                    No cash flow data available
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-fit rounded-full" asChild>
                  <Link href="/founder/finance">
                    View cash
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
