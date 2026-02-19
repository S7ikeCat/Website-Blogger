import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { notFound } from "next/navigation"
import { UserCard } from "@/widgets/user-card/ui/UserCard"


type PageProps = {params: Promise<{username: string}>}

export default async function Page({params}: PageProps) {
    const {username} = await params
    
    const profile = await prisma.user.findUnique({
        where: {username},
        select: {id: true, username: true}
    })
    if(!profile) notFound()

    const viewer = await getCurrentUser()

    const followers = await prisma.follow.findMany({
        where: {followingId: profile.id}, //кто подписан на профиль
        include: {follower: {select: {id: true, username: true, avatarUrl: true}}},
        orderBy: {createdAt: "desc"}
    })
    // Если зритель залогинен — узнаем, на кого он уже подписан (чтобы кнопки были корректными)
    const viewerFollowingIds = viewer ?
    new Set(
        (
            await prisma.follow.findMany({
                where: {followerId: viewer.id},
                select: {followingId: true},
            })
        ).map((x) => x.followingId)
    )
    : new Set<number>()


    return (
        <div className="">
            <h1 className="">Followers of @{profile.username}</h1>

            <div className="">
                {followers.map((f) => (
                    <UserCard key={f.follower.id} user={f.follower} 
                    canFollow={!!viewer && viewer.id !== f.follower.id} 
                    initiallyFollowing={viewerFollowingIds.has(f.follower.id)}/>
                ))}
            </div>
        </div>
    )
}