"use client"

import Image from "next/image"

import Container from "@/components/trackifyvc/global/container"
import Wrapper from "@/components/trackifyvc/global/wrapper"
import { TRACKIFYVC_BLOGS } from "@/lib/trackifyvc-constants"

export default function BlogSection() {
  return (
    <div className="w-full pb-16 lg:pb-24">
      <Wrapper>
        <Container>
          <div className="flex flex-col">
            <h2 className="text-2xl lg:text-3xl font-semibold">Latest Post:</h2>
          </div>
        </Container>

        <div className="w-full mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {TRACKIFYVC_BLOGS.map((blog, index) => (
              <Container key={index}>
                <article className="flex flex-col w-full">
                  <div className="relative w-full bg-foreground/5 border border-border/20 rounded-lg lg:rounded-xl overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      width={1024}
                      height={1024}
                      className="object-contain size-full rounded-lg lg:rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col mt-4">
                    <span className="inline-block px-3 py-1 rounded-sm bg-neutral-800/80 text-xs text-foreground/80 w-max">
                      {blog.category}
                    </span>
                    <h3 className="text-lg lg:text-xl font-semibold mt-2">
                      {blog.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{blog.desc}</p>
                  </div>
                </article>
              </Container>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

