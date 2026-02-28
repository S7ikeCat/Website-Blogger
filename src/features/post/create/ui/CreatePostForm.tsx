"use client"

import { useState } from "react"
import { UploadButtonPost } from "@/shared/lib/uploadthing"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"
import Image from "next/image"

type Category = {
  id: number
  name: string
}

export function CreatePostForm({ categories }: { categories: Category[] }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0)
  const [imgPost, setImgPost] = useState<string>("")
  const [imgPostKey, setImgPostKey] = useState<string>("")

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category_id: categoryId,
        img_post: imgPost || null,
        imgPostKey: imgPostKey || null,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: data?.error ?? "Create failed",
      })
      return
    }

    setTitle("")
    setDescription("")
    setImgPost("")
    setImgPostKey("")

    const postId = data?.post?.post_id
    const username = data?.username

    const result = await Swal.fire({
      title: "Post created!",
      text: "Where do you want to go?",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Go to post",
      cancelButtonText: "Go to profile",
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      router.push(`/posts/${postId}`)
    } else {
      router.push(`/u/${username}`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Create post</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add title, description, category and optional cover image.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* IMAGE */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold tracking-tight">Post image</div>
              <div className="mt-1 text-sm text-gray-600">Optional cover.</div>
            </div>

            {imgPost && (
              <button
                type="button"
                onClick={() => {
                  setImgPost("")
                  setImgPostKey("")
                }}
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                Remove
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4">
            {imgPost ? (
              <div className="overflow-hidden rounded-2xl border border-black/10">
                <div className="relative h-56 w-full">
                  <Image
                    src={imgPost}
                    alt="cover"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-black/20 bg-black/5 p-6 text-sm text-gray-600">
                No image selected.
              </div>
            )}

            {/* SAFE wrapper (как в settings) — не даёт горизонтальный скролл */}
            <div className="min-w-0">
              <div className="w-full max-w-full overflow-hidden rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm">
                <UploadButtonPost
                  endpoint="postImage"
                  onClientUploadComplete={(res) => {
                    const file = res?.[0]
                    if (!file?.serverData) return
                    setImgPost(file.serverData.url)
                    setImgPostKey(file.serverData.key)
                  }}
                  onUploadError={(error: Error) => {
                    Swal.fire({
                      icon: "error",
                      title: "Upload error",
                      text: error.message,
                    })
                  }}
                />
              </div>
            </div>

            {imgPost && (
              <div className="text-xs font-semibold text-green-700">
                Image uploaded ✓
              </div>
            )}
          </div>
        </section>

        {/* FIELDS */}
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="grid gap-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-900">
                Title
              </label>
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-900">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full resize-y rounded-xl border border-black/15 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-900">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!title || !description}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                Publish
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}