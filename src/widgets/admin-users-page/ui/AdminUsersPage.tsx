"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { FiSearch, FiExternalLink } from "react-icons/fi"

type UserRow = {
  id: number
  username: string
  email: string
  avatarUrl: string | null
  role: "USER" | "ADMIN"
  createdAt: string | Date
  _count: { posts: number; followers: number; following: number }
}

type Props = { users: UserRow[] }

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d
  if (!Number.isFinite(date.getTime())) return ""
  return date.toLocaleDateString("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit" })
}

export function AdminUsersPage({ users }: Props) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return users
    return users.filter((u) => {
      return (
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s)
      )
    })
  }, [q, users])

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <div className="mt-1 text-sm text-neutral-600">Total: {users.length}</div>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
          >
            Back to admin
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
          <FiSearch className="shrink-0 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username / email / role"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 overflow-hidden rounded-full border border-black/15 bg-white">
                <Image
                  src={u.avatarUrl ?? "/default-avatar.jpg"}
                  alt="avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate text-base font-semibold">@{u.username}</div>
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-xs font-semibold",
                      u.role === "ADMIN"
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-white text-neutral-700",
                    ].join(" ")}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="truncate text-xs text-neutral-600">{u.email}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-neutral-200 p-2">
                <div className="font-bold">{u._count.posts}</div>
                <div className="text-neutral-600">posts</div>
              </div>
              <div className="rounded-xl border border-neutral-200 p-2">
                <div className="font-bold">{u._count.followers}</div>
                <div className="text-neutral-600">followers</div>
              </div>
              <div className="rounded-xl border border-neutral-200 p-2">
                <div className="font-bold">{u._count.following}</div>
                <div className="text-neutral-600">following</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              Registered: {formatDate(u.createdAt)}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/u/${u.username}`}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
              >
                Profile <FiExternalLink />
              </Link>

              {/* позже сюда добавим: warn/ban/unban + open admin user page */}
              <Link
                href={`/admin/users/${u.id}`}
                className="rounded-xl border border-black bg-black px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          No users found.
        </div>
      )}
    </main>
  )
}

export default AdminUsersPage