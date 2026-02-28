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
        <div className="flex justify-between">
           <Link href={`/u/${user.username}`} className="flex items-center gap-3 min-w-0">
  <span className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-white">
    <Image
      src={user.avatarUrl?.trim() ? user.avatarUrl : "/default-avatar.jpg"}
      alt="avatar"
      fill
      unoptimized
      className="object-cover"
    />
  </span>

  <span className="truncate font-semibold text-gray-900 hover:underline">
    @{user.username}
  </span>
</Link>

{canFollow && (
  <button
    type="button"
    disabled={loading}
    onClick={toggleFollow}
    className={[
      "rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm",
      "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
      following
        ? "border border-black/15 bg-white text-gray-900 hover:-translate-y-0.5 hover:shadow-md"
        : "bg-black text-white hover:opacity-90 hover:-translate-y-0.5",
    ].join(" ")}
  >
    {loading ? "..." : following ? "Unfollow" : "Follow"}
  </button>
)}
        </div>
    )
    
}