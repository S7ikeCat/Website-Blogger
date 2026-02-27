import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { redirect, notFound } from "next/navigation"
import { AdminUserDetailsPage } from "@/widgets/admin-user-details-page/ui/AdminUserDetailsPage"

export const dynamic = "force-dynamic"

type PageProps = { params: Promise<{ id: string }> }

export default async function Page({ params }: PageProps) {
  const viewer = await getCurrentUser()
  if (!viewer) redirect("/login")
  if (viewer.role !== "ADMIN") redirect("/")

  const { id } = await params
  const userId = Number(id)
  if (!Number.isFinite(userId)) notFound()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      role: true,
      isBanned: true,
      banReason: true,
      bannedAt: true,
      createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  })
  if (!user) notFound()

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      post_id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      imgPostKey: true,
      img_post: true,
    },
  })

  const actions = await prisma.moderationAction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      type: true,
      reason: true,
      createdAt: true,
      admin: { select: { username: true } },
    },
  })

  return <AdminUserDetailsPage user={user} posts={posts} actions={actions} />
}