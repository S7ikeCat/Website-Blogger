import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/shared/lib/prisma"
import { signToken } from "@/shared/lib/auth"

type RegisterBody = {
    username: string
    email: string
    password: string
}

export async function POST(req: Request) {
    const body = (await req.json()) as Partial<RegisterBody>

    const username = body.username?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if(!username || !email || !password) {
        return NextResponse.json({error: "Missing fields"}, {status: 400})
    }

    if(password.length < 6) {
        return NextResponse.json({error: "Password must be at least 6 chars"}, {status: 400})
    
    }

    const existing = await prisma.user.findFirst({
        where: {OR: [{email}, {username}]},
        select: {id: true}
    })

    if(existing) {
        return NextResponse.json({error: "User already exists"}, {status: 409})
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash  
        },
        select: {id: true}
    })

    const token = signToken({userId: user.id})

    const res = NextResponse.json({ok: true})
    res.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        })

        return res
}