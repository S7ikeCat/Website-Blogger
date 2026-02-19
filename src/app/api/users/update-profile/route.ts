import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server"


export async function PATCH(req: Request) {
    const viewer = await getCurrentUser()
    const utapi = new UTApi()
    if(!viewer) return NextResponse.json({error: "Unauthorized"}, {status: 401})

    const body = await req.json().catch(() => null)
    if(!body) return NextResponse.json({error: "Invalid JSON"}, {status: 400})

    const nextUsername = typeof body.username === "string" ? body.username.trim() : undefined
    const nextEmail = typeof body.email === "string" ? body.email.trim() : undefined
    const nextAvatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : undefined
    const nextAvatarKey = typeof body.avatarKey === "string" ? body.avatarKey.trim() : undefined


    if (nextUsername !== undefined && nextUsername.length < 3) {
        return NextResponse.json({error: "Username too short"}, {status: 400})
    }

    if(nextEmail !== undefined && !nextEmail.includes("@")) {
        return NextResponse.json({error: "Invalid email"}, {status: 400})
    }
    if (nextUsername && nextUsername !== viewer.username) {
        const exists = await prisma.user.findUnique({ where: { username: nextUsername }, select: { id: true } })
        if (exists) return NextResponse.json({ error: "Username already taken" }, { status: 409 })
      }

    if (nextEmail && nextEmail !== viewer.email) {
        const exists = await prisma.user.findUnique({where: {email: nextEmail}, select: {id: true}})
        if (exists) return NextResponse.json({ error: "Email already taken" }, { status: 409 })
    }

    const data: Parameters<typeof prisma.user.update>[0]["data"] = {}

    if(nextUsername !== undefined) data.username = nextUsername
    if(nextEmail !== undefined) data.email = nextEmail
    if (nextAvatarUrl !== undefined) data.avatarUrl = nextAvatarUrl || null
    if (nextAvatarKey !== undefined) data.avatarKey = nextAvatarKey || null

    if (Object.keys(data).length === 0) {
        return NextResponse.json(
          { error: "Nothing to update" },
          { status: 400 }
        )
      }

      const current = await prisma.user.findUnique({
        where: { id: viewer.id },
        select: { avatarKey: true },
      })
      
      const oldKey = current?.avatarKey ?? null
    

    const updated = await prisma.user.update({
        where: {id: viewer.id},
        data,
        select: {id: true, username: true, email:true, avatarUrl:true, avatarKey: true, role:true}
    })

    const newKey = updated.avatarKey ?? null
    const shouldDeleteOld = oldKey && oldKey !== newKey

    if (shouldDeleteOld) {
        try {
          await utapi.deleteFiles(oldKey)
        } catch (e) {
          console.error("Failed to delete old avatar from UploadThing:", e)
        }
      }

    return NextResponse.json({user: updated})
}   
