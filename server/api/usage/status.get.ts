import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  return {
    isAuthenticated: !!session?.user,
    isSubscribed: !!session?.user?.stripeCustomerId,
    reason: 'ok' as const,
    resetAt: null
  }
})
