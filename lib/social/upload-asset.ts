import { UTApi } from "uploadthing/server"

export async function uploadSocialAsset(
  buffer: Buffer,
  ownerId: string
): Promise<string> {
  const file = new File([new Uint8Array(buffer)], `social-${ownerId.slice(0, 8)}-${Date.now()}.png`, {
    type: "image/png",
  })

  const utapi = new UTApi()
  const results = await utapi.uploadFiles(file)

  const result = Array.isArray(results) ? results[0] : results
  if (!result || result.error) {
    throw new Error(result?.error?.message ?? "Failed to upload social asset")
  }

  return result.data.url
}
