import { redirect } from "next/navigation"
import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"

export const dynamic = "force-dynamic"

export default async function Page() {
  const viewer = await getCurrentUser()
  if (!viewer) redirect("/login")

  // Вариант А (самый простой и понятный):
  // достаём id тех, на кого подписан viewer
  const following = await prisma.follow.findMany({
    where: { followerId: viewer.id },
    select: { followingId: true },
  })

  const ids = following.map((x) => x.followingId)

  // Если ни на кого не подписан — просто возвращаем пусто (или текст)
  if (ids.length === 0) {
    return <div>No posts yet</div>
  }

  // Берём посты этих авторов
  const posts = await prisma.post.findMany({
    where: { authorId: { in: ids } },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      author: { select: { username: true, avatarUrl: true } },
    },
  })

  // Тут можешь отрендерить как хочешь (либо переиспользовать твой Home компонент)
  return (
    <div>
      <h1>Following feed</h1>

      {posts.map((p) => (
        <div key={p.post_id}>
          <div>{p.title}</div>
          <div>@{p.author.username}</div>
        </div>
      ))}
    </div>
  )
}