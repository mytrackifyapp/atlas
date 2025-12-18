"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Filter } from "lucide-react"

const dealFlowData = [
  {
    id: "6",
    name: "MobileBank",
    logo: "MB",
    stage: "Seed",
    sector: "Fintech",
    country: "Nigeria",
    seeking: "$500K",
    mrr: "$45K",
    growth: "+120%",
  },
  {
    id: "7",
    name: "FarmConnect",
    logo: "FC",
    stage: "Pre-Seed",
    sector: "Agritech",
    country: "Kenya",
    seeking: "$150K",
    mrr: "$12K",
    growth: "+85%",
  },
  {
    id: "8",
    name: "TeleHealth",
    logo: "TH",
    stage: "Seed",
    sector: "Healthtech",
    country: "South Africa",
    seeking: "$400K",
    mrr: "$32K",
    growth: "+95%",
  },
]

export function DealFlowList() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Stage
        </Button>
        <Button variant="outline" size="sm">
          Sector
        </Button>
        <Button variant="outline" size="sm">
          Country
        </Button>
        <Button variant="outline" size="sm">
          Traction
        </Button>
      </div>

      {/* Deal Flow Items */}
      <div className="space-y-3">
        {dealFlowData.map((deal) => (
          <div key={deal.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">{deal.logo}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{deal.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {deal.stage}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {deal.sector}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {deal.country} • Seeking {deal.seeking}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">MRR:</span>{" "}
                      <span className="font-medium">{deal.mrr}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Growth:</span>{" "}
                      <span className="font-medium text-emerald-600">{deal.growth}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/deal-room/${deal.id}`}>
                <Button>View Deal Room</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
