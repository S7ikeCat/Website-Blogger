import { prisma } from "@/shared/lib/prisma";

export async function POST(req: Request) {
    const body = await req.json()


    const post = await prisma.post.create({
        data: {
            title: body.title,
            description: body.description,
            img_post: body.img_post ?? null,
            category_id: body.category_id ? Number(body.category_id) : null,
        },
    })

    return Response.json(post)
}