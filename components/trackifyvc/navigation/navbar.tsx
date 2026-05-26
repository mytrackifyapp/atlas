"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { LucideIcon, ZapIcon, Brain } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/utils/functions/cn"
import { NAV_LINKS } from "@/constants/nav-links"
import MaxWidthWrapper from "@/components/trackifyvc/global/max-width-wrapper"
import AnimationContainer from "@/components/trackifyvc/global/animation-container"
import MobileNavbar from "@/components/trackifyvc/navigation/mobile-navbar"
import { useSession } from "@/lib/auth-client"

export default function TrackifyVcNavbar() {
  const [scroll, setScroll] = useState(false)
  const session = useSession()
  const isLoggedIn = !!session?.data?.user

  useEffect(() => {
    function handleScroll() {
      setScroll(window.scrollY > 8)
    }
    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 h-14 w-full z-[99999] select-none border-b border-black/10 bg-white/80 backdrop-blur-md",
        scroll && "bg-white/95",
      )}
    >
      <AnimationContainer reverse delay={0.1} className="size-full">
        <MaxWidthWrapper className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link href="/#home" className="flex items-center gap-6">
              <span className="text-xl md:text-1xl font-bold font-heading tracking-tight text-neutral-950">
                Trackify Finance
              </span>
            </Link>

            <NavigationMenu className="hidden lg:flex" viewport={false}>
              <NavigationMenuList>
                {NAV_LINKS.map((link) => (
                  <NavigationMenuItem key={link.title}>
                    {"menu" in link && link.menu ? (
                      <>
                        <NavigationMenuTrigger className="bg-transparent text-neutral-800 hover:bg-black/5 hover:text-neutral-950 focus:bg-black/5 focus:text-neutral-950 data-[state=open]:bg-black/5">
                          <span className="inline-flex items-center gap-2">
                            {"icon" in link && link.icon ? (
                              <link.icon className="h-4 w-4 text-neutral-700" />
                            ) : null}
                            {link.title}
                          </span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="!bg-white !text-neutral-950 border border-black/10 backdrop-blur-md">
                          <ul
                            className={cn(
                              "grid gap-1 p-4 md:w-[400px] lg:w-[500px] rounded-xl bg-white",
                              String(link.title) === "Features"
                                ? "lg:grid-cols-[.75fr_1fr]"
                                : "lg:grid-cols-2",
                            )}
                          >
                            {String(link.title) === "Features" && (
                              <li className="row-span-4 pr-2 relative rounded-lg overflow-hidden">
                                <div className="absolute inset-0 !z-10 h-full w-[calc(100%-10px)] bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[size:1rem_1rem]"></div>
                                <NavigationMenuLink asChild className="z-20 relative">
                                  <Link
                                    href="/"
                                    className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md"
                                  >
                                    <h6 className="mb-2 mt-4 text-lg font-medium">
                                      All Features
                                    </h6>
                                    <p className="text-sm leading-tight text-muted-foreground">
                                      Manage links, track performance, and more.
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            )}
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
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href}
                          className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-black/5 hover:text-neutral-950 focus:bg-black/5 focus:text-neutral-950 outline-none"
                        >
                          {"icon" in link && link.icon ? (
                            <span className="inline-flex items-center gap-2">
                              <link.icon className="h-4 w-4 text-neutral-700" />
                              {link.title}
                            </span>
                          ) : (
                            link.title
                          )}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {!isLoggedIn && (
            <div className="hidden lg:flex items-center shrink-0">
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "sm",
                  className: "rounded-full",
                })}
              >
                Get Started
                <ZapIcon className="size-3.5 ml-1.5 text-orange-500 fill-orange-500" />
              </Link>
            </div>
          )}

          <MobileNavbar isLoggedIn={isLoggedIn} />
        </MaxWidthWrapper>
      </AnimationContainer>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon: LucideIcon }
>(({ className, title, href, icon: Icon, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-100 ease-out hover:bg-black/5 hover:text-neutral-950 focus:bg-black/5 focus:text-neutral-950",
            className,
          )}
          {...props}
        >
          <div className="flex items-center space-x-2 text-neutral-900">
            <Icon className="h-4 w-4 text-neutral-700" />
            <h6 className="text-sm font-medium !leading-none">{title}</h6>
          </div>
          <p
            title={children! as string}
            className="line-clamp-1 text-sm leading-snug text-neutral-600"
          >
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

