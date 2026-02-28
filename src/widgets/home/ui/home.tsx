"use client"

import Link from "next/link"
import Image from "next/image"
import React from "react"
import { useRouter } from "next/navigation"

/* ===== types ===== */
type Category = {
  id: number
  name: string
}

type Post = {
  post_id: number
  title: string
  description: string
  img_post: string | null
  category: Category | null
  createdAt: string | Date
  updatedAt: string | Date
  author: {
    username: string
    avatarUrl: string | null
  }
}

type HomeProps = {
  categories: Category[]
  posts: Post[]
  activeCategory: string
}



/* ===== component ===== */
export function Home({ categories, posts, activeCategory }: HomeProps) {
  const router = useRouter()
  return (
    <div>
      {/* info */}
<section className="mx-auto mt-25 max-w-4xl px-6 text-center">
  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
    Welcome, creators
  </h1>

  <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
    Discover fresh ideas, practical insights, and real-world experiences from creators across lifestyle,
    startups, and technology. From productivity hacks and personal growth stories to product launches
    and emerging tech trends — explore content designed to inform, inspire, and spark new perspectives.
  </p>
</section>

{/* CATEGORIES */}
<div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3 px-6">
  {/* All */}
  <Link
    href="/?category=all"
    className={[
      "rounded-xl border border-black/15 px-4 py-2 text-sm font-medium",
      "transition active:scale-[0.98]",
      "hover:-translate-y-0.5 hover:border-black/25 hover:shadow-sm",
      activeCategory === "all"
        ? "bg-black text-white shadow-sm"
        : "bg-white text-black",
    ].join(" ")}
  >
    All
  </Link>

  {/* categories from db */}
  {categories.map((c) => (
    <Link
      key={c.id}
      href={`/?category=${encodeURIComponent(c.name)}`}
      className={[
        "rounded-xl border border-black/15 px-4 py-2 text-sm font-medium",
        "transition active:scale-[0.98]",
        "hover:-translate-y-0.5 hover:border-black/25 hover:shadow-sm",
        activeCategory === c.name
          ? "bg-black text-white shadow-sm"
          : "bg-white text-black",
      ].join(" ")}
    >
      {c.name}
    </Link>
  ))}

  {/* Following */}
  <Link
    href="/?category=following"
    className={[
      "rounded-xl border border-black/15 px-4 py-2 text-sm font-medium",
      "transition active:scale-[0.98]",
      "hover:-translate-y-0.5 hover:border-black/25 hover:shadow-sm",
      activeCategory === "following"
        ? "bg-black text-white shadow-sm"
        : "bg-white text-black",
    ].join(" ")}
  >
    Following
  </Link>
</div>

{/* Empty state for following */}
{activeCategory === "following" && posts.length === 0 && (
  <div className="mx-auto mt-10 max-w-2xl px-6 text-center">
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600">
        Your Following feed is empty for now. Follow a few creators to see their latest posts here.
      </p>
    </div>
  </div>
)}
      {/* posts */}
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
      {posts.map((p) => (
  <article
    key={p.post_id}
    onClick={() => router.push(`/posts/${p.post_id}`)}
    className="
      group cursor-pointer
      rounded-2xl border border-black/10 bg-white
      shadow-sm transition
      hover:-translate-y-0.5 hover:shadow-lg
      active:translate-y-0 active:scale-[0.99]
      overflow-hidden
      m-3
    "
  >
    {p.img_post?.trim() && (
      <Link href={`/posts/${p.post_id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-48 w-full overflow-hidden">
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
      {/* top meta row */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {p.category?.name ?? "Uncategorized"}
        </div>

        <Link
          href={`/u/${p.author.username}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-black"
        >
          <span className="relative h-7 w-7 overflow-hidden rounded-full border border-black/10">
            <Image
              src={p.author.avatarUrl ?? "/default-avatar.jpg"}
              alt="avatar"
              fill
              className="object-cover"
              unoptimized
            />
          </span>
          <span className="font-semibold">@{p.author.username}</span>
        </Link>
      </div>

      <h2 className="mt-3 text-lg font-bold leading-snug text-black">
        {p.title}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        {p.description.length > 20 ? p.description.slice(0, 90) + "..." : p.description}
      </p>

      {/* subtle bottom row (optional, но выглядит круто) */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Read more</span>
        <span className="transition group-hover:translate-x-0.5">→</span>
      </div>
    </div>
  </article>
))}
        
      </div>
    </div>
  )
}

export default Home