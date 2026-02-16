import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import { prisma } from "@/shared/lib/prisma";
import { NextResponse } from "next/server";


export async function DELETE(
    _req: Request,
    {params}: {params: {postId: string}}
) {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})

    const postId = Number(params.postId)
    if(!Number.isFinite(postId)) {
        return NextResponse.json({error: "Bad postId"}, {status: 400})
    }

    const post = await prisma.post.findUnique({
        where: {post_id: postId},
        select: {authorId: true}
    })

    if(!post) return NextResponse.json({error: "Not found"}, {status: 404})

    const canDelete = post.authorId === user.id || user.role === "ADMIN"
    if (!canDelete) return NextResponse.json({error: "Forbidden"}, {status: 403})

    await prisma.post.delete({where: {post_id: postId}})

    return NextResponse.json({ok: true})
}