import { Navbar } from "@/widgets/navbar";
import { Home } from "@/widgets/home"
import { prisma } from "@/shared/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Mainpage(props: {searchParams: Promise<{category?: string}>
})
{
  const searchParams = await props.searchParams
  const activeCategory = searchParams.category ?? "all"

  const categories = await prisma.category.findMany({
    orderBy: {name: "asc"},
  })

  const posts = await prisma.post.findMany({
    where:
    activeCategory !== "all"
    ? {category: {name: activeCategory}}
    : undefined,
    include: {category: true, author: {select: {username: true}}},
    orderBy: {createdAt: "desc"}
  })
  return (
    <div>
        <Navbar/>
        <Home categories={categories} posts={posts} activeCategory={activeCategory}/>
    </div>
  );
}
