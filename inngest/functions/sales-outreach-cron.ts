import { inngest } from "@/inngest/client"
import { listOwnerIdsWithDueScheduledOutreach } from "@/lib/sales/outreach-service"
import { promoteDueScheduledOutreach } from "@/lib/sales/send-outreach"

export const salesOutreachScheduledCron = inngest.createFunction(
  {
    id: "sales-outreach-scheduled-cron",
    retries: 1,
    triggers: [{ cron: "0 * * * *" }],
  },
  async ({ step }) => {
    const ownerIds = await step.run("find-owners-with-due-steps", async () => {
      return listOwnerIdsWithDueScheduledOutreach()
    })

    let totalPromoted = 0
    for (const ownerId of ownerIds) {
      const promoted = await step.run(`promote-due-${ownerId}`, async () => {
        return promoteDueScheduledOutreach(ownerId)
      })
      totalPromoted += promoted
    }

    return { ownerCount: ownerIds.length, promoted: totalPromoted }
  }
)
