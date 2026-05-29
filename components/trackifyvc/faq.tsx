"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"

const FAQS = [
  {
    question: "Who is Trackify for?",
    answer:
      "Trackify is built for venture investors and founders across Africa—track deal flow, manage portfolios, run diligence, and keep fundraising organized.",
  },
  {
    question: "Do founders and investors share the same workspace?",
    answer:
      "They use the same product, but workspaces are role-aware. Founders use `/founder/workspace` and investors use `/workspace`, so each view stays separate and tailored.",
  },
  {
    question: "Can I invite teammates and collaborate on memos?",
    answer:
      "Yes. Workspaces are designed for collaboration: shared docs, comments, blocks, and structured pages for diligence and reporting.",
  },
  {
    question: "How is my data protected?",
    answer:
      "We prioritize security by default—secure sessions, access controls, and privacy-first handling of company and investor data.",
  },
  {
    question: "What happens after I sign in?",
    answer:
      "You’ll be redirected to your dashboard. If onboarding isn’t completed yet, Trackify routes you to onboarding first, then to the correct dashboard based on your role.",
  },
]

export function TrackifyVcFaq() {
  return (
    <div className="flex flex-col items-center justify-center relative w-full py-16 lg:py-24 overflow-hidden">
      <div className="absolute top-0 -right-1/3 -z-10 ml-auto w-4/5 h-32 lg:h-48 rounded-full blur-[5rem] bg-[radial-gradient(86.02%_172.05%_at_50%_-40%,rgba(18,139,135,0.7)_0%,rgba(5,5,5,0)_80%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_70%_at_90%_0%,#000_20%,transparent_70%)] h-full -z-10" />

      <section className="h-full mx-auto w-full lg:max-w-screen-xl px-4 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="flex flex-col">
            <div className="flex flex-col items-start justify-start lg:items-center lg:justify-center lg:items-start lg:justify-start">
              <h2 className="text-3xl lg:text-4xl font-semibold text-left lg:text-start tracking-tight">
                Frequently asked questions
              </h2>
              <p className="text-base lg:text-lg font-normal text-neutral-400 text-left lg:text-start mt-2 max-w-md">
                For any other questions, feel welcome to reach out to our team
              </p>
            </div>
            <div className="mt-10">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-base font-base font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-neutral-400">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="col-span-1 w-full z-10">
            <div className="flex w-full">
              <Image
                src="/images/faq.svg"
                alt="Box"
                width={1024}
                height={1024}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

