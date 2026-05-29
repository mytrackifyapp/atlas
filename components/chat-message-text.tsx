import { formatChatMessagePlain } from "@/lib/format-chat-message"
import { cn } from "@/lib/utils"

export function ChatMessageText({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <span className={cn("whitespace-pre-wrap", className)}>
      {formatChatMessagePlain(content)}
    </span>
  )
}
