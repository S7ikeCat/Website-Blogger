"use client"


import { UploadButtonPost } from "@/shared/lib/uploadthing"
import { useState } from "react"


type Category = {id: number; name: string}

export function CreatePostForm({categories}: {categories: Category[]}) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 0)
    const [imgPost, setImgPost] = useState("")

    return (
        <form onSubmit={async (e) => {
            e.preventDefault()
        
            const res = await fetch("/api/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                description,
                category_id: categoryId,
                img_post: imgPost || null,
              }),
            })
        
            if (!res.ok) {
              const text = await res.text()
              alert(text)
              return
            }
        
            // очистка формы
            setTitle("")
            setDescription("")
            setImgPost("")
            // categoryId можно оставить как есть
            alert("Post created!")
          }} className="flex flex-col gap-5">
            <h2>Create Post</h2>
            
            <div className="space-y-2">
  <label className="block text-sm font-medium">
    Post image
  </label>

  <UploadButtonPost
    endpoint="postImage"
    onClientUploadComplete={(res) => {
      const url = res?.[0]?.ufsUrl
      if (url) setImgPost(url)
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

            <input className="" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

            <textarea className="" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

            <select className="" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            <button type="submit" disabled={!title || !description} className="border-2 border-black bg-white px-4 py-2 font-semibold">Save</button>
        </form>
    )
}