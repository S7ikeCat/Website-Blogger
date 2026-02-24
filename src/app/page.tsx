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
      // не залогинен → просто пустой список
      posts = await prisma.post.findMany({
        where: { authorId: { in: [] } },
        include: { category: true, author: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      })
    } else {
      const following = await prisma.follow.findMany({
        where: { followerId: viewer.id },
        select: { followingId: true },
      })

      const ids = following.map((f) => f.followingId)

      posts = await prisma.post.findMany({
        where: { authorId: { in: ids } }, // ids может быть [], это ок → вернёт []
        include: { category: true, author: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      })
    }
  } else {
    posts = await prisma.post.findMany({
      where:
        activeCategory !== "all"
          ? { category: { name: activeCategory } }
          : undefined,
      include: { category: true, author: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div>
      <Home categories={categories} posts={posts} activeCategory={activeCategory} />
    </div>
  )
}