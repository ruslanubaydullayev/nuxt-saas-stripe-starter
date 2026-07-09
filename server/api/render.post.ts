import { createRenderJob } from '../utils/render-jobs'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title?: string
    items?: Array<{ clipId: string, label: string, order: number }>
  }>(event)

  if (!body?.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }
  if (!body.items?.length || body.items.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'At least 2 clips are required' })
  }

  const job = createRenderJob(body.title.trim())
  return { jobId: job.id }
})
