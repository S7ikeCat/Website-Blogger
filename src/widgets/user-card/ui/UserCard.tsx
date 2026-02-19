"use client"

import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

type UserCardUser = {
    id: number
    username: string
    avatarUrl: string | null
}

type Props = {
    user: UserCardUser
    canFollow: boolean
    initiallyFollowing: boolean
}

export function UserCard({user, canFollow, initiallyFollowing}: Props) {
    const [following, setFollowing] = useState(initiallyFollowing)
    const [loading, setLoading] = useState(false)

    async function toggleFollow() {
        setLoading(true)
        try {
            if(following) {
                await fetch(`/api/follow?username=${encodeURIComponent(user.username)}`, {method: "DELETE"})
                setFollowing(false)
            } else {
                await fetch("/api/follow", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({username: user.username})
                })
                setFollowing(true)
            }
            
        }  finally {
            setLoading(false)
        }      
    }
    return(
        <div className="">
            <Link href={`/u/${user.username}`} className="">
            <div className="">
                <Image src={user.avatarUrl ?? "/default-avatar.jpg"} alt="" width={48} height={48}/>
            </div>
            <div className="">@{user.username}</div>
            </Link>

            {canFollow && (
                <button disabled={loading}
                onClick={toggleFollow}
                className="">
                    {following ? "Unfollow" : "Follow"}
                </button>
            )}
        </div>
    )
    
}