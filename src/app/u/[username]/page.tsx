import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { notFound } from "next/navigation"
import { ProfilePage } from "@/widgets/profile-page/ui/ProfilePage"

export const dynamic = "force-dynamic"

export default async function Page({
    params}: {params: {username: string}

}) {
    const viewer = await getCurrentUser()

    const user = await prisma.user.findUnique({
        where: {username: params.username},
        select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
            _count: {
                select: {followers: true, following: true, posts: true}
            }
        }
    })

    if(!user) notFound()

        const posts = await prisma.post.findMany({
            where: {authorId: user.id},
            orderBy: {createdAt: "desc"},
            include: {category: true},
        })

        const isOwner = viewer?.id === user.id

        return (
            <ProfilePage profile={user} posts={posts} isOwner={isOwner} />
        )
}