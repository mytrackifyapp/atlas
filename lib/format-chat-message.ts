/**
 * Strip common markdown markers so chat bubbles show clean plain text
 * (Finna and AI agents often reply with **bold** and bullet lists).
 */
export function formatChatMessagePlain(text: string): string {
  if (!text) return text

  let out = text

  out = out.replace(/\*\*([^*]+)\*\*/g, "$1")
  out = out.replace(/__([^_]+)__/g, "$1")
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1")
  out = out.replace(/^#{1,6}\s+/gm, "")
  out = out.replace(/`([^`]+)`/g, "$1")
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
  out = out.replace(/^[\t ]*[*\-]\s+/gm, "• ")

  return out
}
