import { randomUUID } from 'node:crypto'

export type RenderJobStatus = 'processing' | 'done' | 'failed'

export interface RenderJob {
  id: string
  status: RenderJobStatus
  error: string | null
  createdAt: number
  readyAt: number | null
  title: string
}

const jobs = new Map<string, RenderJob>()

/** Dev stub: simulates a ~5s render pipeline until the real backend exists. */
export function createRenderJob(title: string): RenderJob {
  const id = randomUUID()
  const job: RenderJob = {
    id,
    status: 'processing',
    error: null,
    createdAt: Date.now(),
    readyAt: null,
    title
  }
  jobs.set(id, job)

  setTimeout(() => {
    const current = jobs.get(id)
    if (current?.status === 'processing') {
      current.status = 'done'
      current.readyAt = Date.now()
    }
  }, 5000)

  return job
}

export function getRenderJob(id: string): RenderJob | undefined {
  return jobs.get(id)
}
