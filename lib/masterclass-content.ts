export const MASTERCLASS = {
  title: "The AI Investment Thesis",
  subtitle: "Why the Next Unicorn Won’t Look Like the Last",
  presenter: "Divine Gabriel",
  role: "Founder & CEO, Trackify",
  duration: "Interactive Masterclass · 60–90 minutes",
  tagline: "AI × Finance × Infrastructure × Capital",
  email: "hey@mytrackify.com",
} as const

export type MasterclassSlideMeta = {
  id: string
  title: string
  section: string
  minutes: number
  notes: string
}

export const SLIDE_META: MasterclassSlideMeta[] = [
  {
    id: "cover",
    title: "The AI Investment Thesis",
    section: "Open",
    minutes: 2,
    notes: "Set the room. This is not an AI hype talk. It is an investment masterclass about how company economics are changing — and why that forces a new underwriting lens. Promise the arc: old rules → new economics → agents → autonomous finance → Africa’s leapfrog → a live thesis-building exercise.",
  },
  {
    id: "question",
    title: "Yesterday’s Rules",
    section: "The Question",
    minutes: 4,
    notes: "Name the inherited VC pattern: large teams, rapid hiring, software scale, capital intensity, classic moats, predictable org charts. Those heuristics worked for the SaaS era. Then ask: if AI changes how companies are built, shouldn’t it change how we invest in them? Leave the question hanging.",
  },
  {
    id: "eras",
    title: "What Each Era Rewarded",
    section: "The Question",
    minutes: 5,
    notes: "Walk the room through economic history as a sequence of scarce advantages: Industrial rewarded manufacturing, Internet rewarded information, Mobile rewarded connectivity, Software rewarded scale. AI rewards intelligence. The shift is from owning infrastructure to orchestrating intelligence. Investors who underwrite the last era’s advantage will miss the next one.",
  },
  {
    id: "new-company",
    title: "AI Employees",
    section: "New Economics",
    minutes: 5,
    notes: "Make it concrete: 10 people plus AI agents can carry the operational load of a much larger org. Engineering, research, support, marketing, finance, ops, analysis. The real question is not headcount — it is how much company a small team can now build. Use examples like Cursor, Midjourney, Perplexity only as illustrations of leverage, not as the investment target.",
  },
  {
    id: "economics",
    title: "Headcount ≠ Capacity",
    section: "New Economics",
    minutes: 6,
    notes: "Traditional: Capital → Employees → Operations → Revenue. AI-native: Capital → Intelligence → Automation → Revenue. This rewrites cost structure, hiring, speed, capital efficiency, gross margins, and scale. Introduce the new KPI: revenue (and output) per employee. The smallest team may not be the weakest team — it may be the most leveraged.",
  },
  {
    id: "lens",
    title: "A New Investment Lens",
    section: "New Economics",
    minutes: 5,
    notes: "Stop asking only ‘how many people are building this?’ Start asking ‘how much intelligence can this company deploy?’ Diligence should cover AI leverage, agent autonomy, proprietary data, distribution, infrastructure, workflow ownership, network effects, and capital efficiency. This is the underwriting checklist for the rest of the session.",
  },
  {
    id: "moat",
    title: "The New Moat",
    section: "New Economics",
    minutes: 6,
    notes: "Models commoditize. If everyone has GPT-class capability, defensibility moves above the model: proprietary data, distribution, workflow lock-in, infrastructure rails, trust/compliance, and network effects where more usage creates more intelligence. Teach the inversion: the model is the table stakes; the system around it is the company.",
  },
  {
    id: "agents",
    title: "Software Becomes an Actor",
    section: "Agents",
    minutes: 5,
    notes: "Traditional software waits: Human → Software → Outcome. Agents invert it: Goal → Agent → Decisions → Actions → Outcome. Once software can act, industries get redesigned around autonomous workflows. This is the same magnitude of shift as websites → apps, or tools → platforms. Pause here. Let it land.",
  },
  {
    id: "fintech",
    title: "Autonomous Finance",
    section: "Autonomous Finance",
    minutes: 4,
    notes: "Map fintech’s evolution: 1.0 digital payments, 2.0 digital banking, 3.0 embedded finance, 4.0 autonomous finance. The product stops showing you what is happening and starts understanding, deciding, and acting. This is where Trackify’s world and the investment thesis meet — without turning the class into a product pitch.",
  },
  {
    id: "definition",
    title: "Financial Agents",
    section: "Autonomous Finance",
    minutes: 6,
    notes: "List the jobs: understand data, monitor cash, catch anomalies, reconcile, budget, invoice, optimize payments, execute approved transactions, report continuously. The interface is not the product. The intelligence is. Ask: who still wants a dashboard if an agent can close the books?",
  },
  {
    id: "stack",
    title: "Where Value Accrues",
    section: "Autonomous Finance",
    minutes: 5,
    notes: "Stack: Intelligence → Agents → Infrastructure (payments, banking, stablecoins, APIs) → Applications → Distribution. Opportunity exists on every layer, but durable value tends to concentrate where execution happens (infrastructure) and where the customer relationship is owned (distribution + workflow). Don’t only fund wrappers on someone else’s model.",
  },
  {
    id: "africa",
    title: "Africa Has Done This Before",
    section: "Africa",
    minutes: 5,
    notes: "The West: branches → cards → digital banking → mobile. Africa: limited banking → mobile money. M-Pesa didn’t wait for the old stack. When infrastructure is thin, leapfrogging is rational. AI is the next leapfrog surface — especially in finance, where complexity is high and incumbents are incomplete.",
  },
  {
    id: "from-africa",
    title: "Build From Africa",
    section: "Africa",
    minutes: 4,
    notes: "Don’t just build AI for Africa. Build AI from Africa for the world. Underserved markets, fragmented rails, mobile-first consumers, complex workflows — these look like constraints. They are actually design advantages. The companies that solve hard, messy, real-world finance here can export the architecture globally.",
  },
  {
    id: "unicorn",
    title: "The Next African Unicorn",
    section: "Africa",
    minutes: 4,
    notes: "It may not be another digital bank, payment app, accounting dashboard, or marketplace. It is more likely an AI-native company that owns an entire workflow: AI + finance + payments + infrastructure. The AI does not recommend the work. It does the work. That is the unicorn shape to underwrite.",
  },
  {
    id: "thesis",
    title: "What We Should Invest In",
    section: "Thesis",
    minutes: 6,
    notes: "Score companies on six vectors: AI leverage, workflow ownership, proprietary data, infrastructure, distribution, capital efficiency. A company that is merely ‘using AI’ is not a thesis. A company that compounds intelligence inside a critical workflow, on rails it can execute, with a path to millions of users — that is a thesis.",
  },
  {
    id: "founder",
    title: "The New Founder",
    section: "Thesis",
    minutes: 4,
    notes: "The next generation may not need huge organizations. They need to be architects of intelligence: design AI-native workflows, build with agents, automate aggressively, own critical data, move faster, stay small, think globally from day one. The founder’s job shifts from managing people to orchestrating intelligence.",
  },
  {
    id: "exercise",
    title: "Build Your Thesis",
    section: "Workshop",
    minutes: 12,
    notes: "Give the room 5 minutes. Pick an industry. Answer the five questions. Then force the decision: would you invest? After timers end, take 2–3 shares. Push on moat and value accrual — those are where most people go fuzzy. This is the teaching, not the slides.",
  },
  {
    id: "scarcity",
    title: "When Intelligence Is Cheap",
    section: "Close",
    minutes: 4,
    notes: "If intelligence becomes abundant, what becomes scarce? Trust, data, distribution, infrastructure, capital, relationships, human judgment. That is where the next generation of value is created. Investors should hunt scarcity, not novelty.",
  },
  {
    id: "closing",
    title: "The Next Unicorn",
    section: "Close",
    minutes: 3,
    notes: "Fewer employees. Less capital. More intelligence. More autonomy. Greater leverage. The opportunity is not to ‘use AI’. It is to rethink how companies are built, how capital is allocated, and how financial systems operate.",
  },
  {
    id: "final",
    title: "Invest in What You Can See Coming",
    section: "Close",
    minutes: 2,
    notes: "Close on the line: don’t invest in the future you already understand. Invest in the future you can see coming. Thank the room. Point to Trackify as the operating system where this thesis is being built — AI, finance, infrastructure, capital — then take questions.",
  },
]

export const ERAS = [
  { era: "Industrial", rewarded: "Manufacturing" },
  { era: "Internet", rewarded: "Information" },
  { era: "Mobile", rewarded: "Connectivity" },
  { era: "Software", rewarded: "Scale" },
  { era: "AI", rewarded: "Intelligence", highlight: true },
] as const

export const OLD_RULES = [
  "Large teams",
  "Rapid hiring",
  "Software scale",
  "Capital intensity",
  "Traditional moats",
  "Predictable orgs",
] as const

export const AI_FUNCTIONS = [
  "Engineering",
  "Research",
  "Support",
  "Marketing",
  "Finance",
  "Operations",
  "Analysis",
] as const

export const DILIGENCE_LENS = [
  { label: "AI leverage", detail: "How much work does intelligence absorb?" },
  { label: "Agent autonomy", detail: "Can it act, or only advise?" },
  { label: "Proprietary data", detail: "Does usage create a data advantage?" },
  { label: "Distribution", detail: "Who owns the customer relationship?" },
  { label: "Infrastructure", detail: "Can it execute on real rails?" },
  { label: "Workflow ownership", detail: "Is it embedded in a critical process?" },
  { label: "Network effects", detail: "Do more users make it smarter?" },
  { label: "Capital efficiency", detail: "Extraordinary output per dollar?" },
] as const

export const MOATS = [
  { title: "Data", body: "Proprietary, high-quality, compounding datasets" },
  { title: "Distribution", body: "Owning the customer relationship" },
  { title: "Workflow", body: "Embedded in processes that cannot easily move" },
  { title: "Infrastructure", body: "Rails others depend on to transact" },
  { title: "Trust", body: "Security, compliance, and reliability" },
  { title: "Network", body: "More users → more intelligence → more value" },
] as const

export const FINTECH_ERAS = [
  { gen: "1.0", name: "Digital Payments", detail: "Move money online" },
  { gen: "2.0", name: "Digital Banking", detail: "Accounts without branches" },
  { gen: "3.0", name: "Embedded Finance", detail: "Banking inside products" },
  { gen: "4.0", name: "Autonomous Finance", detail: "Understand, decide, act", highlight: true },
] as const

export const AGENT_JOBS = [
  "Understand financial data",
  "Monitor cash flow",
  "Identify anomalies",
  "Reconcile transactions",
  "Manage budgets",
  "Generate invoices",
  "Optimize payments",
  "Execute approved transactions",
  "Report continuously",
] as const

export const VALUE_STACK = [
  { n: "01", title: "Intelligence", body: "Models & reasoning" },
  { n: "02", title: "Agents", body: "Financial AI employees" },
  { n: "03", title: "Infrastructure", body: "Payments, banking, stablecoins, APIs" },
  { n: "04", title: "Applications", body: "Accounting, treasury, investing" },
  { n: "05", title: "Distribution", body: "Businesses, consumers, platforms" },
] as const

export const AFRICA_ADVANTAGES = [
  "Massive underserved markets",
  "Fragmented financial rails",
  "Mobile-first consumers",
  "Growing digital adoption",
  "Complex real-world workflows",
  "Room to invent new infrastructure",
] as const

export const NOT_THE_UNICORN = [
  "Another digital bank",
  "Another payment app",
  "Another accounting dashboard",
  "Another marketplace",
] as const

export const THESIS_VECTORS = [
  { title: "AI Leverage", body: "Can intelligence replace significant operational work?" },
  { title: "Workflow Ownership", body: "Does the product control an important process?" },
  { title: "Proprietary Data", body: "Does usage create a valuable data advantage?" },
  { title: "Infrastructure", body: "Does it connect to the rails required to execute?" },
  { title: "Distribution", body: "Can it reach millions of users or businesses?" },
  { title: "Capital Efficiency", body: "Extraordinary output with relatively little capital?" },
] as const

export const FOUNDER_SHIFTS = [
  "Design AI-native workflows",
  "Build with agents",
  "Automate aggressively",
  "Own critical data",
  "Move faster with smaller teams",
  "Think globally from day one",
] as const

export const SCARCITY = [
  "Trust",
  "Data",
  "Distribution",
  "Infrastructure",
  "Capital",
  "Relationships",
  "Human judgment",
] as const

export const EXERCISE_INDUSTRIES = [
  "Finance",
  "Healthcare",
  "Logistics",
  "Agriculture",
  "Education",
  "Legal",
  "Government",
] as const

export const EXERCISE_QUESTIONS = [
  { key: "workflow", label: "What workflow is currently dominated by humans?" },
  { key: "ai", label: "What part of it can AI perform?" },
  { key: "infra", label: "What infrastructure is required?" },
  { key: "moat", label: "What becomes the moat?" },
  { key: "value", label: "Where does the economic value accrue?" },
] as const

export type ExerciseKey = (typeof EXERCISE_QUESTIONS)[number]["key"]
