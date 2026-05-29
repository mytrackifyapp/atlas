"use client"

import Image from "next/image"

import Wrapper from "@/components/trackifyvc/global/wrapper"
import Container from "@/components/trackifyvc/global/container"
import { TRACKIFYVC_BLOGS } from "@/lib/trackifyvc-constants"

export default function TrackifyVcOriginalBlogs() {
  return (
    <div className="flex flex-col items-center justify-center relative w-full pb-16 lg:pb-24">
      <Wrapper>
        <Container>
          <div className="flex flex-col items-start justify-start lg:items-center lg:justify-center">
            <h2 className="text-3xl lg:text-4xl font-semibold text-left lg:text-center tracking-tight">
              Blog & Articles
            </h2>
            <p className="text-base lg:text-lg font-normal text-muted-foreground text-left lg:text-center mt-2 max-w-md">
              Explore our latest articles and insights on various topics related to our industry and expertise
            </p>
          </div>
        </Container>

        <div className="w-full mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRACKIFYVC_BLOGS.slice(0, 3).map((item, index) => (
              <Container key={index}>
                <div className="flex flex-col w-full">
                  <div className="relative w-full bg-foreground/5 border border-border/20 rounded-lg lg:rounded-xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={1024}
                      height={1024}
                      className="object-contain size-full rounded-lg lg:rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col mt-4">
                    <span className="inline-block px-3 py-1 rounded-sm bg-neutral-800/80 text-xs text-foreground/80 w-max">
                      {item.category}
                    </span>
                    <h3 className="text-lg lg:text-xl font-semibold mt-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              </Container>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

