let chain = Promise.resolve()

export async function withUploadThingToken<T>(token: string, fn: () => Promise<T>) {
  // ставим задачу в очередь, чтобы env не перетирался параллельно
  const run = async () => {
    const prev = process.env.UPLOADTHING_TOKEN
    process.env.UPLOADTHING_TOKEN = token
    try {
      return await fn()
    } finally {
      process.env.UPLOADTHING_TOKEN = prev
    }
  }

  // очередь
  const next = chain.then(run, run)
  chain = next.then(() => undefined, () => undefined)
  return next
}