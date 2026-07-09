import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.data)
  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'file is required' })
  }

  const clipId = randomUUID()
  const dir = join(process.cwd(), '.data', 'clips')
  await mkdir(dir, { recursive: true })
  const ext = file.filename?.split('.').pop() || 'mp4'
  await writeFile(join(dir, `${clipId}.${ext}`), file.data)

  return { clipId }
})
