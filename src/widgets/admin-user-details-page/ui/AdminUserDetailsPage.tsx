"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Swal from "sweetalert2"
import { FiArrowLeft, FiAlertTriangle, FiUserX, FiCheckCircle, FiTrash2 } from "react-icons/fi"

type User = {
  id: number
  username: string
  email: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
  isBanned: boolean
  banReason: string | null
  bannedAt: string | Date | null
  createdAt: string | Date
  _count: { posts: number; followers: number; following: number }
}

type PostRow = {
  post_id: number
  title: string
  createdAt: string | Date
  updatedAt: string | Date
  img_post: string | null
  imgPostKey: string | null
}

type ActionRow = {
  id: number
  type: "WARN" | "BAN" | "UNBAN" | "DELETE_POST"
  reason: string | null
  createdAt: string | Date
  admin: { username: string }
}

type Props = {
  user: User
  posts: PostRow[]
  actions: ActionRow[]
}

function formatDate(d: string | Date | null) {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (!Number.isFinite(date.getTime())) return ""
  return date.toLocaleString("ru-RU")
}

export function AdminUserDetailsPage({ user, posts, actions }: Props) {
  const [busy, setBusy] = useState(false)

  async function apiPost(url: string, body: unknown): Promise<boolean> {
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
        text: data?.error ?? `Request failed (${res.status})`,
        confirmButtonColor: "#000",
      })
      return false
    }
  
    return true
  }

  async function warn() {
    const r = await Swal.fire({
      icon: "warning",
      title: `Warn @${user.username}`,
      input: "text",
      inputLabel: "Reason (optional)",
      showCancelButton: true,
      confirmButtonText: "Send warning",
      confirmButtonColor: "#000",
    })
    if (!r.isConfirmed) return

    setBusy(true)
    try {
      await apiPost("/api/admin/users/warn", { userId: user.id, reason: (r.value ?? "").trim() })
      await Swal.fire({ icon: "success", title: "Warning sent", confirmButtonColor: "#000" })
      location.reload()
    } finally {
      setBusy(false)
    }
  }

  async function ban() {
    const r = await Swal.fire({
      icon: "warning",
      title: `Ban @${user.username}`,
      input: "text",
      inputLabel: "Reason",
      showCancelButton: true,
      confirmButtonText: "Ban",
      confirmButtonColor: "#000",
    })
    if (!r.isConfirmed) return

    setBusy(true)
    try {
      await apiPost("/api/admin/users/ban", { userId: user.id, reason: (r.value ?? "").trim() })
      await Swal.fire({ icon: "success", title: "User banned", confirmButtonColor: "#000" })
      location.reload()
    } finally {
      setBusy(false)
    }
  }

  async function unban() {
    const c = await Swal.fire({
      icon: "warning",
      title: `Unban @${user.username}?`,
      showCancelButton: true,
      confirmButtonText: "Unban",
      confirmButtonColor: "#000",
    })
    if (!c.isConfirmed) return

    setBusy(true)
    try {
      await apiPost("/api/admin/users/unban", { userId: user.id })
      await Swal.fire({ icon: "success", title: "User unbanned", confirmButtonColor: "#000" })
      location.reload()
    } finally {
      setBusy(false)
    }
  }

  async function deletePost(postId: number) {
    const r = await Swal.fire({
      icon: "warning",
      title: `Delete post #${postId}`,
      input: "text",
      inputLabel: "Reason (optional)",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#000",
    })
    if (!r.isConfirmed) return

    setBusy(true)
    try {
      await apiPost("/api/admin/posts/delete", {
        postId,
        reason: (r.value ?? "").trim(),
      })
      await Swal.fire({ icon: "success", title: "Post deleted", confirmButtonColor: "#000" })
      location.reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm">
          <FiArrowLeft />
          Back
        </Link>
        <Link href={`/u/${user.username}`} className="text-sm underline">
          Open profile
        </Link>
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-neutral-200">
              <Image
                src={user.avatarUrl ?? "/default-avatar.jpg"}
                alt=""
                width={56}
                height={56}
                unoptimized
              />
            </div>

            <div>
              <div className="text-xl font-bold">@{user.username}</div>
              <div className="text-sm text-neutral-600">{user.email}</div>
              <div className="mt-1 text-xs text-neutral-500">
                Registered: {formatDate(user.createdAt)}
              </div>

              {user.isBanned && (
                <div className="mt-2 rounded-xl border border-black bg-black px-3 py-2 text-xs text-white">
                  BANNED {user.banReason ? `• ${user.banReason}` : ""}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={warn}
              className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <FiAlertTriangle />
              Warn
            </button>

            {!user.isBanned ? (
              <button
                disabled={busy}
                onClick={ban}
                className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <FiUserX />
                Ban
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={unban}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                <FiCheckCircle />
                Unban
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-lg font-bold">{user._count.posts}</div>
            <div className="text-neutral-600">posts</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-lg font-bold">{user._count.followers}</div>
            <div className="text-neutral-600">followers</div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="text-lg font-bold">{user._count.following}</div>
            <div className="text-neutral-600">following</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Posts</div>

          <div className="mt-4 space-y-3">
            {posts.length === 0 ? (
              <div className="text-sm text-neutral-600">No posts</div>
            ) : (
              posts.map((p) => (
                <div
                  key={p.post_id}
                  className="rounded-xl border border-neutral-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/posts/${p.post_id}`} className="font-semibold underline">
                        #{p.post_id} {p.title}
                      </Link>
                      <div className="mt-1 text-xs text-neutral-500">
                        Created: {formatDate(p.createdAt)} • Updated: {formatDate(p.updatedAt)}
                      </div>
                    </div>

                    <button
                      disabled={busy}
                      onClick={() => deletePost(p.post_id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Moderation history</div>

          <div className="mt-4 space-y-3">
            {actions.length === 0 ? (
              <div className="text-sm text-neutral-600">No actions yet</div>
            ) : (
              actions.map((a) => (
                <div key={a.id} className="rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{a.type}</div>
                    <div className="text-xs text-neutral-500">{formatDate(a.createdAt)}</div>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">
                    by @{a.admin.username}
                  </div>
                  {a.reason && <div className="mt-2 text-sm">{a.reason}</div>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminUserDetailsPage