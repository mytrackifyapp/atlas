export const TRACKIFYVC_FAQS = [
  {
    question: "Are there any additional costs or hidden fees?",
    answer:
      "No, there are no additional costs or hidden fees. The pricing is transparent and includes all features",
  },
  {
    question: "Who can use Trackify?",
    answer:
      "Trackify is built for everyday people, professionals, large organization , SME who want smarter, simpler money management — whether that’s budgeting, saving, or keeping track of both fiat and crypto.",
  },
  {
    question: "Does Trackify support crypto?",
    answer:
      "Yes. Alongside traditional budgeting features, Trackify allows you to view and track your crypto and stablecoin balances, with future updates aimed at seamless swaps and on-chain budgeting vaults.",
  },
  {
    question: "What makes Trackify different from other budgeting apps?",
    answer:
      "Trackify combines easy-to-use finance tools with AI-powered insights. You can chat with your personal AI CFO for advice, while also keeping an eye on both your cash flow and crypto in a single dashboard.",
  },
  {
    question: "Is my data safe with Trackify?",
    answer:
      "Yes. Security is at the core of everything we build. We use bank-grade encryption, secure authentication, and design with privacy by default. Users have full control over their data.",
  },
  {
    question: "How much does Trackify cost?",
    answer:
      "Trackify offers a free version for basic budgeting and tracking, plus premium plans with advanced features like AI insights, custom reports, and crypto tools.",
  },
]

export const TRACKIFYVC_MISSION = [
  {
    icon: "/icons/clock.svg",
    heading: "Responsive Team",
    desc: "Our team listens, learns, and responds quickly — ensuring users always feel supported.",
  },
  {
    icon: "/icons/cursor.svg",
    heading: "Smart Financial Layers",
    desc: "We bring traditional finance and Web3 together in one platform, so you can manage everything from crypto / fiat exchange to savings in stablecoins seamlessly.",
  },
  {
    icon: "/icons/stars.svg",
    heading: "AI-Powered Insights",
    desc: "Trackify analyzes your spending patterns and provides personalized tips to help you save more and spend smarter.",
  },
  {
    icon: "/icons/computer.svg",
    heading: "Secure and Flexible",
    desc: "At Trackify, security isn’t an afterthought — it’s part of our foundation. We’re building with the future in mind: safe authentication, protected data, and flexible tools that will allow users to manage both traditional and digital assets with confidence.",
  },
]

export const TRACKIFYVC_BLOGS = [
  {
    title: "Trackify in pitch competition at AFTS Accra",
    desc: "we are excited to announce our founder will be pitching about our product at the AFTS Accra ",
    image: "/images/afts2.jpg",
    category: "Design System",
  },
]

export const TRACKIFYVC_APIS = [
  {
    title: "Unified Finance Data",
    description: "Access transaction, budgeting, and savings insights in real time..",
  },
  {
    title: "AI-Powered Insights",
    description: "Leverage our financial AI engine for smarter user experiences.",
  },
  {
    title: "Web3 + Fintech Integration",
    description: "Connect both traditional finance and digital assets seamlessly.",
  },
  {
    title: "Built with Security in Mind",
    description: "Bank-level encryption and developer-friendly standards.",
  },
]

export const TRACKIFYVC_MARQUEE_ITEMS = [
  "Seamless Success",
  "Efficient Excellence",
  "Empowering Growth",
  "Innovative Simplicity",
  "Scalable Solutions",
  "Reliable Performance",
  "Global Reach",
]

export const TRACKIFYVC_CONTACT_CARDS = [
  {
    title: "Phone Number",
    value: "+233 532 8187 25",
    icon: "Phone",
  },
  {
    title: "Trackify Address",
    value: "Nigeria, Ghana",
    icon: "MapPin",
  },
  {
    title: "Email Address",
    value: "hey@mytrackify.com",
    icon: "Mail",
  },
] as const

export type TrackifyVcIntegrationCategory = "all" | "social" | "api" | "crm"

export type TrackifyVcIntegration = {
  name: string
  description: string
  icon: string
  category: TrackifyVcIntegrationCategory
}

export const TRACKIFYVC_INTEGRATION_CATEGORIES = [
  { label: "All Integrations", value: "all" },
  { label: "Social Integrations", value: "social" },
  { label: "API Integrations", value: "api" },
  { label: "CRM Integrations", value: "crm" },
] as const

export const TRACKIFYVC_INTEGRATIONS: TrackifyVcIntegration[] = [
  {
    name: "Apple Pay",
    description:
      "Instantly add your Trackify virtual card to Apple Wallet for quick, secure mobile payments.",
    icon: "/icons/apple.svg",
    category: "api",
  },
  {
    name: "Google Pay",
    description:
      "Simplify payments on Android by integrating Trackify virtual cards with Google Pay.",
    icon: "/icons/google-pay.png",
    category: "api",
  },
  {
    name: "Auth0",
    description:
      "Secure authentication and card usage with advanced identity management via Auth0.",
    icon: "/icons/auth.png",
    category: "api",
  },
  {
    name: "MTN Mobile Money",
    description:
      "Add funds to Trackify virtual cards via MTN MoMo, making it easier for users across Africa to transact.",
    icon: "/icons/momo.png",
    category: "api",
  },
  {
    name: "mastercard",
    description: "Secure, flexible, and recognized everywhere Mastercard is accepted.",
    icon: "/icons/master.svg",
    category: "crm",
  },
  {
    name: "Visa",
    description:
      "Shop, subscribe, and pay across millions of merchants worldwide with Trackify Visa..",
    icon: "/icons/visa.svg",
    category: "api",
  },
  {
    name: "Netflix",
    description:
      "Pay for your Netflix subscription securely using Trackify virtual cards, without worrying about declined local cards.",
    icon: "/icons/netflix.png",
    category: "social",
  },
  {
    name: "Plaid",
    description:
      "Connect bank accounts securely with Plaid to fund and manage Trackify virtual cards.",
    icon: "/icons/plaid.webp",
    category: "api",
  },
  {
    name: "spotify",
    description:
      "Subscribe to Spotify Premium and enjoy unlimited music access worldwide, powered by Trackify cards.",
    icon: "/icons/spotify.png",
    category: "social",
  },
  {
    name: "Meta",
    description:
      "Run and manage ad campaigns on Facebook and Instagram by linking Trackify virtual cards",
    icon: "/icons/meta.svg",
    category: "social",
  },
  {
    name: "LinkedIn",
    description:
      "Upgrade to LinkedIn Premium or run recruitment/brand campaigns easily with Trackify cards",
    icon: "/icons/linkedin.svg",
    category: "social",
  },
  {
    name: "Snapchat",
    description:
      "Fund Snapchat Ads or subscription features with Trackify virtual cards to reach younger, engaged audiences.",
    icon: "/icons/snapchat.svg",
    category: "social",
  },
]

