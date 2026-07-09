import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  return {
    isAuthenticated: !!session?.user,
    reason: 'ok' as const
  }
})
