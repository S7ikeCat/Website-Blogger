import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { CreatePostForm } from "@/features/post/create/ui/CreatePostForm"

export const dynamic = "force-dynamic"

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return <CreatePostForm categories={categories} />
}