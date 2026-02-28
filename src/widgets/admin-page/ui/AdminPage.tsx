"use client"

import Link from "next/link"
import { useState } from "react"
import Swal from "sweetalert2"
import { FiUsers, FiPlusSquare, FiTrash2 } from "react-icons/fi"
import { CreatePostForm } from "@/features/post/create/ui/CreatePostForm"

type AdminUser = {
  id: number
  username: string
  email: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
}

type Category = { id: number; name: string }

type Props = {
  user: AdminUser
  categories: Category[]
}

type Tab = "create" | "users" | "moderation"

/* ✅ ВНЕ компонента */
function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-black bg-black text-white"
          : "border-neutral-200 bg-white hover:bg-neutral-50",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  )
}

export function AdminPage({ user, categories }: Props) {
  const [tab, setTab] = useState<Tab>("create")
  const [targetUsername, setTargetUsername] = useState("")
  const [postId, setPostId] = useState("")

  async function apiPost(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: data?.error ?? "Unknown error",
        confirmButtonColor: "#000",
      })
      return null
    }
    return data
  }

  async function warnUser() {
    if (!targetUsername.trim()) return

    const r = await Swal.fire({
      icon: "warning",
      title: `Warn @${targetUsername}`,
      input: "text",
      showCancelButton: true,
      confirmButtonColor: "#000",
    })
    if (!r.isConfirmed) return

    await apiPost("/api/admin/users/warn", {
      username: targetUsername.trim(),
      reason: (r.value ?? "").trim(),
    })
  }

  async function deletePostById() {
    const id = Number(postId)
    if (!Number.isFinite(id)) return

    const r = await Swal.fire({
      icon: "warning",
      title: `Delete post #${id}`,
      input: "text",
      showCancelButton: true,
      confirmButtonColor: "#000",
    })
    if (!r.isConfirmed) return

    await apiPost("/api/admin/posts/delete", {
      postId: id,
      reason: (r.value ?? "").trim(),
    })

    setPostId("")
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* HEADER */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Welcome, @{user.username} 👑
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm"
          >
            Home
          </Link>
        </div>

        {/* TABS */}
        <div className="mt-5 flex gap-2">
          <TabButton
            active={tab === "create"}
            onClick={() => setTab("create")}
            label="Create post"
            icon={<FiPlusSquare />}
          />
          <TabButton
            active={tab === "users"}
            onClick={() => setTab("users")}
            label="Users"
            icon={<FiUsers />}
          />
        </div>
      </div>

      {/* CONTENT */}
      {tab === "create" && (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <CreatePostForm categories={categories} />
        </section>
      )}

      {tab === "users" && (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <Link
            href="/admin/users"
            className="rounded-xl border border-black bg-black px-4 py-2 text-sm text-white"
          >
            Open users list
          </Link>
        </section>
      )}

      {tab === "moderation" && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* USER ACTION */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <input
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2"
            />
            <button
              onClick={warnUser}
              className="mt-3 rounded-xl border border-black px-4 py-2 text-sm"
            >
              Warn
            </button>
          </div>

          {/* DELETE POST */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <input
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="Post id"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2"
            />
            <button
              onClick={deletePostById}
              className="mt-3 flex items-center gap-2 rounded-xl border border-black bg-black px-4 py-2 text-sm text-white"
            >
              <FiTrash2 />
              Delete
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default AdminPage