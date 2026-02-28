import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/shared/lib/prisma"
import { signToken } from "@/shared/lib/auth"

type LoginBody = {
  email: string
  password: string
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<LoginBody>

  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isBanned: true }, // ✅ добавили
  })

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  // ✅ СНАЧАЛА бан-проверка, потом токен
  if (user.isBanned) {
    const bannedRes = NextResponse.json({ error: "BANNED" }, { status: 403 })
    bannedRes.cookies.set("banned", "1", { httpOnly: true, path: "/" })
    return bannedRes
  }

  const token = signToken({ userId: user.id })

  const res = NextResponse.json({ ok: true })
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  // ✅ если норм — явно сбрасываем banned
  res.cookies.set("banned", "0", { httpOnly: true, path: "/" })

  return res
}