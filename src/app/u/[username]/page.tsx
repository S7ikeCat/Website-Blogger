import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { notFound } from "next/navigation"
import { ProfilePage } from "@/widgets/profile-page/ui/ProfilePage"

export const dynamic = "force-dynamic"
type PageProps = {params: Promise<{username: string}>}

export default async function Page({params}: PageProps) {
    const viewer = await getCurrentUser()
    const viewerRole = viewer?.role 
    
    const {username} = await params

    const user = await prisma.user.findUnique({
        where: {username},
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
            include: {category: true, author: {select: {username: true}}},
        })

        const isOwner = viewer?.id === user.id

        const isFollowing = viewer ?
        await prisma.follow.findUnique({
            where: {
                followerId_followingId: {followerId: viewer?.id, followingId: user.id}
            },
            select: {id: true}
        }).then(Boolean) : false
        return (
            <ProfilePage profile={user} posts={posts} isOwner={isOwner} isFollowing={isFollowing} viewerRole={viewerRole}/>
        )

       
}

