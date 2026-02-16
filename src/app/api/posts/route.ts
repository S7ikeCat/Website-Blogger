import { getCurrentUser } from "@/shared/lib/getCurrentUser";
import { prisma } from "@/shared/lib/prisma";


type CreatePostBody = {
    title: string
    description: string
    img_post?: string | null
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
        category_id: Number.isFinite(categoryId) ? categoryId : null,
        
        authorId: user.id,

      },
      include: { category: true, author: true },
    })
  
    return Response.json(post)
  }