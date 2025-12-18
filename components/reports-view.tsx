"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, Eye, Plus } from "lucide-react"

const reports = [
  {
    id: 1,
    title: "Q2 2024 Portfolio Performance Report",
    type: "Quarterly",
    date: "2024-06-30",
    status: "Published",
    description: "Comprehensive analysis of portfolio performance for Q2 2024",
  },
  {
    id: 2,
    title: "May 2024 Deal Flow Summary",
    type: "Monthly",
    date: "2024-05-31",
    status: "Published",
    description: "Monthly deal flow metrics and pipeline analysis",
  },
  {
    id: 3,
    title: "2024 Mid-Year Investment Thesis",
    type: "Annual",
    date: "2024-06-15",
    status: "Draft",
    description: "Strategic investment thesis and market analysis",
  },
  {
    id: 4,
    title: "TechFlow AI Due Diligence Report",
    type: "Company",
    date: "2024-06-10",
    status: "Published",
    description: "Complete due diligence findings and recommendation",
  },
  {
    id: 5,
    title: "Sector Analysis: AI/ML Investments",
    type: "Sector",
    date: "2024-05-20",
    status: "Published",
    description: "Deep dive into AI/ML sector performance and trends",
  },
]

const statusColors = {
  Published: "default",
  Draft: "secondary",
  Archived: "outline",
}

export function ReportsView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Access and manage investment reports and analysis"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        }
      />

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Quarterly</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Monthly</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-purple-500 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Company</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-pink-500 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Sector</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Annual</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge variant={statusColors[report.status] as any}>{report.status}</Badge>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(report.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
