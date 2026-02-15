import { CreatePostForm } from '@/features/post/create/ui/CreatePostForm'
import React from 'react'


type Category = {
    id: number
    name: string
}

type Props = {
    categories: Category[]
}

export function AdminPage({categories}: Props) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className='mt-6'>
        <label className='block'>Category</label>
        <select className='mt-2 w-full'>
            {categories.map((cats) => (
                <option key={cats.id} value={cats.id}>
                    {cats.name}
                </option>
            ))}
        </select>
      </div>

      <section className="mt-8 border-2 border-black p-4">
        <CreatePostForm categories={categories}/>
      </section>
    </main>
  )
}

export default AdminPage