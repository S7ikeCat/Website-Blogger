import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { requireAdmin } from "@/shared/lib/requireAdmin"

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json().catch(() => null)) as null | { userId?: number }
  if (!body?.userId) return NextResponse.json({ error: "Bad userId" }, { status: 400 })

  // нельзя разбанить себя — это не критично, но логично как защита
  if (body.userId === admin.id) {
    return NextResponse.json({ error: "You cannot unban yourself" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, role: true, isBanned: true },
  })

  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // можно убрать, если хочешь разрешить админам разбанивать админов (но обычно не надо)
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "You cannot unban another admin" }, { status: 403 })
  }

  if (!target.isBanned) {
    return NextResponse.json({ error: "User is not banned" }, { status: 409 })
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { isBanned: false, banReason: null, bannedAt: null },
  })

  await prisma.moderationAction.create({
    data: { adminId: admin.id, userId: target.id, type: "UNBAN", reason: null },
  })

  await prisma.notification.create({
    data: {
      userId: target.id,
      type: "UNBAN",
      text: "You were unbanned by admin",
      href: "/",
    },
  })

  return NextResponse.json({ ok: true })
}