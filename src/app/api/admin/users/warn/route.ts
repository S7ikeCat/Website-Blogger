import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { requireAdmin } from "@/shared/lib/requireAdmin"

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as
    | null
    | { userId?: number; reason?: string }

  if (!body?.userId) {
    return NextResponse.json({ error: "Bad userId" }, { status: 400 })
  }

  // 🔎 Находим target пользователя
  const target = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, role: true },
  })

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // 🚫 ЗАЩИТА ОТ ДЕБИЛА
  if (target.id === admin.id) {
    return NextResponse.json(
      { error: "You cannot warn yourself" },
      { status: 400 }
    )
  }

  if (target.role === "ADMIN") {
    return NextResponse.json(
      { error: "You cannot warn another admin" },
      { status: 403 }
    )
  }

  const reason = (body.reason ?? "").trim()

  await prisma.moderationAction.create({
    data: {
      adminId: admin.id,
      userId: target.id,
      type: "WARN",
      reason: reason || null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: target.id,
      type: "WARN",
      text: reason ? `Warning: ${reason}` : "Warning from admin",
      href: `/u/${admin.username}`,
    },
  })

  return NextResponse.json({ ok: true })
}