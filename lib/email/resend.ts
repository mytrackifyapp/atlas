import "server-only"

import { Resend } from "resend"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export function getResend() {
  const apiKey = requireEnv("RESEND_API_KEY")
  return new Resend(apiKey)
}

function getCeoFrom() {
  // Must be a verified sender in Resend; display name can change freely.
  return process.env.RESEND_CEO_FROM ?? 'Divine Gabriel (CEO) <hey@mytrackify.com>'
}

export type ContactEmailPayload = {
  firstName: string
  lastName: string
  workEmail: string
  subject: string
  message: string
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function toHtmlParagraphs(input: string) {
  return escapeHtml(input)
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px;line-height:1.6;">${p.replaceAll("\n", "<br/>")}</p>`)
    .join("")
}

function baseEmailTemplate(opts: {
  preheader: string
  title: string
  introHtml: string
  bodyHtml: string
  cta?: { label: string; href: string }
  footerHtml?: string
}) {
  const ctaHref = opts.cta ? escapeHtml(opts.cta.href) : "https://mytrackify.com"
  const ctaLabel = opts.cta?.label ?? "Visit Trackify"
  const button = opts.cta
    ? `<a href="${ctaHref}" style="display:inline-block;background:#c0fc64;color:#111111;text-decoration:none;font-weight:700;font-size:15px;padding:12px 18px;border-radius:999px;">
        ${escapeHtml(opts.cta.label)} →
      </a>`
    : ""
  const footer =
    opts.footerHtml ??
    `<div style="font-size:15px;font-weight:700;color:#111111;">Trackify Finance</div>
     <div style="margin-top:2px;font-size:14px;line-height:1.5;color:#71717a;">mytrackify.com</div>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(opts.title)}</title>
  </head>
  <body style="margin:0;background:#ffffff;color:#111111;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(opts.preheader)}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;padding:28px 16px 40px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding:0 0 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#111111;">Trackify</td>
                    <td align="right">
                      <a href="${ctaHref}" style="color:#3f6212;font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(ctaLabel)} →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:32px;line-height:1.15;font-weight:800;letter-spacing:-0.03em;color:#111111;">
                  ${escapeHtml(opts.title)}
                </h1>
                <div style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#3f3f46;">
                  ${opts.introHtml}
                </div>
                <div style="font-size:16px;line-height:1.65;color:#3f3f46;">
                  ${opts.bodyHtml}
                </div>
                <div style="margin-top:22px;">${button}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 0 0;">
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function welcomeSteps(items: string[]) {
  return items
    .map(
      (item, index) => `
      <tr>
        <td valign="top" width="28" style="padding:0 0 12px;font-size:15px;font-weight:700;line-height:1.5;color:#111111;">
          ${index + 1}
        </td>
        <td valign="top" style="padding:0 0 12px;font-size:15px;line-height:1.5;color:#3f3f46;">
          ${item}
        </td>
      </tr>`,
    )
    .join("")
}

function welcomeEmailHtml(opts: {
  firstName: string
  workspace: string
  steps: string[]
  reply: string
  href: string
}) {
  const name = escapeHtml(opts.firstName)
  const href = escapeHtml(opts.href)
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to Trackify</title>
  </head>
  <body style="margin:0;background:#ffffff;color:#111111;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(opts.workspace)} is ready.
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;padding:28px 16px 40px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding:0 0 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#111111;">Trackify</td>
                    <td align="right">
                      <a href="${href}" style="color:#3f6212;font-size:14px;font-weight:600;text-decoration:none;">Open Trackify →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:32px;line-height:1.15;font-weight:800;letter-spacing:-0.03em;color:#111111;">
                  Welcome, ${name}.
                </h1>
                <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#3f3f46;">
                  I’m Divine Gabriel, CEO at Trackify Finance. ${escapeHtml(opts.workspace)} is ready.
                </p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#3f3f46;">
                  ${escapeHtml(opts.reply)}
                </p>
                <a href="${href}" style="display:inline-block;background:#c0fc64;color:#111111;text-decoration:none;font-weight:700;font-size:15px;padding:12px 18px;border-radius:999px;">
                  Open Trackify →
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;border-radius:16px;">
                  <tr>
                    <td style="padding:22px 22px 8px;font-size:18px;font-weight:800;color:#111111;">
                      Start here
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 22px 10px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        ${welcomeSteps(opts.steps)}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 0 0;">
                <div style="font-size:15px;line-height:1.6;color:#111111;">Thank you, and welcome to Trackify.</div>
                <div style="margin-top:10px;font-size:15px;font-weight:700;color:#111111;">Divine Gabriel</div>
                <div style="font-size:14px;line-height:1.5;color:#71717a;">CEO, Trackify Finance</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendWelcomeEmail(payload: {
  toEmail: string
  toName?: string | null
  role: "founder" | "investor"
}) {
  const resend = getResend()
  const from = getCeoFrom()

  const firstName =
    (payload.toName ?? "").trim().split(/\s+/)[0]?.trim() || "there"

  const founder = payload.role === "founder"
  const href = founder ? "https://mytrackify.com/founder" : "https://mytrackify.com/portfolio"
  const subject = founder
    ? "Your founder workspace is ready"
    : "Your investor workspace is ready"

  const html = welcomeEmailHtml({
    firstName,
    workspace: founder ? "Your founder workspace" : "Your investor workspace",
    steps: founder
      ? [
          "Add your fundraising details and targets",
          "Upload your deck, model, and diligence docs",
          "Track investors and send updates weekly",
          "Join the investor lounge and meet the community",
        ]
      : [
          "Add the companies in your portfolio",
          "Open a deal flow pipeline and score opportunities",
          "Pull reports for your team and LPs",
        ],
    reply: founder
      ? "Reply to this email if you want help setting up your raise."
      : "Reply to this email if you want a short walkthrough.",
    href,
  })

  const text = [
    `Hi ${firstName},`,
    ``,
    `I’m Divine Gabriel, CEO at Trackify Finance — welcome to Trackify.`,
    ``,
    payload.role === "founder"
      ? `You’re set up as a Founder. Next steps: fundraising details, docs, investor tracking, and the investor lounge.`
      : `You’re set up as an Investor. Next steps: portfolio companies, deal flow, and reports.`,
    ``,
    `Open Trackify: ${payload.role === "founder" ? "https://mytrackify.com/founder" : "https://mytrackify.com/portfolio"}`,
    ``,
    `— Divine Gabriel`,
  ].join("\n")

  return await resend.emails.send({
    from,
    to: payload.toEmail,
    subject,
    text,
    html,
  })
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  const resend = getResend()

  const from = process.env.RESEND_FROM ?? "Trackify <hey@mytrackify.com>"
  const to = (process.env.RESEND_CONTACT_TO ?? "hey@mytrackify.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const text = [
    `New contact form submission`,
    ``,
    `Name: ${payload.firstName} ${payload.lastName}`.trim(),
    `Email: ${payload.workEmail}`,
    `Subject: ${payload.subject}`,
    ``,
    payload.message,
  ].join("\n")

  const html = baseEmailTemplate({
    preheader: `New message from ${payload.firstName} ${payload.lastName} (${payload.workEmail})`,
    title: "New contact form submission",
    introHtml: `<span style="color:#111111;font-weight:700;">${escapeHtml(payload.firstName)} ${escapeHtml(payload.lastName)}</span> <span style="color:#71717a;">(${escapeHtml(payload.workEmail)})</span>`,
    bodyHtml: `
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;margin:10px 0 14px;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Subject</div>
        <div style="font-weight:700;color:#111111;">${escapeHtml(payload.subject)}</div>
      </div>
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Message</div>
        ${toHtmlParagraphs(payload.message)}
      </div>
    `,
    cta: { label: "Reply to sender", href: `mailto:${encodeURIComponent(payload.workEmail)}` },
    footerHtml: `<div style="font-size:14px;line-height:1.5;color:#71717a;">Reply directly to this email to reach the sender.</div>`,
  })

  return await resend.emails.send({
    from,
    to,
    subject: `[Contact] ${payload.subject}`,
    replyTo: payload.workEmail,
    text,
    html,
  })
}

export async function sendContactConfirmationEmail(payload: ContactEmailPayload) {
  const resend = getResend()

  const from = process.env.RESEND_FROM ?? "Trackify Finances <hey@mytrackify.com>"

  const text = [
    `Hi ${payload.firstName},`,
    ``,
    `Thanks for reaching out — we’ve received your message and will get back to you soon.`,
    ``,
    `Subject: ${payload.subject}`,
    ``,
    `Your message:`,
    payload.message,
    ``,
    `— Trackify`,
  ].join("\n")

  const html = baseEmailTemplate({
    preheader: "We received your message and will reply soon.",
    title: "We received your message",
    introHtml: `Hi <strong style="color:#111111;">${escapeHtml(payload.firstName)}</strong> — thanks for reaching out.`,
    bodyHtml: `
      <p style="margin:0 0 14px;line-height:1.65;color:#3f3f46;">
        Our team has your message and will get back to you soon.
      </p>
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;margin:0 0 12px;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Subject</div>
        <div style="font-weight:700;color:#111111;">${escapeHtml(payload.subject)}</div>
      </div>
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Copy of your message</div>
        ${toHtmlParagraphs(payload.message)}
      </div>
    `,
    cta: { label: "Visit Trackify", href: "https://mytrackify.com" },
  })

  return await resend.emails.send({
    from,
    to: payload.workEmail,
    subject: `We received your message: ${payload.subject}`,
    text,
    html,
  })
}

export type AcceleratorApplicationPayload = {
  cohort: string
  fullName: string
  email: string
  companyName: string
  website?: string | null
  stage: string
  location: string
  notes?: string
}

export async function sendAcceleratorApplicationEmail(payload: AcceleratorApplicationPayload) {
  const resend = getResend()
  const from = process.env.RESEND_FROM ?? "Trackify <hey@mytrackify.com>"
  const to = (process.env.RESEND_ACCELERATOR_TO ??
    process.env.RESEND_CONTACT_TO ??
    "hey@mytrackify.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const text = [
    `New accelerator application`,
    ``,
    `Cohort: ${payload.cohort}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Company: ${payload.companyName}`,
    `Website: ${payload.website ?? "—"}`,
    `Stage: ${payload.stage}`,
    `Location: ${payload.location}`,
    ``,
    payload.notes ? `Notes:\n${payload.notes}` : `Notes: —`,
  ].join("\n")

  const html = baseEmailTemplate({
    preheader: `New accelerator application — ${payload.companyName}`,
    title: "New accelerator application",
    introHtml: `<span style="color:#71717a;">Cohort:</span> <strong style="color:#111111;">${escapeHtml(payload.cohort)}</strong>`,
    bodyHtml: `
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;margin:0 0 12px;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Applicant</div>
        <div style="font-weight:800;color:#111111;">${escapeHtml(payload.fullName)}</div>
        <div style="margin-top:4px;color:#3f3f46;">${escapeHtml(payload.email)}</div>
      </div>
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;margin:0 0 12px;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Startup</div>
        <div style="font-weight:800;color:#111111;">${escapeHtml(payload.companyName)}</div>
        <div style="margin-top:6px;color:#3f3f46;line-height:1.6;">
          Stage: ${escapeHtml(payload.stage)}<br/>
          Location: ${escapeHtml(payload.location)}<br/>
          Website: ${payload.website ? `<a href="${escapeHtml(payload.website)}" style="color:#3f6212;text-decoration:none;">${escapeHtml(payload.website)}</a>` : "—"}
        </div>
      </div>
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Notes</div>
        ${payload.notes ? toHtmlParagraphs(payload.notes) : `<p style="margin:0;color:#3f3f46;">—</p>`}
      </div>
    `,
    cta: { label: "Reply to applicant", href: `mailto:${encodeURIComponent(payload.email)}` },
  })

  return await resend.emails.send({
    from,
    to,
    subject: `[Accelerator] ${payload.cohort} — ${payload.companyName}`,
    replyTo: payload.email,
    text,
    html,
  })
}

export async function sendAcceleratorConfirmationEmail(payload: AcceleratorApplicationPayload) {
  const resend = getResend()
  const from = process.env.RESEND_FROM ?? "Trackify <hey@mytrackify.com>"

  const text = [
    `Hi ${payload.fullName},`,
    ``,
    `Thanks for applying to ${payload.cohort}. We’ve received your application.`,
    `The cohort is launching in November — we’ll email you next steps.`,
    ``,
    `Company: ${payload.companyName}`,
    `Stage: ${payload.stage}`,
    `Location: ${payload.location}`,
    ``,
    `— Trackify`,
  ].join("\n")

  const html = baseEmailTemplate({
    preheader: `Application received for ${payload.cohort}.`,
    title: "Application received",
    introHtml: `Hi <strong style="color:#111111;">${escapeHtml(payload.fullName)}</strong> — thanks for applying.`,
    bodyHtml: `
      <p style="margin:0 0 14px;line-height:1.65;color:#3f3f46;">
        We’ve received your application for <strong style="color:#111111;">${escapeHtml(payload.cohort)}</strong>.
        The cohort is launching in <strong style="color:#111111;">November</strong> — we’ll email you next steps.
      </p>
      <div style="padding:16px 18px;border-radius:16px;background:#f4f4f5;">
        <div style="font-size:12px;font-weight:700;color:#71717a;margin-bottom:6px;">Your details</div>
        <div style="color:#3f3f46;line-height:1.6;">
          Company: <strong style="color:#111111;">${escapeHtml(payload.companyName)}</strong><br/>
          Stage: ${escapeHtml(payload.stage)}<br/>
          Location: ${escapeHtml(payload.location)}<br/>
          Website: ${payload.website ? `<a href="${escapeHtml(payload.website)}" style="color:#3f6212;text-decoration:none;">${escapeHtml(payload.website)}</a>` : "—"}
        </div>
      </div>
    `,
    cta: { label: "Visit Trackify", href: "https://mytrackify.com" },
  })

  return await resend.emails.send({
    from,
    to: payload.email,
    subject: `Application received: ${payload.cohort}`,
    text,
    html,
  })
}
