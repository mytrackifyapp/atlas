import { chromium, type Browser } from "playwright-core"

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  }
  return browserPromise
}

export async function isPlaywrightAvailable(): Promise<boolean> {
  try {
    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.close()
    return true
  } catch {
    browserPromise = null
    return false
  }
}

export async function renderHtmlToPng(
  html: string,
  width: number,
  height: number
): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage({
    viewport: { width, height },
  })

  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 })
    await page.evaluate(() => document.fonts.ready).catch(() => undefined)
    await page
      .waitForFunction(
        () => {
          const img = document.querySelector("img.bg") as HTMLImageElement | null
          return !img || (img.complete && img.naturalWidth > 0)
        },
        { timeout: 15000 }
      )
      .catch(() => undefined)
    await page.waitForTimeout(250)
    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width, height },
    })
    return Buffer.from(screenshot)
  } finally {
    await page.close()
  }
}
