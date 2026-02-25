import { formatDate } from "@/shared/lib/formatDate"
import { prisma } from "@/shared/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PostPage({params}: {params: Promise<{ post_id: string }>
}) {
    const {post_id} = await params
    const id = Number(post_id)
    if (!Number.isFinite(id)) notFound()

    const post = await prisma.post.findUnique({
        where: {post_id: id},
        include: {category: true,
            author: {select: {username: true, avatarUrl: true}}
        },
    })

    if(!post) notFound()
    
    return (
        <main>

            <div className="">
            <Image
              src={post.author.avatarUrl ?? "/default-avatar.jpg"}
              alt=""
              width={56}
              height={56}
              unoptimized
            />
                <Link className="underline" href={`/u/${post.author.username}`}>
                @{post.author.username}
                </Link>
            </div>

            <div className="text-xs font-semibold uppercase text-gray-500">
                {post.category?.name ?? "Uncategorized"}
            </div>

            <h1 className="mt-2 text-3xl font-bold">
                {post.title}
            </h1>

            {post.img_post?.trim() && (
                <div className="relative mt-6 h-80 w-full overflow-hidden border-2 border-black">
                    <Image 
                    src={post.img_post} 
                    alt={post.title} fill unoptimized className="object-cover"/>
                </div>
            )}

            <p className="mt-6 text-base leading-7 text-gray-800S">
                {post.description}
            </p>
            <div>
  <div>{formatDate(post.createdAt)}</div>

  {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
    <div>обновлено: {formatDate(post.updatedAt)}</div>
  )}
</div>
        </main>
    )
}