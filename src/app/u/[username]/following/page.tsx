import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import { prisma } from "@/shared/lib/prisma";
import { UserCard } from "@/widgets/user-card/ui/UserCard";
import { notFound } from "next/navigation";

type PageProps = {params: Promise<{username: string}>}

export default async function Page({params}: PageProps) {
    const {username} = await params
    
    const profile  = await prisma.user.findUnique({
        where: {username},
        select: {id: true, username: true}
    })
    if(!profile) notFound()
    
        const viewer = await getCurrentUser()

        const following = await prisma.follow.findMany({
            where: {followerId: profile.id}, //на кого подписан profile
            include: {following: {select: {id: true, username: true, avatarUrl: true}}},
            orderBy: {createdAt: "desc"}
        })

        const viewerFollowingIds = viewer ?
        new Set(
            (
                await prisma.follow.findMany({
                    where: {followerId: viewer.id},
                    select: {followingId: true}
                })
            ).map((x) => x.followingId)
        )
        : new Set<number>()

        return(
            <div className="">
                <h1 className="">Following of @{profile.username}</h1>

                <div className="">
                    {following.map((f) => (
                        <UserCard key={f.following.id}
                        user={f.following}
                        canFollow={!!viewer && viewer.id !== f.following.id}
                        initiallyFollowing={viewerFollowingIds.has(f.following.id)}/>
                    ))}
                </div>
            </div>
        )
}