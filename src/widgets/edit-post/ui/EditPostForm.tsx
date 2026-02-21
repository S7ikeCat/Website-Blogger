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

      setOk("Saved")
      router.refresh()
      router.push(`/posts/${initial.postId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="border-2 border-black bg-white p-6">
        <h1 className="text-xl font-bold">Edit post</h1>

        <div className="mt-6 space-y-2">
          <div className="text-sm font-semibold">Post image</div>

          {/* Показываем текущую картинку */}
          {imgPost?.trim() && (
            <div className="overflow-hidden border-2 border-black">
              <Image
                src={imgPost}
                alt=""
                width={900}
                height={500}
                unoptimized
                className="h-48 w-full object-cover"
              />
            </div>
          )}

          {/* UploadThing: грузим новую картинку в POST app */}
          <UploadButtonPost
            endpoint="postImage"
            onClientUploadComplete={(files) => {
              const f = files?.[0]
              if (!f?.serverData) return

              // ВАЖНО: мы просто сохраняем новый url+key в стейт.
              // Старую картинку удалим в API PATCH (server-side), когда подтвердим обновление.
              setImgPost(f.serverData.url)
              setImgPostKey(f.serverData.key)
            }}
            onUploadError={(e: Error) => {
              setError(e.message)
            }}
          />

          {/* Удалить картинку у поста (сделаем null). Старую удалит API PATCH */}
          {imgPost && (
            <button
              type="button"
              className="border-2 border-black bg-white px-3 py-2 text-sm font-semibold"
              onClick={() => {
                setImgPost("")
                setImgPostKey("")
              }}
            >
              Remove image
            </button>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-sm font-semibold">Title</div>
          <input
            className="w-full border-2 border-black p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold">Description</div>
          <textarea
            className="w-full border-2 border-black p-2"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold">Category</div>
          <select
  className="w-full border-2 border-black p-2"
  value={categoryId ?? ""} 
  onChange={(e) => {
    const v = e.target.value
    setCategoryId(v === "" ? null : Number(v))
  }}
>
  <option value="">Uncategorized</option>
  {categories.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>
        </div>

        {error && <div className="mt-4 border-2 border-black p-2 text-sm">{error}</div>}
        {ok && <div className="mt-4 border-2 border-black p-2 text-sm">{ok}</div>}

        <div className="mt-6 flex gap-2">
          <button
            disabled={loading}
            onClick={onSave}
            className="border-2 border-black bg-white px-4 py-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            className="border-2 border-black bg-white px-4 py-2 font-semibold"
            onClick={() => router.push(`/posts/${initial.postId}`)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}