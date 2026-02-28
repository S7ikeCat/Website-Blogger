import { formatDate } from "@/shared/lib/formatDate"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { prisma } from "@/shared/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PostPage({
  params,
}: {
  params: Promise<{ post_id: string }>
}) {
  const { post_id } = await params
  const id = Number(post_id)
  if (!Number.isFinite(id)) notFound()

  const viewer = await getCurrentUser()

  const post = await prisma.post.findUnique({
    where: { post_id: id },
    include: {
      category: true,
      author: { select: { username: true, avatarUrl: true, isBanned: true } },
    },
  })

  if (!post) notFound()

  const canSeeBannedAuthorPost = viewer?.role === "ADMIN"
  if (post.author.isBanned && !canSeeBannedAuthorPost) notFound()

  const wasUpdated =
    post.updatedAt &&
    new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime()

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Top meta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
            {post.category?.name ?? "Uncategorized"}
          </span>

          <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
        </div>

        {wasUpdated && (
          <span className="text-xs text-gray-500">
            Updated: {formatDate(post.updatedAt)}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
        {post.title}
      </h1>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/10 bg-white">
          <Image
            src={post.author.avatarUrl ?? "/default-avatar.jpg"}
            alt="avatar"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="text-sm">
          <div className="text-gray-600">Written by</div>
          <Link
            href={`/u/${post.author.username}`}
            className="font-semibold text-black hover:underline"
          >
            @{post.author.username}
          </Link>
        </div>
      </div>

      {/* Cover */}
      {post.img_post?.trim() && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="relative flex justify-center overflow-hidden rounded-2xl border border-black/10">
  {/* Background blurred layer */}
  <Image
    src={post.img_post}
    alt=""
    fill
    unoptimized
    className="object-cover blur-3xl scale-110 opacity-60"
  />

  {/* Foreground real image */}
  <Image
    src={post.img_post}
    alt={post.title}
    width={1200}
    height={800}
    unoptimized
    className="relative z-10 h-auto max-h-150 w-auto object-contain"
  />
</div>
        </div>
      )}

      {/* Content */}
      <article className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-800">
          {post.description}
        </p>
      </article>

      {/* Bottom info */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <span>Published: {formatDate(post.createdAt)}</span>
        {wasUpdated && <span>Last updated: {formatDate(post.updatedAt)}</span>}
      </div>
    </main>
  )
}