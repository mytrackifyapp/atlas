import { DashboardShell } from "@/components/dashboard-shell"
import { DealRoom } from "@/components/deal-room"

export default function DealRoomPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DealRoom startupId={params.id} />
    </DashboardShell>
  )
}
