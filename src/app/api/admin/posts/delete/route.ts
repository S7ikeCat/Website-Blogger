import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { requireAdmin } from "@/shared/lib/requireAdmin"
import { UTApi } from "uploadthing/server"
import { withUploadThingToken } from "@/shared/lib/utMutex"

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = (await req.json().catch(() => null)) as
    | null
    | { postId?: number; reason?: string }

  if (!body?.postId) return NextResponse.json({ error: "Bad postId" }, { status: 400 })

  const reason = (body.reason ?? "").trim()

  const post = await prisma.post.findUnique({
    where: { post_id: body.postId },
    select: {
      post_id: true,
      title: true,
      authorId: true,
      imgPostKey: true,
      author: { select: { username: true } },
    },
  })

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  // защита: (по желанию) запрещаем админу модерировать свои посты
  // если хочешь разрешить — просто удали этот блок
  if (post.authorId === admin.id) {
    return NextResponse.json(
      { error: "You cannot moderate your own post" },
      { status: 400 }
    )
  }

  const keyToDelete = post.imgPostKey ?? null

  await prisma.post.delete({ where: { post_id: post.post_id } })

  await prisma.moderationAction.create({
    data: {
      adminId: admin.id,
      userId: post.authorId,
      type: "DELETE_POST",
      reason: reason || null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: post.authorId,
      type: "DELETE_POST",
      text: reason
        ? `Your post "${post.title}" was deleted: ${reason}`
        : `Your post "${post.title}" was deleted by admin`,
      href: "/",
    },
  })

  // удаление картинки из UploadThing (если ключ есть)
  if (keyToDelete) {
    const tokenPost = process.env.UPLOADTHING_TOKEN_POST?.trim()
    if (!tokenPost) {
      console.warn("UPLOADTHING_TOKEN_POST is missing; skip post image deletion")
    } else {
      try {
        await withUploadThingToken(tokenPost, async () => {
          const utapi = new UTApi()
          await utapi.deleteFiles(keyToDelete)
        })
      } catch (e) {
        console.error("Failed to delete post image from UploadThing:", e)
      }
    }
  }

  return NextResponse.json({ ok: true })
}