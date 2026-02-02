"use client"

import { useState } from "react"
import {
  Rocket,
  DollarSign,
  Calendar,
  Target,
  FileText,
  TrendingUp,
  Building2,
  MapPin,
  Globe,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

interface StartFundraiseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const roundTypes = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Bridge Round",
  "Growth Round",
]

const useOfFundsCategories = [
  "Product Development",
  "Team Expansion",
  "Marketing & Sales",
  "Operations",
  "Technology Infrastructure",
  "Market Expansion",
  "Research & Development",
  "Working Capital",
]

export function StartFundraiseDialog({ open, onOpenChange, onSuccess }: StartFundraiseDialogProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    roundType: "",
    targetAmount: "",
    preMoneyValuation: "",
    minInvestment: "",
    maxInvestment: "",
    startDate: "",
    targetCloseDate: "",
    useOfFunds: [] as string[],
    useOfFundsBreakdown: "",
    companyDescription: "",
    traction: "",
    marketOpportunity: "",
    competitiveAdvantage: "",
    pitchDeck: null as string | null,
    financialModel: null as string | null,
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUseOfFundsToggle = (category: string) => {
    setFormData((prev) => {
      const current = prev.useOfFunds
      const updated = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category]
      return { ...prev, useOfFunds: updated }
    })
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (step === 1) {
      if (!formData.roundType || !formData.targetAmount || !formData.startDate || !formData.targetCloseDate) {
        return
      }
    }
    if (step === 2) {
      if (formData.useOfFunds.length === 0 || !formData.useOfFundsBreakdown) {
        return
      }
    }
    if (step === 3) {
      if (!formData.companyDescription || !formData.traction) {
        return
      }
    }

    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step !== totalSteps) {
      return
    }

    setLoading(true)

    try {
      // Call API to create fundraise
      const response = await fetch("/api/founder/fundraise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start fundraise")
      }

      if (!result.success) {
        throw new Error("Fundraise creation was not successful")
      }

      // Reset form
      setFormData({
        roundType: "",
        targetAmount: "",
        preMoneyValuation: "",
        minInvestment: "",
        maxInvestment: "",
        startDate: "",
        targetCloseDate: "",
        useOfFunds: [],
        useOfFundsBreakdown: "",
        companyDescription: "",
        traction: "",
        marketOpportunity: "",
        competitiveAdvantage: "",
        pitchDeck: null,
        financialModel: null,
      })
      setStep(1)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error starting fundraise:", error)
      alert(error instanceof Error ? error.message : "Failed to start fundraise. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step !== totalSteps) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Start Your Fundraise
          </DialogTitle>
          <DialogDescription>
            Set up your fundraising round in just a few steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Step 1: Round Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Round Details
                </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roundType">Round Type *</Label>
                    <Select
                      value={formData.roundType}
                      onValueChange={(value) => handleInputChange("roundType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select round type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roundTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="targetAmount"
                        type="number"
                        placeholder="5000000"
                        value={formData.targetAmount}
                        onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Total amount you're raising</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preMoneyValuation">Pre-Money Valuation</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="preMoneyValuation"
                        type="number"
                        placeholder="25000000"
                        value={formData.preMoneyValuation}
                        onChange={(e) => handleInputChange("preMoneyValuation", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minInvestment">Minimum Investment</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minInvestment"
                        type="number"
                        placeholder="50000"
                        value={formData.minInvestment}
                        onChange={(e) => handleInputChange("minInvestment", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetCloseDate">Target Close Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="targetCloseDate"
                        type="date"
                        value={formData.targetCloseDate}
                        onChange={(e) => handleInputChange("targetCloseDate", e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Use of Funds */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Use of Funds
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Select Categories *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {useOfFundsCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleUseOfFundsToggle(category)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.useOfFunds.includes(category)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category}</span>
                            {formData.useOfFunds.includes(category) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="useOfFundsBreakdown">Detailed Breakdown *</Label>
                    <Textarea
                      id="useOfFundsBreakdown"
                      placeholder="Provide a detailed breakdown of how you plan to use the funds. For example: 40% for product development, 35% for team expansion, 25% for marketing..."
                      rows={6}
                      value={formData.useOfFundsBreakdown}
                      onChange={(e) => handleInputChange("useOfFundsBreakdown", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Company Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Company Description *</Label>
                    <Textarea
                      id="companyDescription"
                      placeholder="Describe your company, mission, and what you do..."
                      rows={4}
                      value={formData.companyDescription}
                      onChange={(e) => handleInputChange("companyDescription", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="traction">Traction & Milestones *</Label>
                    <Textarea
                      id="traction"
                      placeholder="Highlight key metrics, growth, customer base, revenue, partnerships, etc..."
                      rows={4}
                      value={formData.traction}
                      onChange={(e) => handleInputChange("traction", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketOpportunity">Market Opportunity</Label>
                    <Textarea
                      id="marketOpportunity"
                      placeholder="Describe the market size, trends, and opportunity..."
                      rows={3}
                      value={formData.marketOpportunity}
                      onChange={(e) => handleInputChange("marketOpportunity", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competitiveAdvantage">Competitive Advantage</Label>
                    <Textarea
                      id="competitiveAdvantage"
                      placeholder="What makes you unique? Your moat, technology, team, etc..."
                      rows={3}
                      value={formData.competitiveAdvantage}
                      onChange={(e) => handleInputChange("competitiveAdvantage", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents & Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents & Review
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pitch Deck</Label>
                    {formData.pitchDeck ? (
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Pitch deck uploaded</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInputChange("pitchDeck", null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <UploadButton<OurFileRouter>
                        endpoint="pitchDeck"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            handleInputChange("pitchDeck", res[0].url)
                          }
                        }}
                        onUploadError={(error) => {
                          console.error("Upload error:", error)
                          alert("Failed to upload pitch deck. Please ensure it's a PDF file under 10MB.")
                        }}
                        className="ut-button:w-full ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-lg ut-button:border ut-button:border-primary ut-button:font-medium ut-button:px-4 ut-button:py-2 ut-button:shadow-sm ut-ready:bg-primary ut-uploading:bg-primary/50"
                        content={{
                          button: ({ ready }) => (
                            <div className="flex items-center justify-center gap-2 w-full">
                              <FileText className="h-4 w-4" />
                              <span>{ready ? "Upload Pitch Deck (PDF)" : "Preparing..."}</span>
                            </div>
                          ),
                          allowedContent: "PDF files up to 10MB",
                        }}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Financial Model (Optional)</Label>
                    {formData.financialModel ? (
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Financial model uploaded</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInputChange("financialModel", null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <UploadButton<OurFileRouter>
                        endpoint="financialModel"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            handleInputChange("financialModel", res[0].url)
                          }
                        }}
                        onUploadError={(error) => {
                          console.error("Upload error:", error)
                          alert("Failed to upload financial model. Please ensure it's a PDF file under 10MB.")
                        }}
                        className="ut-button:w-full ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-lg ut-button:border ut-button:border-primary ut-button:font-medium ut-button:px-4 ut-button:py-2 ut-button:shadow-sm ut-ready:bg-primary ut-uploading:bg-primary/50"
                        content={{
                          button: ({ ready }) => (
                            <div className="flex items-center justify-center gap-2 w-full">
                              <FileText className="h-4 w-4" />
                              <span>{ready ? "Upload Financial Model (PDF)" : "Preparing..."}</span>
                            </div>
                          ),
                          allowedContent: "PDF files up to 10MB",
                        }}
                      />
                    )}
                  </div>

                  {/* Summary Preview */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-4">Fundraise Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Round Type</p>
                          <p className="font-medium">{formData.roundType || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target Amount</p>
                          <p className="font-medium">
                            {formData.targetAmount
                              ? `$${(parseFloat(formData.targetAmount) / 1000000).toFixed(2)}M`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pre-Money Valuation</p>
                          <p className="font-medium">
                            {formData.preMoneyValuation
                              ? `$${(parseFloat(formData.preMoneyValuation) / 1000000).toFixed(2)}M`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target Close</p>
                          <p className="font-medium">
                            {formData.targetCloseDate
                              ? new Date(formData.targetCloseDate).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-muted-foreground mb-2">Use of Funds</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.useOfFunds.map((category) => (
                              <Badge key={category} variant="secondary">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              {step < totalSteps ? (
                <Button type="button" onClick={handleNext} disabled={loading}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? "Starting Fundraise..." : "Start Fundraise"}
                  <Rocket className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

