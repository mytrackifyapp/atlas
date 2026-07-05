/**
 * Checkout flow smoke tests (lib + API + on-chain read).
 * Run: npx tsx scripts/test-checkout-flow.ts
 */
import { readFileSync } from "fs"
import { resolve } from "path"

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env")
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env optional for CI
  }
}

loadEnv()

import { formatCheckoutWalletError } from "../lib/checkout/wallet-errors"
import {
  atomicToDisplay,
  getChainConfig,
  isCheckoutConfigured,
  usdToAtomic,
} from "../lib/checkout/chains"
import { verifyStablecoinTransfer } from "../lib/checkout/verify-tx"

type Result = { name: string; ok: boolean; detail?: string }

const results: Result[] = []
const base = process.env.CHECKOUT_TEST_BASE_URL ?? "http://localhost:3000"

function assert(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`)
}

async function testWalletErrors() {
  const viemInsufficient =
    'The contract function "transfer" reverted with the following reason: execution reverted: ERC20: transfer amount exceeds balance Contract Call: address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

  assert(
    "insufficient balance → friendly USDC message",
    formatCheckoutWalletError(new Error(viemInsufficient), {
      stablecoin: "USDC",
      amountDisplay: "15",
    }).includes("don't have enough USDC") &&
      formatCheckoutWalletError(new Error(viemInsufficient), {
        stablecoin: "USDC",
        amountDisplay: "15",
      }).includes("15 USDC"),
  )

  assert(
    "user rejected → cancelled message",
    formatCheckoutWalletError(new Error("User rejected the request")).includes(
      "Transaction cancelled",
    ),
  )

  assert(
    "viem dump → short generic message",
    formatCheckoutWalletError(
      new Error("Contract Call: address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 " + "x".repeat(200)),
    ).includes("Payment failed. Check your wallet"),
  )
}

async function testAmounts() {
  const atomic = usdToAtomic(8, 6)
  assert("pack_250 amount atomic", atomic === 8_000_000n, String(atomic))
  assert("pack_250 display", atomicToDisplay(atomic, 6) === "8")
}

async function testApiUnauthenticated() {
  const configRes = await fetch(`${base}/api/checkout/intent`)
  const config = (await configRes.json()) as { configured?: boolean }
  assert("GET /api/checkout/intent returns 200", configRes.status === 200)
  assert("checkout configured flag present", typeof config.configured === "boolean")

  const intentRes = await fetch(`${base}/api/checkout/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "credits",
      creditPackId: "pack_250",
      stablecoin: "USDC",
      chainId: "base",
    }),
  })
  const intentBody = (await intentRes.json()) as { error?: string }
  assert("POST intent without session → 401", intentRes.status === 401)
  assert(
    "POST intent error message",
    intentBody.error === "Sign in to continue checkout",
    intentBody.error,
  )

  const fakeHash = `0x${"a".repeat(64)}`
  const confirmRes = await fetch(`${base}/api/checkout/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intentId: "00000000-0000-0000-0000-000000000000",
      txHash: fakeHash,
    }),
  })
  const confirmBody = (await confirmRes.json()) as { error?: string }
  assert("POST confirm without session → 401", confirmRes.status === 401)
  assert("POST confirm error message", confirmBody.error === "Unauthorized", confirmBody.error)

  const watchRes = await fetch(
    `${base}/api/checkout/watch?intentId=00000000-0000-0000-0000-000000000000`,
  )
  const watchBody = (await watchRes.json()) as { error?: string }
  assert("GET watch without session → 401", watchRes.status === 401)
  assert("GET watch error message", watchBody.error === "Unauthorized", watchBody.error)
}

async function testAuthenticatedFlow() {
  const email = `checkout-smoke-${Date.now()}@mailinator.com`
  const password = "TestPass1!"

  const signUpRes = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: "Checkout Smoke" }),
  })
  assert("sign up for smoke test", signUpRes.status === 200)

  const cookie = signUpRes.headers.get("set-cookie")?.split(";")[0]
  if (!cookie) {
    assert("session cookie received", false)
    return
  }
  const authHeaders = { "Content-Type": "application/json", Cookie: cookie }

  const roleRes = await fetch(`${base}/api/user/update-role`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ role: "founder" }),
  })
  assert("complete onboarding", roleRes.status === 200)

  const intentRes = await fetch(`${base}/api/checkout/intent`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      kind: "credits",
      creditPackId: "pack_250",
      stablecoin: "USDC",
      chainId: "base",
    }),
  })
  const intentData = (await intentRes.json()) as {
    intent?: { id: string; amountDisplay: string; amountAtomic: string }
    error?: string
  }
  assert("create checkout intent", intentRes.status === 200 && Boolean(intentData.intent?.id))
  if (!intentData.intent?.id) return

  const watchRes = await fetch(
    `${base}/api/checkout/watch?intentId=${intentData.intent.id}`,
    { headers: { Cookie: cookie } },
  )
  const watchData = (await watchRes.json()) as { status?: string }
  assert("watch returns pending", watchData.status === "pending", watchData.status)

  const fakeHash = `0x${Date.now().toString(16).padStart(64, "c").slice(-64)}`
  const confirmRes = await fetch(`${base}/api/checkout/confirm`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ intentId: intentData.intent.id, txHash: fakeHash }),
  })
  const confirmData = (await confirmRes.json()) as { error?: string }
  assert(
    "confirm fake tx → friendly not-found message",
    confirmRes.status === 400 &&
      (confirmData.error?.includes("not found yet") ?? false),
    confirmData.error,
  )

  const badConfirmRes = await fetch(`${base}/api/checkout/confirm`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ intentId: intentData.intent.id, txHash: "0xbad" }),
  })
  const badConfirmData = (await badConfirmRes.json()) as { error?: string }
  assert(
    "confirm invalid hash format",
    badConfirmRes.status === 400 &&
      badConfirmData.error === "Invalid confirmation payload",
    badConfirmData.error,
  )
}

async function testOnChainVerify() {
  if (!isCheckoutConfigured()) {
    const chain = getChainConfig("base")
    if (chain.treasuryAddress === "0x0000000000000000000000000000000000000001") {
      assert("on-chain verify skipped", true, "treasury not in local .env")
      return
    }
  }

  const treasury = getChainConfig("base").treasuryAddress
  const fakeHash = `0x${"b".repeat(64)}`
  try {
    await verifyStablecoinTransfer({
      chainId: "base",
      stablecoin: "USDC",
      txHash: fakeHash,
      expectedTreasury: treasury,
      expectedAmountAtomic: 8_000_000n,
      expectedTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    })
    assert("fake tx hash should not verify", false, "unexpected success")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    assert(
      "verifyStablecoinTransfer fake hash message",
      message.includes("not found yet"),
      message,
    )
  }
}

async function main() {
  console.log("Checkout flow tests\n")

  await testWalletErrors()
  await testAmounts()
  await testApiUnauthenticated()
  await testAuthenticatedFlow()
  await testOnChainVerify()

  const failed = results.filter((r) => !r.ok)
  console.log(`\n--- ${results.length - failed.length}/${results.length} passed`)
  if (failed.length) {
    console.log("\nFailed:")
    for (const f of failed) console.log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ""}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
