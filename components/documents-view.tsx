"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  File,
  FileSpreadsheet,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  FolderOpen,
} from "lucide-react"

const documents = [
  {
    id: 1,
    name: "Pitch Deck - Series A",
    type: "Presentation",
    icon: FileText,
    size: "12.4 MB",
    uploadedBy: "John Doe",
    uploadedDate: "2024-06-10",
    category: "Fundraising",
    shared: true,
  },
  {
    id: 2,
    name: "Financial Model Q2 2024",
    type: "Spreadsheet",
    icon: FileSpreadsheet,
    size: "2.8 MB",
    uploadedBy: "Jane Smith",
    uploadedDate: "2024-06-08",
    category: "Financials",
    shared: false,
  },
  {
    id: 3,
    name: "Term Sheet - Atlas Ventures",
    type: "PDF",
    icon: FileText,
    size: "486 KB",
    uploadedBy: "Sarah Chen",
    uploadedDate: "2024-06-05",
    category: "Legal",
    shared: true,
  },
  {
    id: 4,
    name: "Product Roadmap 2024",
    type: "PDF",
    icon: FileText,
    size: "1.2 MB",
    uploadedBy: "Mike Johnson",
    uploadedDate: "2024-05-28",
    category: "Product",
    shared: true,
  },
  {
    id: 5,
    name: "Cap Table - Current",
    type: "Spreadsheet",
    icon: FileSpreadsheet,
    size: "845 KB",
    uploadedBy: "John Doe",
    uploadedDate: "2024-05-20",
    category: "Financials",
    shared: false,
  },
  {
    id: 6,
    name: "Product Demo Video",
    type: "Video",
    icon: File,
    size: "45.2 MB",
    uploadedBy: "Emily Rodriguez",
    uploadedDate: "2024-05-15",
    category: "Marketing",
    shared: true,
  },
]

const categories = [
  { name: "Fundraising", count: 8, color: "text-primary" },
  { name: "Financials", count: 12, color: "text-blue-500" },
  { name: "Legal", count: 6, color: "text-purple-500" },
  { name: "Product", count: 15, color: "text-pink-500" },
  { name: "Marketing", count: 10, color: "text-orange-500" },
]

export function DocumentsView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Manage and share important company documents"
        actions={
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        }
      />

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {categories.map((category) => (
          <Card key={category.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <FolderOpen className={`h-8 w-8 ${category.color} mb-2`} />
                <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                <p className="text-2xl font-bold">{category.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Documents</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search documents..." className="pl-9 w-[240px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="financials">Financials</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <doc.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{doc.name}</p>
                      <Badge variant="outline">{doc.category}</Badge>
                      {doc.shared && <Badge variant="secondary">Shared</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Uploaded by {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
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
