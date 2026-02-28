"use client"

import { formatDate } from "@/shared/lib/formatDate"
import Image from "next/image"
import Link from "next/link"

type Category = { id: number; name: string }

type Post = {
  author: { username: string }
  post_id: number
  title: string
  description: string
  createdAt: string | Date
  updatedAt: string | Date
  img_post: string | null
  category: Category | null
}

type Profile = {
  id: number
  username: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
  isBanned: boolean
  banReason?: string | null
  _count: { followers: number; following: number; posts: number }
}

type Props = {
  profile: Profile
  posts: Post[]
  isOwner: boolean
  isFollowing: boolean
  viewerRole?: "USER" | "ADMIN"
}

export function ProfilePage({
  profile,
  posts,
  isOwner,
  isFollowing,
  viewerRole,
}: Props) {
  const isViewerAdmin = viewerRole === "ADMIN"

  if (profile.isBanned && !isViewerAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="text-lg font-semibold text-red-700">This user is banned</div>
          {profile.banReason ? (
            <div className="mt-2 text-sm text-red-600">Reason: {profile.banReason}</div>
          ) : null}
        </div>
      </div>
    )
  }

  async function toggleFollow() {
    if (isFollowing) {
      await fetch(`/api/follow?username=${encodeURIComponent(profile.username)}`, {
        method: "DELETE",
      })
    } else {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profile.username }),
      })
    }
    window.location.reload()
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header card */}
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* left */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10 bg-white">
              <Image
                src={profile.avatarUrl ?? "/default-avatar.jpg"}
                alt="avatar"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                @{profile.username}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>
                  <span className="font-semibold text-gray-900">{profile._count.posts}</span>{" "}
                  posts
                </span>

                <span className="text-gray-300">•</span>

                <Link
                  className="hover:underline"
                  href={`/u/${profile.username}/followers`}
                >
                  <span className="font-semibold text-gray-900">
                    {profile._count.followers}
                  </span>{" "}
                  followers
                </Link>

                <span className="text-gray-300">•</span>

                <Link
                  className="hover:underline"
                  href={`/u/${profile.username}/following`}
                >
                  <span className="font-semibold text-gray-900">
                    {profile._count.following}
                  </span>{" "}
                  following
                </Link>
              </div>
            </div>
          </div>

          {/* right actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isOwner ? (
              <>
                {isViewerAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                  >
                    Dashboard
                  </Link>
                )}

                <Link
                  href="/settings"
                  className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                >
                  Settings
                </Link>

                <Link
                  href="/posts/new"
                  className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                >
                  Create post
                </Link>
              </>
            ) : (
              <button
                onClick={toggleFollow}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.98]",
                  isFollowing
                    ? "border border-black/15 bg-white hover:-translate-y-0.5 hover:shadow-md"
                    : "bg-black text-white hover:opacity-90",
                ].join(" ")}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold tracking-tight">Posts</h2>
          <div className="text-sm text-gray-500">{posts.length} total</div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No posts yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => {
              const updated =
                p.updatedAt &&
                new Date(p.updatedAt).getTime() !== new Date(p.createdAt).getTime()

              return (
                <article
                  key={p.post_id}
                  className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {p.img_post?.trim() && (
                    <Link href={`/posts/${p.post_id}`} className="block">
                      <div className="relative h-44 w-full overflow-hidden">
                        <Image
                          src={p.img_post}
                          alt={p.title}
                          fill
                          unoptimized
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {p.category?.name ?? "Uncategorized"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {formatDate(p.createdAt)}
                      </div>
                    </div>

                    <h3 className="mt-2 text-lg font-bold leading-snug text-black">
                      <Link href={`/posts/${p.post_id}`} className="hover:underline">
                        {p.title}
                      </Link>
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {p.description.length > 110
                        ? p.description.slice(0, 110) + "..."
                        : p.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/u/${p.author.username}`}
                        className="text-xs font-semibold text-gray-700 hover:underline"
                      >
                        @{p.author.username}
                      </Link>

                      {updated && (
                        <span className="text-xs text-gray-500">
                          Updated: {formatDate(p.updatedAt)}
                        </span>
                      )}
                    </div>

                    {isOwner && (
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/posts/${p.post_id}/edit`}
                          className="flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-center text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                        >
                          Edit
                        </Link>

                        <button
                          className="flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                          onClick={async () => {
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
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProfilePage