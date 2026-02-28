"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { swal } from "@/shared/lib/swal";

export function PostActions({ postId, canEdit }: { postId: number; canEdit: boolean }) {
  const router = useRouter();

  if (!canEdit) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/posts/${postId}/edit`} className="btn">
        <FiEdit2 />
        Edit
      </Link>

      <button
        type="button"
        className="btn btn-danger"
        onClick={async () => {
          const res = await swal.fire({
            icon: "warning",
            title: "Delete post?",
            text: "Это действие нельзя отменить.",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
          });

          if (!res.isConfirmed) return;

          const del = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
          const data = await del.json().catch(() => ({}));

          if (!del.ok) {
            await swal.fire({
              icon: "error",
              title: "Delete failed",
              text: data?.error ?? "Something went wrong",
            });
            return;
          }

          await swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Пост удалён.",
            timer: 900,
            showConfirmButton: false,
          });

          router.push("/");
          router.refresh();
        }}
      >
        <FiTrash2 />
        Delete
      </button>
    </div>
  );
}
