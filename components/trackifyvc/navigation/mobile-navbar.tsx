"use client"

import React, { useState } from "react"
import Link from "next/link"
import { LucideIcon, Menu, X } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/utils/functions/cn"
import { NAV_LINKS } from "@/constants/nav-links"

export default function MobileNavbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleClose() {
    setIsOpen(false)
  }

  return (
    <div className="flex lg:hidden items-center justify-end">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="text-neutral-900 hover:text-black hover:bg-black/5">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-screen bg-black text-white border-l border-white/10">
          <SheetClose
            asChild
            className="absolute top-3 right-5 z-20 flex items-center justify-center"
          >
            <Button size="icon" variant="ghost" className="text-neutral-200 hover:text-white hover:bg-white/5">
              <X className="w-5 h-5" />
            </Button>
          </SheetClose>
          <div className="flex flex-col items-start w-full py-2 mt-10 px-2">
            {!isLoggedIn && (
              <div className="w-full px-2">
                <Link
                  href="/sign-up"
                  className={buttonVariants({ className: "w-full rounded-full" })}
                >
                  Get Started
                </Link>
              </div>
            )}
            <ul className="flex flex-col items-start w-full mt-6 px-2">
              <Accordion type="single" collapsible className="!w-full">
                {NAV_LINKS.map((link) => (
                  <AccordionItem
                    key={link.title}
                    value={link.title}
                    className="last:border-none border-white/10"
                  >
                    {"menu" in link && link.menu ? (
                      <>
                        <AccordionTrigger className="text-neutral-100 hover:no-underline">
                          <span className="inline-flex items-center gap-2">
                            {"icon" in link && link.icon ? (
                              <link.icon className="h-4 w-4 text-neutral-300" />
                            ) : null}
                            {link.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul onClick={handleClose} className={cn("w-full")}>
                            {link.menu.map((menuItem) => (
                              <ListItem
                                key={menuItem.title}
                                title={menuItem.title}
                                href={menuItem.href}
                                icon={menuItem.icon}
                              >
                                {menuItem.tagline}
                              </ListItem>
                            ))}
                          </ul>
                        </AccordionContent>
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={handleClose}
                        className="flex items-center justify-between w-full py-4 px-2 rounded-lg font-medium text-neutral-200 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span className="inline-flex items-center gap-2">
                          {"icon" in link && link.icon ? (
                            <link.icon className="h-4 w-4 text-neutral-300" />
                          ) : null}
                          {link.title}
                        </span>
                      </Link>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon: LucideIcon }
>(({ className, title, href, icon: Icon, children, ...props }, ref) => {
  return (
    <li>
      <Link
        href={href!}
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white",
          className,
        )}
        {...props}
      >
        <div className="flex items-center space-x-2 text-neutral-100">
          <Icon className="h-4 w-4 text-neutral-300" />
          <h6 className="text-sm !leading-none">{title}</h6>
        </div>
        <p
          title={children! as string}
          className="line-clamp-1 text-sm leading-snug text-neutral-400"
        >
          {children}
        </p>
      </Link>
    </li>
  )
})
ListItem.displayName = "ListItem"

