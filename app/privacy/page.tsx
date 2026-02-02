import Link from "next/link"
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
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
                  <Eye className="h-6 w-6 text-primary" />
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Trackify Atlas collects information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email address, company details)</li>
                    <li>Profile information and preferences</li>
                    <li>Investment and portfolio data you choose to upload</li>
                    <li>Communication data when you contact us</li>
                    <li>Usage data and analytics when you use our platform</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  2. How We Use Your Information
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                    <li>Detect, prevent, and address technical issues</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  3. Information Sharing and Disclosure
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We do not sell, trade, or rent your personal information. We may share your information only:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  4. Data Security
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal 
                    information against unauthorized access, alteration, disclosure, or destruction. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Secure data storage and backup procedures</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your personal information</li>
                    <li>Request restriction of processing</li>
                    <li>Data portability</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We use cookies and similar tracking technologies to track activity on our platform and store 
                    certain information. You can instruct your browser to refuse all cookies or to indicate when a 
                    cookie is being sent.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined 
                    in this privacy policy, unless a longer retention period is required or permitted by law.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Your information may be transferred to and processed in countries other than your country of 
                    residence. We ensure appropriate safeguards are in place to protect your information in accordance 
                    with this privacy policy.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                    personal information from children.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting 
                    the new policy on this page and updating the "Last updated" date.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50 bg-primary/5">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions about this privacy policy, please contact us at:
                  </p>
                  <p className="font-medium text-foreground">
                    Email: privacy@trackifyatlas.com
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
