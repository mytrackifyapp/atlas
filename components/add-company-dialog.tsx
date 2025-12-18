"use client"

import { useState } from "react"
import { Building2, Upload, X, MapPin, DollarSign, Calendar, Users, Globe, FileText, Sparkles } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

interface AddCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const investmentStages = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Growth",
  "Bridge",
]

const industries = [
  "AI/ML",
  "FinTech",
  "HealthTech",
  "EdTech",
  "SaaS",
  "E-commerce",
  "CleanTech",
  "PropTech",
  "AgriTech",
  "Logistics",
  "Media & Entertainment",
  "Real Estate",
  "Other",
]

const countries = [
  "Nigeria",
  "Kenya",
  "South Africa",
  "Ghana",
  "Egypt",
  "Tanzania",
  "Ethiopia",
  "Uganda",
  "Morocco",
  "Rwanda",
  "Other",
]

export function AddCompanyDialog({ open, onOpenChange, onSuccess }: AddCompanyDialogProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    stage: "",
    amount: "",
    location: "",
    country: "",
    website: "",
    description: "",
    foundedYear: "",
    employeeCount: "",
    logo: null as string | null, // Store logo URL instead of File
  })
  const [logoUploading, setLogoUploading] = useState(false)

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (step === 1) {
      // Validate basic info
      if (!formData.name || !formData.industry || !formData.stage) {
        return
      }
    }
    if (step < 3) {
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
    e.stopPropagation()
    
    // Only submit if we're on the final step
    if (step !== totalSteps) {
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/portfolio/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry,
          stage: formData.stage,
          amount: formData.amount,
          location: formData.location,
          country: formData.country,
          website: formData.website,
          description: formData.description,
          foundedYear: formData.foundedYear,
          employeeCount: formData.employeeCount,
          logo: formData.logo, // Include logo URL
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add company')
      }

      // Reset form
      setFormData({
        name: "",
        industry: "",
        stage: "",
        amount: "",
        location: "",
        country: "",
        website: "",
        description: "",
        foundedYear: "",
        employeeCount: "",
        logo: null,
      })
      setStep(1)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding company:", error)
      alert(error instanceof Error ? error.message : "Failed to add company. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUploadComplete = (res: { url: string; name: string }[]) => {
    if (res && res[0]) {
      handleInputChange("logo", res[0].url)
      setLogoUploading(false)
    }
  }

  const handleLogoUploadError = (error: Error) => {
    console.error("Logo upload error:", error)
    setLogoUploading(false)
    alert("Failed to upload logo. Please try again.")
  }

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Add Portfolio Company
              </DialogTitle>
              <DialogDescription className="mt-2">
                Add a new company to your portfolio. Fill in the details below.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={(e) => {
          // Prevent form submission on Enter key unless on final step
          if (e.key === 'Enter' && step < 3) {
            e.preventDefault()
          }
        }}>
          <div className="mt-6 space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in-50">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Company Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., TechFlow AI"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">
                          Industry <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleInputChange("industry", value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stage">
                          Investment Stage <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.stage}
                          onValueChange={(value) => handleInputChange("stage", value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {investmentStages.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">
                          Investment Amount
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="pl-9"
                            value={formData.amount}
                            onChange={(e) => handleInputChange("amount", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Location & Details */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in-50">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Location & Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => handleInputChange("country", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">City/Region</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Lagos, Nigeria"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">
                          <Globe className="h-4 w-4 inline mr-1" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="foundedYear">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Founded Year
                        </Label>
                        <Input
                          id="foundedYear"
                          type="number"
                          placeholder="2020"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={formData.foundedYear}
                          onChange={(e) => handleInputChange("foundedYear", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employeeCount">
                          <Users className="h-4 w-4 inline mr-1" />
                          Employee Count
                        </Label>
                        <Select
                          value={formData.employeeCount}
                          onValueChange={(value) => handleInputChange("employeeCount", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10</SelectItem>
                            <SelectItem value="11-50">11-50</SelectItem>
                            <SelectItem value="51-200">51-200</SelectItem>
                            <SelectItem value="201-500">201-500</SelectItem>
                            <SelectItem value="501-1000">501-1000</SelectItem>
                            <SelectItem value="1000+">1000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in-50">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Additional Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of the company, its mission, and key products/services..."
                          rows={5}
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div className="flex items-center gap-4">
                          {formData.logo ? (
                            <div className="flex items-center gap-4 flex-1">
                              <img
                                src={formData.logo}
                                alt="Company logo"
                                className="h-20 w-20 rounded-lg object-cover border border-border"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Logo uploaded</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                  {formData.logo}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleInputChange("logo", null)}
                                disabled={logoUploading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <UploadButton<OurFileRouter>
                                endpoint="companyLogo"
                                onClientUploadComplete={handleLogoUploadComplete}
                                onUploadError={handleLogoUploadError}
                                onUploadBegin={() => setLogoUploading(true)}
                                className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-lg ut-button:border-2 ut-button:border-dashed ut-button:border-border ut-button:hover:border-primary/50"
                                content={{
                                  button: ({ ready }) => (
                                    <div className="flex items-center justify-center gap-2 px-4 py-3">
                                      <Upload className="h-5 w-5 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        {ready ? "Upload logo (optional)" : "Preparing..."}
                                      </span>
                                    </div>
                                  ),
                                  allowedContent: "Image (4MB max)",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {logoUploading && (
                          <p className="text-xs text-muted-foreground">Uploading logo...</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Recommended: Square image, at least 200x200px, max 4MB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Preview */}
                <Card className="border-border">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Company Name</p>
                        <p className="font-medium">{formData.name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Industry</p>
                        <p className="font-medium">{formData.industry || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stage</p>
                        <Badge variant="outline">{formData.stage || "—"}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Investment</p>
                        <p className="font-medium">
                          {formData.amount ? `$${parseFloat(formData.amount).toLocaleString()}` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {formData.location && formData.country
                            ? `${formData.location}, ${formData.country}`
                            : formData.country || formData.location || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Website</p>
                        <p className="font-medium truncate">{formData.website || "—"}</p>
                      </div>
                      {formData.logo && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-2">Logo</p>
                          <img
                            src={formData.logo}
                            alt="Company logo preview"
                            className="h-16 w-16 rounded-lg object-cover border border-border"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNext(e)
                }} 
                className="flex-1"
              >
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Adding Company...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Company
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

