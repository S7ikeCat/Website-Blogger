import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { prisma } from "@/shared/lib/prisma"
import { NextResponse } from "next/server"
import { UTApi } from "uploadthing/server"
import { withUploadThingToken } from "@/shared/lib/utMutex"

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { postId } = await ctx.params 

  const id = Number(postId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: `Bad postId: "${postId}"` }, { status: 400 })
  }

  const post = await prisma.post.findUnique({
    where: { post_id: id },
    select: { authorId: true, imgPostKey: true },
  })

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canDelete = post.authorId === user.id || user.role === "ADMIN"
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const keyToDelete = post.imgPostKey ?? null

  await prisma.post.delete({ where: { post_id: id } })

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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { postId } = await ctx.params
  const id = Number(postId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: `Bad postId: "${postId}"` }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const nextTitle = typeof body.title === "string" ? body.title.trim() : undefined
  const nextDescription =
    typeof body.description === "string" ? body.description.trim() : undefined
    const nextCategoryId =
    body.category_id === null
      ? null
      : typeof body.category_id === "number"
      ? body.category_id
      : undefined

  const nextImgPost =
    body.img_post === null
      ? null
      : typeof body.img_post === "string"
      ? body.img_post.trim()
      : undefined

  const nextImgPostKey =
    body.imgPostKey === null
      ? null
      : typeof body.imgPostKey === "string"
      ? body.imgPostKey.trim()
      : undefined

  // Загружаем текущий пост: нужен authorId для прав + старый key для удаления
  const current = await prisma.post.findUnique({
    where: { post_id: id },
    select: { authorId: true, imgPostKey: true },
  })
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canEdit = current.authorId === user.id || user.role === "ADMIN"
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Собираем data для Prisma без any
  const data: Parameters<typeof prisma.post.update>[0]["data"] = {}

  if (nextTitle !== undefined) data.title = nextTitle
  if (nextDescription !== undefined) data.description = nextDescription
  if (nextCategoryId !== undefined) data.category_id = nextCategoryId
  if (nextImgPost !== undefined) data.img_post = nextImgPost
  if (nextImgPostKey !== undefined) data.imgPostKey = nextImgPostKey

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const updated = await prisma.post.update({
    where: { post_id: id },
    data,
    select: { post_id: true },
  })

  // ✅ удаляем старую картинку, если ключ поменялся или картинку убрали
  const oldKey = current.imgPostKey
  const newKey = nextImgPostKey !== undefined ? nextImgPostKey : oldKey

  const shouldDeleteOld =
    oldKey && oldKey.length > 0 && (newKey === null || newKey === "" || newKey !== oldKey)

  if (shouldDeleteOld) {
    const tokenPost = process.env.UPLOADTHING_TOKEN_POST?.trim()
    if (tokenPost) {
      try {
        await withUploadThingToken(tokenPost, async () => {
          const utapi = new UTApi()
          await utapi.deleteFiles(oldKey)
        })
      } catch (e) {
        console.error("Failed to delete old post image:", e)
      }
    } else {
      console.warn("UPLOADTHING_TOKEN_POST missing; skip old image deletion")
    }
  }

  return NextResponse.json({ ok: true, post: updated })
}