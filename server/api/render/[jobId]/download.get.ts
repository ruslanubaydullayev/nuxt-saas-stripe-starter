import { getRenderJob } from '../../../utils/render-jobs'

export default defineEventHandler((event) => {
  const jobId = getRouterParam(event, 'jobId')
  if (!jobId) {
    throw createError({ statusCode: 400, statusMessage: 'jobId is required' })
  }

  const job = getRenderJob(jobId)
  if (!job) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }
  if (job.status !== 'done') {
    throw createError({ statusCode: 409, statusMessage: 'Render not ready yet' })
  }

  // Stub: returns a sample vertical video until the real render pipeline is wired up.
  return {
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
})
