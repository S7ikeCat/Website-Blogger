"use client"

import Image from "next/image"
import Link from "next/link"

type Category = {id:number; name: string}


type Post = {
    author: { username: string }
    post_id: number
    title: string
    description: string
    img_post: string | null
    category: Category | null
}


type Profile = {
    id: number
    username: string
    avatarUrl: string | null
    role: "USER" | "ADMIN"
    _count: {followers: number; following: number; posts: number}
}

type Props = {
    profile: Profile
    posts: Post[]
    isOwner: boolean
    isFollowing: boolean
    viewerRole?: "USER" | "ADMIN" 
}

export function ProfilePage({profile, posts, isOwner, isFollowing, viewerRole}: Props) {

  const isViewerAdmin = viewerRole === "ADMIN"
  

    return (
        <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between border-2 border-black bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-black">
            <Image
              src={profile.avatarUrl ?? "/default-avatar.jpg"}
              alt=""
              width={56}
              height={56}
            />
          </div>

          <div>
            <div className="text-xl font-bold">@{profile.username}</div>

            <div className="mt-1 text-sm text-gray-600">
              Posts: {profile._count.posts} · Followers:{" "}
              <Link className="underline" href={`/u/${profile.username}/followers`}>
                {profile._count.followers}
              </Link>{" "}
              · Following:{" "}
              <Link className="underline" href={`/u/${profile.username}/following`}>
                {profile._count.following}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
  {isViewerAdmin && isOwner &&(
    <div>
    <Link
      href="/admin"
      className="border-2 border-black bg-white px-4 py-2 font-semibold"
    >
      Go to admin
    </Link>
    </div>
  )}

  {isOwner && (
    <div><Link href="/posts/new">Create post</Link></div>
  )}

  {!isOwner && (
    <div>
    <button
      className="border-2 border-black bg-white px-4 py-2 font-semibold"
      onClick={async () => {
        if (isFollowing) {
          await fetch(
            `/api/follow?username=${encodeURIComponent(profile.username)}`,
            { method: "DELETE" }
          )
        } else {
          await fetch("/api/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: profile.username }),
          })
        }
        window.location.reload()
      }}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
    
    </div>
  )}
</div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
      
        {posts.map((p) => (
          <article key={p.post_id} className="border-2 border-black bg-white p-5">
            {p.img_post?.trim() && (
        <Link href={`/posts/${p.post_id}`} className="block">
          <div className="mb-4 overflow-hidden border-2 border-black">
            <Image
              src={p.img_post}
              alt={p.title}
              width={800}
              height={400}
              unoptimized
              className="h-48 w-full object-cover"
            />
          </div>
        </Link>
      )}
            <div className="text-xs font-semibold uppercase text-gray-500">
              {p.category?.name ?? "Uncategorized"}
            </div>
            <div className="mt-1 text-xs text-gray-600">
    by{" "}
    <Link
      href={`/u/${p.author.username}`}
      className="underline font-semibold"
    >
      @{p.author.username}
    </Link>
  </div>
            <h2 className="mt-2 text-lg font-bold"><Link href={`/posts/${p.post_id}`} className="underline">
          {p.title}
        </Link></h2>
            <p className="mt-2 text-sm text-gray-700">{p.description}</p>
            {isOwner && (

<div className="mt-4 flex gap-4">
<Link
  href={`/posts/${p.post_id}/edit`}
  className="mt-4 border-2 border-black bg-white px-3 py-2 text-sm font-semibold"
>
  Edit
</Link>
  <button
    className="mt-4 border-2 border-black bg-white px-3 py-2 text-sm font-semibold"
    onClick={async () => {
      if (!p.post_id) {
        alert("Post id is missing in UI data")
        console.log("POST OBJECT:", p)
        return
      }
  
      const res = await fetch(`/api/posts/${p.post_id}`, {
        method: "DELETE",
      })
  
      const data = await res.json().catch(() => ({}))
  
      if (!res.ok) {
        alert(data?.error ?? "Delete failed")
        return
      }
  
      window.location.reload()
    }}
  >
    Delete
  </button>
  </div>
)}
          </article>
          
        ))}
      </div>
    </div>
  )
}

export default ProfilePage