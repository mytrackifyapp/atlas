function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type HtmlTemplateInput = {
  width: number
  height: number
  companyName: string
  logoUrl?: string
  logoDataUri?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headline?: string
  subhead?: string
  metric?: string
  metricLabel?: string
  quote?: string
  attribution?: string
  badge?: string
  footerCta?: string
  slideNumber?: string
  slideTotal?: string
  bgImageUrl?: string
  bgDataUri?: string
  screenshotUrl?: string
}

function logoBlock(input: HtmlTemplateInput, size = 52): string {
  const src = input.logoDataUri ?? input.logoUrl
  if (!src) return ""
  return `<img src="${escapeHtml(src)}" width="${size}" height="${size}" style="object-fit:contain;border-radius:12px;" alt="" />`
}

function photoLaunchScale(width: number, height: number) {
  const isSquare = Math.abs(width - height) < 80
  const isStory = height > width * 1.3
  if (isStory) return { headline: 58, subhead: 30, brand: 24, logo: 56, padding: 72 }
  if (isSquare) return { headline: 50, subhead: 26, brand: 22, logo: 52, padding: 56 }
  return { headline: 56, subhead: 28, brand: 22, logo: 52, padding: 64 }
}

export function photoLaunchHtml(input: HtmlTemplateInput): string {
  const scale = photoLaunchScale(input.width, input.height)
  const bgSrc = input.bgDataUri ?? input.bgImageUrl
  const bgLayer = bgSrc
    ? `<img class="bg" src="${escapeHtml(bgSrc)}" alt="" />`
    : `<div class="bg fallback" style="background:linear-gradient(135deg, ${input.primaryColor} 0%, ${input.secondaryColor} 100%);"></div>`

  const badge = input.badge
    ? `<span class="badge">${escapeHtml(input.badge)}</span>`
    : ""

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${input.width}px;
      height: ${input.height}px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #fff;
      overflow: hidden;
      position: relative;
      background: #0f172a;
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.92) saturate(1.05);
    }
    .bg.fallback { position: absolute; inset: 0; }
    .scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.72) 100%);
    }
    .wrap {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 100%;
      padding: ${scale.padding}px;
    }
    .brand { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .brand span { font-size: ${scale.brand}px; font-weight: 700; text-shadow: 0 2px 18px rgba(0,0,0,0.55); }
    .badge {
      display: inline-block;
      align-self: flex-start;
      background: ${input.accentColor};
      color: ${input.primaryColor};
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 18px;
    }
    h1 {
      font-size: ${scale.headline}px;
      font-weight: 800;
      line-height: 1.08;
      margin-bottom: 14px;
      max-width: 92%;
      text-shadow: 0 2px 24px rgba(0,0,0,0.6);
    }
    p {
      font-size: ${scale.subhead}px;
      line-height: 1.35;
      max-width: 88%;
      opacity: 0.95;
      text-shadow: 0 2px 18px rgba(0,0,0,0.55);
    }
  </style>
</head>
<body>
  ${bgLayer}
  <div class="scrim"></div>
  <div class="wrap">
    <div class="brand">${logoBlock(input, scale.logo)}<span>${escapeHtml(input.companyName)}</span></div>
    ${badge}
    <h1>${escapeHtml(input.headline ?? "Launch announcement")}</h1>
    ${input.subhead ? `<p>${escapeHtml(input.subhead)}</p>` : ""}
  </div>
</body>
</html>`
}

export function featureHighlightHtml(input: HtmlTemplateInput): string {
  const screenshot = input.screenshotUrl
    ? `<div class="shot"><img src="${escapeHtml(input.screenshotUrl)}" alt="" /></div>`
    : `<div class="shot placeholder"><span>Product</span></div>`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${input.width}px;
      height: ${input.height}px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, ${input.primaryColor} 0%, ${input.secondaryColor} 100%);
      color: #fff;
      overflow: hidden;
    }
    .grid {
      display: flex;
      height: 100%;
      padding: 56px;
      gap: 40px;
      align-items: center;
    }
    .copy { flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand span { font-size: 20px; font-weight: 700; opacity: 0.95; }
    .badge {
      align-self: flex-start;
      background: ${input.accentColor};
      color: ${input.primaryColor};
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
    }
    h1 { font-size: 48px; font-weight: 800; line-height: 1.1; }
    p { font-size: 24px; line-height: 1.4; opacity: 0.88; }
    .shot {
      width: 46%;
      height: 78%;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.35);
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .shot img { width: 100%; height: 100%; object-fit: cover; }
    .shot.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="grid">
    <div class="copy">
      <div class="brand">${logoBlock(input, 44)}<span>${escapeHtml(input.companyName)}</span></div>
      ${input.badge ? `<div class="badge">${escapeHtml(input.badge)}</div>` : ""}
      <h1>${escapeHtml(input.headline ?? "New feature")}</h1>
      ${input.subhead ? `<p>${escapeHtml(input.subhead)}</p>` : ""}
    </div>
    ${screenshot}
  </div>
</body>
</html>`
}

export function editorialPhotoHtml(input: HtmlTemplateInput): string {
  const scale = editorialFontScale(input.width, input.height)
  const bgSrc = input.bgDataUri ?? input.bgImageUrl
  const bgLayer = bgSrc
    ? `<img class="bg" src="${escapeHtml(bgSrc)}" alt="" />`
    : `<div class="bg fallback" style="background:linear-gradient(135deg, ${input.primaryColor} 0%, ${input.secondaryColor} 100%);"></div>`

  const headline = escapeHtml((input.headline ?? "Your headline here").toUpperCase())
  const footerText = escapeHtml(
    input.footerCta?.trim() || `Brought to you by ${input.companyName}`
  )

  const badge = input.badge
    ? `<span class="badge">${escapeHtml(input.badge.toUpperCase())}</span>`
    : ""

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Oswald:wght@700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${input.width}px;
      height: ${input.height}px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #fff;
      overflow: hidden;
      position: relative;
      background: #0f172a;
    }
    .bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.86) saturate(0.78);
    }
    .bg.fallback { position: absolute; inset: 0; }
    .top-scrim, .bottom-scrim, .center-glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .top-scrim {
      background: linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.14) 38%, rgba(0,0,0,0) 100%);
    }
    .bottom-scrim {
      background: linear-gradient(0deg, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.18) 48%, rgba(0,0,0,0) 100%);
    }
    .center-glow {
      background: radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 58%);
    }
    .topbar {
      position: absolute;
      top: ${scale.padding}px;
      left: ${scale.padding}px;
      right: ${scale.padding}px;
      z-index: 3;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 72%;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-row span {
      font-size: ${scale.brand}px;
      font-weight: 600;
      text-shadow: 0 1px 8px rgba(0,0,0,0.5);
    }
    .badge {
      align-self: flex-start;
      background: rgba(255,255,255,0.22);
      color: #fff;
      padding: 7px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.06em;
    }
    .carousel-dots {
      display: flex;
      gap: 10px;
      align-items: center;
      padding-top: 8px;
      opacity: 0.88;
    }
    .carousel-dots .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid #fff;
      background: transparent;
    }
    .carousel-dots .dot.active { background: #fff; }
    .center {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: ${scale.padding + 20}px ${scale.padding}px;
      gap: 28px;
    }
    h1 {
      font-family: Oswald, "Arial Black", sans-serif;
      font-size: ${scale.headline}px;
      font-weight: 700;
      line-height: 1.06;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      max-width: 92%;
      color: #fff;
      -webkit-text-stroke: 1.5px rgba(0,0,0,0.35);
      paint-order: stroke fill;
      text-shadow:
        0 3px 0 rgba(0,0,0,0.28),
        0 10px 32px rgba(0,0,0,0.55),
        0 0 48px rgba(0,0,0,0.28);
    }
    .subhead {
      font-size: ${scale.subhead}px;
      line-height: 1.38;
      max-width: 84%;
      opacity: 0.94;
      text-shadow: 0 2px 16px rgba(0,0,0,0.55);
    }
    .footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: ${scale.padding}px;
      z-index: 3;
      text-align: center;
      font-size: ${scale.footer}px;
      font-weight: 600;
      letter-spacing: 0.04em;
      opacity: 0.9;
      text-shadow: 0 1px 10px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  ${bgLayer}
  <div class="top-scrim"></div>
  <div class="bottom-scrim"></div>
  <div class="center-glow"></div>
  <div class="topbar">
    <div class="brand">
      <div class="brand-row">${logoBlock(input, scale.logo)}<span>${escapeHtml(input.companyName)}</span></div>
      ${badge}
    </div>
    <div class="carousel-dots" aria-hidden="true">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
  <div class="center">
    <h1>${headline}</h1>
    ${input.subhead ? `<p class="subhead">${escapeHtml(input.subhead)}</p>` : ""}
  </div>
  <div class="footer">${footerText}</div>
</body>
</html>`
}

function brandingFontScale(width: number, height: number) {
  const isSquare = Math.abs(width - height) < 80
  const isStory = height > width * 1.3
  if (isStory) {
    return { headline: 64, subhead: 30, brand: 20, logo: 44, badge: 14, slide: 52, footer: 18, padding: 64 }
  }
  if (isSquare) {
    return { headline: 56, subhead: 26, brand: 18, logo: 40, badge: 13, slide: 46, footer: 16, padding: 56 }
  }
  return { headline: 60, subhead: 28, brand: 19, logo: 42, badge: 13, slide: 48, footer: 17, padding: 60 }
}

export function brandingGraphicHtml(input: HtmlTemplateInput): string {
  const scale = brandingFontScale(input.width, input.height)
  const pad = scale.padding
  const headline = escapeHtml(input.headline ?? "Brand insight")
  const footerText = escapeHtml(input.footerCta?.trim() || input.companyName)
  const slideNum = input.slideNumber?.trim()
  const slideTotal = input.slideTotal?.trim()

  const badge = input.badge
    ? `<span class="badge">${escapeHtml(input.badge.toUpperCase())}</span>`
    : ""

  const slideIndicator = slideNum
    ? `<div class="slide-indicator"><span class="slide-num">${escapeHtml(slideNum.padStart(2, "0"))}</span>${slideTotal ? `<span class="slide-total">/ ${escapeHtml(slideTotal.padStart(2, "0"))}</span>` : ""}</div>`
    : `<div class="carousel-dots" aria-hidden="true"><span class="dot active"></span><span class="dot"></span><span class="dot"></span></div>`

  const metricBlock = input.metric
    ? `<div class="metric"><span class="metric-value">${escapeHtml(input.metric)}</span>${input.metricLabel ? `<span class="metric-label">${escapeHtml(input.metricLabel)}</span>` : ""}</div>`
    : ""

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Oswald:wght@700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${input.width}px;
      height: ${input.height}px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #fff;
      overflow: hidden;
      position: relative;
      background: linear-gradient(145deg, ${input.primaryColor} 0%, ${input.secondaryColor} 100%);
    }
    .shape-triangle {
      position: absolute;
      top: 0;
      right: 0;
      width: 52%;
      height: 52%;
      background: ${input.accentColor};
      opacity: 0.32;
      clip-path: polygon(100% 0, 100% 100%, 0 0);
    }
    .shape-bottom {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 38%;
      height: 38%;
      background: ${input.accentColor};
      opacity: 0.14;
      clip-path: polygon(0 100%, 100% 100%, 0 0);
    }
    .shape-ring {
      position: absolute;
      right: 10%;
      bottom: 18%;
      width: 192px;
      height: 192px;
      border: 3px solid ${input.accentColor};
      border-radius: 50%;
      opacity: 0.35;
    }
    .shape-square {
      position: absolute;
      right: 22%;
      top: 16%;
      width: 120px;
      height: 120px;
      border: 2px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      transform: rotate(18deg);
    }
    .topbar {
      position: absolute;
      top: ${pad}px;
      left: ${pad}px;
      right: ${pad}px;
      z-index: 3;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .brand { display: flex; flex-direction: column; gap: 12px; max-width: 70%; }
    .brand-row { display: flex; align-items: center; gap: 12px; }
    .brand-row span { font-size: ${scale.brand}px; font-weight: 600; opacity: 0.92; }
    .badge {
      align-self: flex-start;
      background: ${input.accentColor};
      color: ${input.primaryColor};
      padding: 6px 14px;
      border-radius: 999px;
      font-size: ${scale.badge}px;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .slide-indicator { text-align: right; }
    .slide-num {
      display: block;
      font-family: Oswald, "Arial Black", sans-serif;
      font-size: ${scale.slide}px;
      font-weight: 700;
      color: ${input.accentColor};
      line-height: 1;
    }
    .slide-total {
      display: block;
      font-size: 18px;
      font-weight: 600;
      opacity: 0.45;
      margin-top: 4px;
    }
    .carousel-dots { display: flex; gap: 10px; padding-top: 8px; opacity: 0.75; }
    .carousel-dots .dot {
      width: 10px; height: 10px; border-radius: 50%;
      border: 2px solid #fff; background: transparent;
    }
    .carousel-dots .dot.active { background: ${input.accentColor}; border-color: ${input.accentColor}; }
    .content {
      position: absolute;
      left: ${pad}px;
      right: ${pad}px;
      top: 38%;
      transform: translateY(-42%);
      z-index: 2;
      display: flex;
      gap: 22px;
    }
    .accent-bar {
      width: 5px;
      border-radius: 3px;
      background: ${input.accentColor};
      flex-shrink: 0;
      align-self: stretch;
      min-height: 80px;
    }
    .copy { display: flex; flex-direction: column; gap: 24px; max-width: 88%; }
    h1 {
      font-family: Oswald, "Arial Black", sans-serif;
      font-size: ${scale.headline}px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: 0.02em;
    }
    .subhead {
      font-size: ${scale.subhead}px;
      line-height: 1.4;
      opacity: 0.82;
      max-width: 92%;
    }
    .metric {
      position: absolute;
      left: ${pad}px;
      right: ${pad}px;
      bottom: ${pad + 56}px;
      padding: 18px 24px;
      border-radius: 16px;
      border: 2px solid ${input.accentColor};
      background: rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .metric-value {
      font-family: Oswald, sans-serif;
      font-size: 42px;
      font-weight: 700;
      color: ${input.accentColor};
    }
    .metric-label { font-size: 18px; opacity: 0.75; }
    .footer-bar {
      position: absolute;
      left: ${pad}px;
      bottom: ${pad}px;
      z-index: 3;
    }
    .footer-accent {
      width: 80px;
      height: 4px;
      border-radius: 2px;
      background: ${input.accentColor};
      margin-bottom: 12px;
    }
    .footer-text {
      font-size: ${scale.footer}px;
      font-weight: 600;
      opacity: 0.7;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <div class="shape-triangle"></div>
  <div class="shape-bottom"></div>
  <div class="shape-ring"></div>
  <div class="shape-square"></div>
  <div class="topbar">
    <div class="brand">
      <div class="brand-row">${logoBlock(input, scale.logo)}<span>${escapeHtml(input.companyName)}</span></div>
      ${badge}
    </div>
    ${slideIndicator}
  </div>
  <div class="content">
    <div class="accent-bar"></div>
    <div class="copy">
      <h1>${headline}</h1>
      ${input.subhead ? `<p class="subhead">${escapeHtml(input.subhead)}</p>` : ""}
    </div>
  </div>
  ${metricBlock}
  <div class="footer-bar">
    <div class="footer-accent"></div>
    <div class="footer-text">${footerText}</div>
  </div>
</body>
</html>`
}

function editorialFontScale(width: number, height: number) {
  const isSquare = Math.abs(width - height) < 80
  const isStory = height > width * 1.3
  if (isStory) {
    return { headline: 82, subhead: 32, brand: 22, logo: 44, footer: 20, padding: 64 }
  }
  if (isSquare) {
    return { headline: 74, subhead: 28, brand: 20, logo: 40, footer: 18, padding: 56 }
  }
  return { headline: 78, subhead: 30, brand: 20, logo: 42, footer: 18, padding: 60 }
}

export function buildHtmlForTemplate(
  templateId:
    | "photo_launch"
    | "editorial_photo"
    | "branding_graphic"
    | "feature_highlight",
  input: HtmlTemplateInput
): string {
  if (templateId === "feature_highlight") return featureHighlightHtml(input)
  if (templateId === "editorial_photo") return editorialPhotoHtml(input)
  if (templateId === "branding_graphic") return brandingGraphicHtml(input)
  return photoLaunchHtml(input)
}
