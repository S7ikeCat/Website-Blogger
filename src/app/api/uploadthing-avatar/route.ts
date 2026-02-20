import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "../uploadthing/core"
import { withUploadThingToken } from "@/shared/lib/utMutex"
import type { NextRequest } from "next/server"

const handler = createRouteHandler({ router: ourFileRouter })

const rawToken = process.env.UPLOADTHING_TOKEN_AVATAR
if (!rawToken) {
  throw new Error("UPLOADTHING_TOKEN_AVATAR is missing or empty")
}

const tokenAvatar = rawToken.trim()

export async function GET(req: NextRequest) {
  return withUploadThingToken(tokenAvatar, () => handler.GET(req))
}

export async function POST(req: NextRequest) {
  return withUploadThingToken(tokenAvatar, () => handler.POST(req))
}