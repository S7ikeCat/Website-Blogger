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
    select: { id: true, passwordHash: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
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

  return res
}