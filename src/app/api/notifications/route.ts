import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, text: true, href: true, createdAt: true, readAt: true },
    }),
    prisma.notification.count({
      where: { userId: user.id, readAt: null },
    }),
  ])

  return NextResponse.json({ items, unreadCount })
}