import { prisma } from "@/shared/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function PostPage({params}: {params: Promise<{ post_id: string }>
}) {
    const {post_id} = await params
    const id = Number(post_id)
    if (!Number.isFinite(id)) notFound()

    const post = await prisma.post.findUnique({
        where: {post_id: id},
        include: {category: true},
    })

    if(!post) notFound()
    
    return (
        <main>
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
        </main>
    )
}