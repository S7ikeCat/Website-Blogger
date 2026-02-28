import { Home } from "@/widgets/home"
import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"

export const dynamic = "force-dynamic"

export default async function Mainpage(props: {
  searchParams: Promise<{ category?: string }>
}) {
  const searchParams = await props.searchParams
  const activeCategory = searchParams.category ?? "all"

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  let posts

  if (activeCategory === "following") {
    const viewer = await getCurrentUser()

    if (!viewer) {
      posts = await prisma.post.findMany({
        where: { authorId: { in: [] } },
        include: { category: true, author: { select: { username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      })
    } else {
      const following = await prisma.follow.findMany({
        where: { followerId: viewer.id },
        select: { followingId: true },
      })

      const ids = following.map((f) => f.followingId)

      posts = await prisma.post.findMany({
        where: {
          authorId: { in: ids },          // показываем только тех, на кого подписан
          author: { isBanned: false },    // ✅ скрываем посты забаненных
        },
        include: { category: true, author: { select: { username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      })
    }
  } else {
    posts = await prisma.post.findMany({
      where:
        activeCategory !== "all"
          ? {
              category: { name: activeCategory },
              author: { isBanned: false }, // ✅ скрываем посты забаненных
            }
          : {
              author: { isBanned: false }, // ✅ скрываем посты забаненных
            },
      include: { category: true, author: { select: { username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div>
      <Home categories={categories} posts={posts} activeCategory={activeCategory} />
    </div>
  )
}