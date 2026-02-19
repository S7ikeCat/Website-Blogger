import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"


export async function POST(req: Request) {
    const viewer = await getCurrentUser()
    if(!viewer) return NextResponse.json({error: "Unauthorized"}, {status: 401})

    const body = await req.json().catch(() => null)
    if(!body) {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400})
    }

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword: ""
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""

    if(!currentPassword || !newPassword) {
      return NextResponse.json({error: "Fill all fields"}, {status: 400})
    }
    if(newPassword.length < 6) {
        return NextResponse.json({error: "Password too short (min 6)" }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
        where: {id: viewer.id},
        select: {passwordHash: true}
    })
    if(!dbUser) return NextResponse.json({error: "User not found"}, {status: 400})

    const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash)
    if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
    
    const nextHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: {id: viewer.id},
        data: {passwordHash: nextHash}
    })
    return NextResponse.json({ok: true})
}

