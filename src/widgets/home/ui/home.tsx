"use client"

import Link from "next/link"
import Image from "next/image"
import React from "react"

/* ===== types ===== */
type Category = {
  id: number
  name: string
}

type Post = {
  author: {username: string}
  post_id: number
  title: string
  description: string
  img_post: string | null
  category: Category | null
}

type HomeProps = {
  categories: Category[]
  posts: Post[]
  activeCategory: string
}

/* ===== component ===== */
export function Home({ categories, posts, activeCategory }: HomeProps) {
  return (
    <div>
      {/* info */}
      <div className="text-center mt-30 mx-6">
        <h1 className="font-bold text-4xl">Latest Blogs</h1>
        <p className="mt-3">
          text text text text text text text text
        </p>
      </div>

      {/* categories */}
      <div className="flex justify-center gap-3 mt-30">
        <Link
          href="/?category=all"
          className={`border-2 border-black px-4 py-2 ${
            activeCategory === "all"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          All
        </Link>

        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${encodeURIComponent(c.name)}`}
            className={`border-2 border-black px-4 py-2 ${
              activeCategory === c.name
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* posts */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ✅ Автор */}
      <div className="mt-1 text-xs text-gray-600">
        by{" "}
        <Link href={`/u/${p.author.username}`} className="underline font-semibold">
          @{p.author.username}
        </Link>
      </div>

      {/* ✅ Заголовок — ссылка на пост */}
      <h2 className="mt-2 text-lg font-bold">
        <Link href={`/posts/${p.post_id}`} className="underline">
          {p.title}
        </Link>
      </h2>

      <p className="mt-2 text-sm text-gray-700">{p.description}</p>
    </article>
          
        ))}
        
      </div>
    </div>
  )
}

export default Home