type WorkspaceBlock = {
  type?: string
  content?: string
  meta?: Record<string, unknown>
}

type WorkspacePage = {
  id?: string
  title?: string
  blocks?: WorkspaceBlock[]
}

export type WorkspaceDoc = {
  _id?: { toString(): string }
  id?: string
  name?: string
  type?: string
  pages?: WorkspacePage[]
}

function blockToText(block: WorkspaceBlock): string {
  const content = block.content?.trim() ?? ""
  if (!content) {
    if (block.type === "metric" && block.meta) {
      const value = block.meta.value
      const label = block.meta.label
      if (value != null || label != null) {
        return `${label ?? "Metric"}: ${value ?? ""}`.trim()
      }
    }
    return ""
  }

  if (block.type === "heading1" || block.type === "heading2") {
    return `\n## ${content}\n`
  }

  return content
}

export function extractWorkspaceText(workspace: WorkspaceDoc): string {
  const parts: string[] = []
  const name = workspace.name?.trim()
  const type = workspace.type?.trim()

  if (name) parts.push(`Workspace: ${name}`)
  if (type) parts.push(`Type: ${type}`)

  for (const page of workspace.pages ?? []) {
    const title = page.title?.trim()
    if (title) parts.push(`\n# ${title}`)

    const sorted = [...(page.blocks ?? [])].sort(
      (a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0)
    )

    for (const block of sorted) {
      const text = blockToText(block)
      if (text) parts.push(text)
    }
  }

  return parts.join("\n").trim()
}

export function extractAllWorkspacesText(workspaces: WorkspaceDoc[]): Array<{
  workspaceId: string
  title: string
  content: string
}> {
  const results: Array<{ workspaceId: string; title: string; content: string }> = []

  for (const workspace of workspaces) {
    const workspaceId = workspace._id?.toString() ?? workspace.id ?? ""
    const content = extractWorkspaceText(workspace)
    if (!workspaceId || !content) continue

    results.push({
      workspaceId,
      title: workspace.name?.trim() || "Workspace",
      content,
    })
  }

  return results
}
