import Link from "next/link"
import { ArrowLeft, FileText, Scale, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight">Trackify Atlas</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="space-y-8">
              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By accessing and using Trackify Atlas, you accept and agree to be bound by the terms and 
                    provision of this agreement. If you do not agree to these terms, please do not use our services.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  2. Use License
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Permission is granted to temporarily use Trackify Atlas for personal and commercial purposes. This license does not include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Modifying or copying the materials</li>
                    <li>Using the materials for any commercial purpose without written consent</li>
                    <li>Attempting to reverse engineer any software contained on the platform</li>
                    <li>Removing any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  3. User Accounts
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>When you create an account with us, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your information to keep it accurate</li>
                    <li>Maintain the security of your password and identification</li>
                    <li>Accept all responsibility for activities that occur under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You agree not to use Trackify Atlas to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Transmit any harmful, offensive, or illegal content</li>
                    <li>Interfere with or disrupt the platform or servers</li>
                    <li>Attempt to gain unauthorized access to any portion of the platform</li>
                    <li>Use automated systems to access the platform without permission</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    The platform and its original content, features, and functionality are owned by Trackify Atlas 
                    and are protected by international copyright, trademark, patent, trade secret, and other 
                    intellectual property laws.
                  </p>
                  <p>
                    You retain ownership of any data you upload to the platform. By uploading data, you grant us 
                    a license to use, store, and process that data to provide our services.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">6. Service Availability</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We strive to provide reliable service but do not guarantee that the platform will be available 
                    at all times. We reserve the right to modify, suspend, or discontinue any part of the service 
                    at any time with or without notice.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">7. Disclaimer</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    The information on Trackify Atlas is provided on an "as is" basis. We make no warranties, 
                    expressed or implied, and hereby disclaim all warranties including, without limitation, implied 
                    warranties of merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                  <p>
                    We do not provide investment advice. All investment decisions are your sole responsibility.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    In no event shall Trackify Atlas, its directors, employees, or agents be liable for any 
                    indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                    loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of 
                    the platform.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    You agree to defend, indemnify, and hold harmless Trackify Atlas and its officers, directors, 
                    employees, and agents from and against any claims, liabilities, damages, losses, and expenses, 
                    including legal fees, arising out of or in any way connected with your use of the platform or 
                    violation of these terms.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may terminate or suspend your account and access to the platform immediately, without prior 
                    notice, for conduct that we believe violates these Terms of Service or is harmful to other users, 
                    us, or third parties.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    These terms shall be governed by and construed in accordance with applicable laws, without regard 
                    to its conflict of law provisions.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We reserve the right to modify these terms at any time. We will notify users of any material 
                    changes by posting the new terms on this page and updating the "Last updated" date.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50 bg-primary/5">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <p className="font-medium text-foreground">
                    Email: legal@trackifyatlas.com
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
