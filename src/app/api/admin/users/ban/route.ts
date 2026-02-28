import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { requireAdmin } from "@/shared/lib/requireAdmin"

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json().catch(() => null)) as
    | null
    | { userId?: number; reason?: string }

  if (!body?.userId) {
    return NextResponse.json({ error: "Bad userId" }, { status: 400 })
  }

  // 1) защита: нельзя банить себя
  if (body.userId === admin.id) {
    return NextResponse.json(
      { error: "You cannot ban yourself" },
      { status: 400 }
    )
  }

  // 2) достаём цель и проверяем роль
  const target = await prisma.user.findUnique({
    where: { id: body.userId },
    select: { id: true, role: true },
  })

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // 3) защита: нельзя банить админа
  if (target.role === "ADMIN") {
    return NextResponse.json(
      { error: "You cannot ban another admin" },
      { status: 403 }
    )
  }

  const reason = (body.reason ?? "").trim()

  // 4) делаем бан
  await prisma.user.update({
    where: { id: target.id },
    data: {
      isBanned: true,
      banReason: reason || null,
      bannedAt: new Date(),
    },
  })

  // 5) пишем модерацию
  await prisma.moderationAction.create({
    data: {
      adminId: admin.id,
      userId: target.id,
      type: "BAN",
      reason: reason || null,
    },
  })

  // 6) уведомление
  await prisma.notification.create({
    data: {
      userId: target.id,
      type: "BAN",
      text: reason ? `You were banned: ${reason}` : "You were banned by admin",
      href: "/",
    },
  })
  

  return NextResponse.json({ ok: true })
}