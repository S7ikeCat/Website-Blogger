"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { UploadButtonPost } from "@/shared/lib/uploadthing"

type Category = { id: number; name: string }

type Props = {
  initial: {
    postId: number
    title: string
    description: string
    categoryId: number | null
    imgPost: string
    imgPostKey: string
  }
  categories: Category[]
}

export default function EditPostForm({ initial, categories }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [categoryId, setCategoryId] = useState<number | null>(initial.categoryId)
  const [imgPost, setImgPost] = useState(initial.imgPost)
  const [imgPostKey, setImgPostKey] = useState(initial.imgPostKey)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function onSave() {
    setLoading(true)
    setError(null)
    setOk(null)

    try {
      const res = await fetch(`/api/posts/${initial.postId}`, {
        method: "PATCH",
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
        setError(data?.error ?? "Update failed")
        return
      }

      setOk("Saved successfully")
      router.refresh()
      router.push(`/posts/${initial.postId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Edit post</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your post details, cover image, and category.
            </p>
          </div>

          <div className="text-xs text-gray-500">
            Post ID: <span className="font-semibold text-gray-700">{initial.postId}</span>
          </div>
        </div>

        {/* Cover image */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Cover image</div>
              <div className="mt-1 text-xs text-gray-500">
                Upload a new image or remove the current one.
              </div>
            </div>
          </div>

          {imgPost?.trim() ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              <div className="relative h-52 w-full">
                <Image
                  src={imgPost}
                  alt="post cover"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-black/20 bg-black/5 p-6 text-sm text-gray-600">
              No cover image selected.
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm">
              <UploadButtonPost
                endpoint="postImage"
                onClientUploadComplete={(files) => {
                  const f = files?.[0]
                  if (!f?.serverData) return
                  setImgPost(f.serverData.url)
                  setImgPostKey(f.serverData.key)
                }}
                onUploadError={(e: Error) => {
                  setError(e.message)
                }}
              />
            </div>

            {imgPost && (
              <button
                type="button"
                className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                onClick={() => {
                  setImgPost("")
                  setImgPostKey("")
                }}
              >
                Remove image
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-8">
          <label className="mb-1 block text-sm font-semibold text-gray-900">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full rounded-xl border border-black/15 px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="mb-1 block text-sm font-semibold text-gray-900">
            Description
          </label>
          <textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your post content..."
            className="w-full resize-y rounded-xl border border-black/15 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
          />
          <div className="mt-2 text-xs text-gray-500">
            Tip: use line breaks — they will be preserved.
          </div>
        </div>

        {/* Category */}
        <div className="mt-5">
          <label className="mb-1 block text-sm font-semibold text-gray-900">
            Category
          </label>

          <select
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            value={categoryId ?? ""}
            onChange={(e) => {
              const v = e.target.value
              setCategoryId(v === "" ? null : Number(v))
            }}
          >
          
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {ok && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {ok}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            onClick={() => router.push(`/posts/${initial.postId}`)}
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onSave}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}