import { prisma } from "@/shared/lib/prisma"
import { verifyToken } from "@/shared/lib/auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { signToken } from "@/shared/lib/auth"

type PublicUser = {
    id: number
    username: string
    email: string
    avatarUrl: string | null
    role: "USER" | "ADMIN"
}

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
  if (!token) return NextResponse.json({ user: null })
    
  try {
    const {userId} = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    })

    if(!user) {
        const res = NextResponse.json({user: null})
        res.cookies.set("token", "", {path: "/", maxAge: 0})
        return res
    }

    // ✅ Sliding session: продливаем токен на 7 дней от последнего визита
    const newToken = signToken({userId: user.id})

    const res = NextResponse.json({user: user as PublicUser})
    res.cookies.set("token", newToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })

    return res
  } catch {
    const res = NextResponse.json({user: null})
    res.cookies.set("token", "", {path: "/", maxAge: 0})
    return res
  }
}

