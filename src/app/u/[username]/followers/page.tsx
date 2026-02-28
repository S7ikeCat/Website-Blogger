import { prisma } from "@/shared/lib/prisma"
import { getCurrentUser } from "@/shared/lib/getCurrentUser"
import { notFound } from "next/navigation"
import { UserCard } from "@/widgets/user-card/ui/UserCard"
import Link from "next/link"

type PageProps = { params: Promise<{ username: string }> }

export default async function Page({ params }: PageProps) {
  const { username } = await params

  const profile = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  })
  if (!profile) notFound()

  const viewer = await getCurrentUser()

  const followers = await prisma.follow.findMany({
    where: { followingId: profile.id },
    include: {
      follower: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const viewerFollowingIds = viewer
    ? new Set(
        (
          await prisma.follow.findMany({
            where: { followerId: viewer.id },
            select: { followingId: true },
          })
        ).map((x) => x.followingId)
      )
    : new Set<number>()

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Followers
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            People following{" "}
            <span className="font-semibold text-gray-900">
              @{profile.username}
            </span>
            .
          </p>
        </div>

        <Link
          href={`/u/${profile.username}`}
          className="rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
        >
          Back to profile
        </Link>
      </div>

      {followers.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-gray-600 shadow-sm">
          No followers yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {followers.map((f) => (
            <div
              key={f.follower.id}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <UserCard
                user={f.follower}
                canFollow={!!viewer && viewer.id !== f.follower.id}
                initiallyFollowing={viewerFollowingIds.has(f.follower.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}