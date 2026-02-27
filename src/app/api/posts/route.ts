import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import { prisma } from "@/shared/lib/prisma";


type CreatePostBody = {
    title: string
    description: string
    img_post?: string | null
    imgPostKey?: string | null
    category_id?: number | string | null
}

export async function POST(req: Request) {
    const user = await getCurrentUser()
    if (!user) {
        return Response.json({error: "Unauthorized"}, {status: 401})
    }

    const body = (await req.json()) as Partial<CreatePostBody>

    const title = body.title?.trim()
    const description = body.description?.trim()
  
    if (!title || !description) {
      return Response.json({ error: "Title and description required" }, { status: 400 })
    }
  
    const categoryId =
      body.category_id === null || body.category_id === undefined || body.category_id === ""
        ? null
        : Number(body.category_id)
  
    const post = await prisma.post.create({
      data: {
        title,
        description,
        img_post: body.img_post ?? null,
        imgPostKey: body.imgPostKey ?? null,
        category_id: Number.isFinite(categoryId) ? categoryId : null,
        
        authorId: user.id,

      },
      include: { category: true, author: {select: {id: true, username: true}} },

      
    })
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id }, // кто подписан на автора
      select: { followerId: true },
    })
    
    if (followers.length) {
      await prisma.notification.createMany({
        data: followers.map((f) => ({
          userId: f.followerId,
          type: "NEW_POST",
          text: `@${user.username} published a new post: ${post.title}`,
          href: `/posts/${post.post_id}`,
        })),
      })
    }
  
    return Response.json({ok: true,
      post: {
        post_id: post.post_id,
      },
      username: post.author.username,})
  }