import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"

type Body = {username: string}

export async function POST(req: Request) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})

        const body = (await req.json()) as Partial<Body>
        const username = body.username?.trim()
        if(!username) return NextResponse.json({error: "username required"}, {status: 400})

        const target = await prisma.user.findUnique({
            where: {username},
            select: {id: true},
        })
        if (!target) return NextResponse.json({error: "User not found"}, {status: 404})
            if (target.id === user.id) return NextResponse.json({error: "Cannot follow yourself"}, {status: 400})
            
            await prisma.follow.upsert({
                where: {followerId_followingId: {followerId: user.id, followingId: target.id}},
                update: {},
                create: {followerId: user.id, followingId: target.id}
            })

            return NextResponse.json({ok: true})

}

export async function DELETE(req: Request) {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})

        const {searchParams} = new URL(req.url)
        const username = searchParams.get("username")?.trim()
        if(!username) return NextResponse.json({error: "username required"}, { status: 400 })

        const target = await prisma.user.findUnique({
            where: {username},
            select: {id: true}
        })
        if(!target) return NextResponse.json({error: "User not found"}, {status: 404})

        await prisma.follow.deleteMany({
            where: {followerId: user.id, followingId: target.id},
        })

        return NextResponse.json({ok: true})
}