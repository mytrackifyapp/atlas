import Link from "next/link"
import { ArrowLeft, Shield, Lock, Key, Server, Eye, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SecurityPage() {
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
            <h1 className="text-4xl font-bold tracking-tight mb-4">Security</h1>
            <p className="text-lg text-muted-foreground">
              Our commitment to protecting your data and ensuring platform security
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
                  <Lock className="h-6 w-6 text-primary" />
                  Data Encryption
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    All data transmitted to and from Trackify Atlas is encrypted using industry-standard TLS 1.3 
                    encryption. This ensures that your information remains secure during transmission over the internet.
                  </p>
                  <p>
                    Data at rest is encrypted using AES-256 encryption, providing strong protection for your stored 
                    information.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Key className="h-6 w-6 text-primary" />
                  Authentication & Access Control
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We implement multiple layers of security for user authentication:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Strong password requirements and hashing</li>
                    <li>Multi-factor authentication (MFA) support</li>
                    <li>Session management and timeout controls</li>
                    <li>Role-based access control (RBAC)</li>
                    <li>Regular security audits and penetration testing</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Server className="h-6 w-6 text-primary" />
                  Infrastructure Security
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Our infrastructure is built with security as a priority:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Hosted on secure, compliant cloud infrastructure</li>
                    <li>Regular security updates and patches</li>
                    <li>Network segmentation and firewalls</li>
                    <li>Intrusion detection and prevention systems</li>
                    <li>24/7 security monitoring and incident response</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Data Privacy & Compliance
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We are committed to protecting your privacy and complying with applicable data protection 
                    regulations, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>GDPR (General Data Protection Regulation)</li>
                    <li>CCPA (California Consumer Privacy Act)</li>
                    <li>Local data protection laws in African jurisdictions</li>
                    <li>Industry-specific compliance requirements</li>
                  </ul>
                  <p>
                    We conduct regular privacy impact assessments and maintain comprehensive data processing 
                    documentation.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Security Best Practices
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We follow industry best practices to maintain security:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Regular security training for all employees</li>
                    <li>Secure software development lifecycle (SDLC)</li>
                    <li>Code reviews and security testing</li>
                    <li>Vulnerability management and patching</li>
                    <li>Third-party security assessments</li>
                    <li>Incident response planning and drills</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  Your Role in Security
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You play an important role in keeping your account secure:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Use a strong, unique password</li>
                    <li>Enable multi-factor authentication when available</li>
                    <li>Keep your login credentials confidential</li>
                    <li>Log out when using shared devices</li>
                    <li>Report any suspicious activity immediately</li>
                    <li>Keep your software and devices updated</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">Security Incident Response</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    In the event of a security incident, we have established procedures to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Quickly identify and contain the threat</li>
                    <li>Assess the impact and scope</li>
                    <li>Notify affected users as required by law</li>
                    <li>Remediate vulnerabilities and prevent recurrence</li>
                    <li>Document lessons learned and improve processes</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">Third-Party Security</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We carefully vet all third-party service providers and require them to maintain appropriate 
                    security standards. We regularly review their security practices and compliance with our 
                    security requirements.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50">
                <h2 className="text-2xl font-semibold mb-4">Security Certifications</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We are committed to maintaining industry-recognized security certifications and standards. 
                    Our security practices are regularly audited and validated by independent third parties.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border-border/50 bg-primary/5">
                <h2 className="text-2xl font-semibold mb-4">Report a Security Issue</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you discover a security vulnerability or have concerns about security, please report it 
                    to us immediately:
                  </p>
                  <p className="font-medium text-foreground">
                    Email: security@trackifyatlas.com
                  </p>
                  <p className="text-sm">
                    We appreciate responsible disclosure and will work with you to address any security concerns 
                    promptly.
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
