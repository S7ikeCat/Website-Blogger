import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { notFound, redirect } from "next/navigation"
import EditPostForm from "@/widgets/edit-post/ui/EditPostForm"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
}: {
  params: Promise<{ post_id: string }>
}) {
  const viewer = await getCurrentUser()
  if (!viewer) redirect("/login")

  const { post_id } = await params
  const id = Number(post_id)
  if (!Number.isFinite(id)) notFound()

  // Забираем пост + автора (для проверки прав) + текущие данные картинки
  const post = await prisma.post.findUnique({
    where: { post_id: id },
    select: {
      post_id: true,
      title: true,
      description: true,
      category_id: true,
      img_post: true,
      imgPostKey: true,
      authorId: true,
    },
  })
  if (!post) notFound()

  // Право редактировать: владелец или админ
  const canEdit = post.authorId === viewer.id || viewer.role === "ADMIN"
  if (!canEdit) redirect(`/posts/${post.post_id}`)

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <EditPostForm
      initial={{
        postId: post.post_id,
        title: post.title,
        description: post.description,
        categoryId: post.category_id,
        imgPost: post.img_post ?? "",
        imgPostKey: post.imgPostKey ?? "",
      }}
      categories={categories}
    />
  )
}