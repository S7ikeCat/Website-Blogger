"use client"

import { useState } from "react"
import { UploadButtonPost } from "@/shared/lib/uploadthing"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"


type Category = {
  id: number
  name: string
}

export function CreatePostForm({ categories }: { categories: Category[] }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<number>(
    categories[0]?.id ?? 0
  )
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

    const data = await res.json()

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

    const postId = data.post.post_id
const username = data.username

const result = await Swal.fire({
  title: "Post created!",
  text: "Where do you want to go?",
  icon: "success",
  showCancelButton: true,
  confirmButtonText: "Go to post",
  cancelButtonText: "Go to profile",
})

if (result.isConfirmed) {
  router.push(`/posts/${postId}`)
} else {
  router.push(`/u/${username}`)
}
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 max-w-md"
    >
      <h2 className="text-xl font-bold">Create Post</h2>

      {/* Image upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Post image
        </label>

        <UploadButtonPost
          endpoint="postImage"
          onClientUploadComplete={(res) => {
            const file = res[0]
            if (!file) return

            const { url, key } = file.serverData

            setImgPost(url)
            setImgPostKey(key)
          }}
          onUploadError={(error: Error) => {
            alert(`Upload error: ${error.message}`)
          }}
          appearance={{
            button:
              "border-2 border-black bg-white px-4 py-2 font-semibold hover:bg-black hover:text-white transition",
            container: "w-fit",
          }}
        />

        {imgPost && (
          <div className="text-xs text-green-600">
            Image uploaded ✓
          </div>
        )}
      </div>

      {/* Title */}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-3 py-2"
      />

      {/* Description */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border px-3 py-2"
      />

      {/* Category */}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        className="border px-3 py-2"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Submit */}
      <button
        type="submit"
        disabled={!title || !description}
        className="border-2 border-black bg-white px-4 py-2 font-semibold hover:bg-black hover:text-white transition disabled:opacity-50"
      >
        Save
      </button>
    </form>
  )
}