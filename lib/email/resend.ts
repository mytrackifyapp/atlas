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
  const brand = {
    bg: "#0B0B0B",
    card: "#121212",
    border: "rgba(255,255,255,0.08)",
    text: "#F5F5F5",
    muted: "rgba(245,245,245,0.72)",
    // Matches app `--primary: oklch(0.92 0.19 128)` used by the Contact page submit button.
    accent: "#c0fc64",
  }

  const footer =
    opts.footerHtml ??
    `<p style="margin:0;line-height:1.6;color:${brand.muted};">
      Trackify • ${escapeHtml("mytrackify.com")}
    </p>`

  const cta = opts.cta
    ? `<div style="margin-top:18px;">
        <a href="${escapeHtml(opts.cta.href)}"
           style="display:inline-block;background:${brand.accent};color:#0B0B0B;text-decoration:none;font-weight:800;padding:12px 16px;border-radius:10px;">
          ${escapeHtml(opts.cta.label)}
        </a>
      </div>`
    : ""

  // Note: keep styles inline for maximal email client compatibility.
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(opts.title)}</title>
  </head>
  <body style="margin:0;background:${brand.bg};color:${brand.text};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(opts.preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${brand.bg};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
            <tr>
              <td style="padding:0 6px 14px;">
                <div style="font-weight:800;letter-spacing:0.2px;color:${brand.text};font-size:18px;">
                  Trackify Finances
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:${brand.card};border:1px solid ${brand.border};border-radius:16px;padding:22px;">
                <h1 style="margin:0 0 10px;font-size:20px;line-height:1.3;color:${brand.text};">
                  ${escapeHtml(opts.title)}
                </h1>
                <div style="color:${brand.muted};font-size:14px;margin-bottom:14px;">
                  ${opts.introHtml}
                </div>

                <div style="font-size:14px;color:${brand.text};">
                  ${opts.bodyHtml}
                </div>

                ${cta}
              </td>
            </tr>

            <tr>
              <td style="padding:14px 8px 0;color:${brand.muted};font-size:12px;">
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
    introHtml: `<span>${escapeHtml(payload.firstName)} ${escapeHtml(payload.lastName)}</span> <span style="color:rgba(245,245,245,0.55);">(${escapeHtml(payload.workEmail)})</span>`,
    bodyHtml: `
      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;margin:10px 0 14px;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Subject</div>
        <div style="font-weight:700;">${escapeHtml(payload.subject)}</div>
      </div>

      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Message</div>
        ${toHtmlParagraphs(payload.message)}
      </div>
    `,
    cta: { label: "Reply to sender", href: `mailto:${encodeURIComponent(payload.workEmail)}` },
    footerHtml: `<p style="margin:0;line-height:1.6;color:rgba(245,245,245,0.72);">
      You can reply directly to this email to reach the sender.
    </p>`,
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
    introHtml: `Hi <strong style="color:#F5F5F5;">${escapeHtml(payload.firstName)}</strong> — thanks for reaching out.`,
    bodyHtml: `
      <p style="margin:0 0 12px;line-height:1.6;">
        Our team has your message and will get back to you soon.
      </p>

      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;margin:10px 0 14px;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Subject</div>
        <div style="font-weight:700;">${escapeHtml(payload.subject)}</div>
      </div>

      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Copy of your message</div>
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
    introHtml: `<span style="color:rgba(245,245,245,0.72);">Cohort:</span> <strong style="color:#F5F5F5;">${escapeHtml(payload.cohort)}</strong>`,
    bodyHtml: `
      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;margin:10px 0 14px;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Applicant</div>
        <div style="font-weight:800;">${escapeHtml(payload.fullName)}</div>
        <div style="margin-top:4px;color:rgba(245,245,245,0.72);">${escapeHtml(payload.email)}</div>
      </div>

      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;margin:10px 0 14px;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Startup</div>
        <div style="font-weight:800;">${escapeHtml(payload.companyName)}</div>
        <div style="margin-top:6px;color:rgba(245,245,245,0.72);">
          Stage: ${escapeHtml(payload.stage)}<br/>
          Location: ${escapeHtml(payload.location)}<br/>
          Website: ${payload.website ? `<a href="${escapeHtml(payload.website)}" style="color:#c0fc64;text-decoration:none;">${escapeHtml(payload.website)}</a>` : "—"}
        </div>
      </div>

      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Notes</div>
        ${payload.notes ? toHtmlParagraphs(payload.notes) : `<p style="margin:0;color:rgba(245,245,245,0.72);">—</p>`}
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
    introHtml: `Hi <strong style="color:#F5F5F5;">${escapeHtml(payload.fullName)}</strong> — thanks for applying.`,
    bodyHtml: `
      <p style="margin:0 0 12px;line-height:1.6;">
        We’ve received your application for <strong>${escapeHtml(payload.cohort)}</strong>.
        The cohort is launching in <strong>November</strong> — we’ll email you next steps.
      </p>

      <div style="padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0E0E0E;">
        <div style="font-size:12px;color:rgba(245,245,245,0.6);margin-bottom:6px;">Your details</div>
        <div style="color:rgba(245,245,245,0.72);line-height:1.6;">
          Company: <strong style="color:#F5F5F5;">${escapeHtml(payload.companyName)}</strong><br/>
          Stage: ${escapeHtml(payload.stage)}<br/>
          Location: ${escapeHtml(payload.location)}<br/>
          Website: ${payload.website ? `<a href="${escapeHtml(payload.website)}" style="color:#c0fc64;text-decoration:none;">${escapeHtml(payload.website)}</a>` : "—"}
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
