import {
  LINKEDIN_ART,
  type LinkedInStudioPost,
} from "@/lib/content/linkedin-posts"

export function LinkedInPostArt({ post }: { post: LinkedInStudioPost }) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden bg-white"
      style={{ containerType: "inline-size" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {post.audience === "personal" ? (
          <div className="mb-[3.7cqw] size-[13.5cqw] overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LINKEDIN_ART.profileSrc}
              alt=""
              className="h-full w-full scale-[1.7] object-cover object-[center_12%]"
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={LINKEDIN_ART.logoSrc}
            alt=""
            className="mb-[3.7cqw] w-[38.9cqw] object-contain"
          />
        )}

        <p className="max-w-[78%] text-center font-semibold leading-[1.14] tracking-tight text-[5.93cqw] text-balance">
          {post.lines.map((line) => (
            <span
              key={line.text}
              className="block"
              style={{
                color: line.tone === "muted" ? LINKEDIN_ART.muted : LINKEDIN_ART.ink,
              }}
            >
              {line.text}
            </span>
          ))}
        </p>

        <p
          className="mt-[2.96cqw] text-center font-medium tracking-tight text-[2.04cqw]"
          style={{ color: LINKEDIN_ART.ink }}
        >
          {post.label}
        </p>
      </div>
    </div>
  )
}
