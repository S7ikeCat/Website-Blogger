"use client"

import { useState } from "react"

export default function AdminUserActions(props: { targetUserId: number; postId?: number }) {
  const { targetUserId, postId } = props
  const [reason, setReason] = useState("")

  async function warn() {
    await fetch("/api/admin/users/warn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId, reason }),
    })
    setReason("")
  }

  async function ban() {
    await fetch("/api/admin/users/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId, reason }),
    })
    setReason("")
  }

  async function unban() {
    await fetch("/api/admin/users/unban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId }),
    })
  }

  async function deletePost() {
    if (!postId) return
    await fetch("/api/admin/posts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reason }),
    })
    setReason("")
    window.location.reload()
  }

  return (
    <div>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="reason" />

      {!postId && (
        <>
          <button onClick={warn}>Warn</button>
          <button onClick={ban}>Ban</button>
          <button onClick={unban}>Unban</button>
        </>
      )}

      {postId && <button onClick={deletePost}>Delete post</button>}
    </div>
  )
}