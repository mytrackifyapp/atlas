import Link from "next/link"

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <span className="text-xl font-bold tracking-tight text-white">Trackify Finance</span>
            </Link>
            <p className="text-sm text-white/55">Navigate Africa&apos;s venture landscape with precision.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li>
                <Link href="/solutions/investors" className="transition-colors hover:text-white">
                  For Investors
                </Link>
              </li>
              <li>
                <Link href="/solutions/founders" className="transition-colors hover:text-white">
                  For Founders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">
              <Link href="/companies" className="transition-colors hover:text-white/80">
                Startup library
              </Link>
            </h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li>
                <Link href="/stages/pre-seed-seed" className="transition-colors hover:text-white">
                  Pre-Seed &amp; Seed
                </Link>
              </li>
              <li>
                <Link href="/stages/series-a" className="transition-colors hover:text-white">
                  Series A
                </Link>
              </li>
              <li>
                <Link href="/stages/growth" className="transition-colors hover:text-white">
                  Growth
                </Link>
              </li>
              <li>
                <Link href="/stages/late-stage-exit" className="transition-colors hover:text-white">
                  Late Stage &amp; Exit
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li>
                <Link href="/developer" className="transition-colors hover:text-white">
                  Developer API
                </Link>
              </li>
              <li>
                <Link href="/whitepaper" className="transition-colors hover:text-white">
                  White Paper
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row">
          <p>© 2026 Trackify Finance. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6 md:justify-end">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/refund-policy" className="transition-colors hover:text-white">
              Refunds
            </Link>
            <Link href="/security" className="transition-colors hover:text-white">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
