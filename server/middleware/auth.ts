import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const unprotectedPaths = [
    '/api/auth',
    '/api/_content',
    '/api/_mdc',
    '/api/clips',
    '/api/usage',
    '/api/render'
  ]

  const isProtectedRoute
    = event.path.startsWith('/api')
      && !unprotectedPaths.some(path => event.path.startsWith(path))

  if (isProtectedRoute) {
    const session = await getServerSession(event)
    if (!session) {
      throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
    }
  }
})
