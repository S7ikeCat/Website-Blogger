import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { AdminUsersPage } from "@/widgets/admin-users-page/ui/AdminUsersPage"

export const dynamic = "force-dynamic"

export default async function Page() {
  const viewer = await getCurrentUser()
  if (!viewer) redirect("/login")
  if (viewer.role !== "ADMIN") redirect("/")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })

  return <AdminUsersPage users={users} />
}