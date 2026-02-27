import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.notification.deleteMany({
    where: { userId: user.id },
  })

  return NextResponse.json({ ok: true })
}