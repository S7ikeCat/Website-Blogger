"use client"

import Image from "next/image"
import Link from "next/link"

type Category = {id:number; name: string}

type Post = {
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
}

export function ProfilePage({profile, posts, isOwner}: Props) {
    return (
        <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between border-2 border-black bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-black">
            <Image
              src={profile.avatarUrl ?? "blogger/public/default-avatar.jpg"}
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

        {isOwner && (
          <Link
            href="/admin"
            className="border-2 border-black bg-white px-4 py-2 font-semibold"
          >
            Go to admin
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <article key={p.post_id} className="border-2 border-black bg-white p-5">
            <div className="text-xs font-semibold uppercase text-gray-500">
              {p.category?.name ?? "Uncategorized"}
            </div>
            <h2 className="mt-2 text-lg font-bold">{p.title}</h2>
            <p className="mt-2 text-sm text-gray-700">{p.description}</p>
            {isOwner && (
  <button
    className="mt-4 border-2 border-black bg-white px-3 py-2 text-sm font-semibold"
    onClick={async () => {
      await fetch(`/api/posts/${p.post_id}`, { method: "DELETE" })
      window.location.reload()
    }}
  >
    Delete
  </button>
)}
          </article>
          
        ))}
      </div>
    </div>
  )
}

export default ProfilePage