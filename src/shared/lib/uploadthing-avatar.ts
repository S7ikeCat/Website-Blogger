import { generateUploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

export const UploadButtonAvatar = generateUploadButton<OurFileRouter>({
  url: "/api/uploadthing-avatar",
})