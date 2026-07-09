import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url?: string, platform?: string }>(event)
  if (!body?.url || !body?.platform) {
    throw createError({ statusCode: 400, statusMessage: 'url and platform are required' })
  }

  // Stub: real import pipeline will live in the separate backend.
  return {
    clipId: randomUUID(),
    platform: body.platform,
    durationSeconds: null
  }
})
