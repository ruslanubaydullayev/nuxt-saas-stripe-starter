export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface SessionData {
  user: AuthUser | null
  expires?: string | null
}

/**
 * Session auth via the Python backend at /api/auth/session.
 * Replaces Sidebase nuxt-auth.
 */
export function useAuth() {
  const data = useState<SessionData | null>('auth-session', () => null)

  const status = computed(() => {
    if (data.value === null) return 'loading' as const
    return data.value.user ? 'authenticated' as const : 'unauthenticated' as const
  })

  async function getSession() {
    try {
      data.value = await useApiFetch<SessionData>('/api/auth/session')
    } catch {
      data.value = { user: null }
    }
    return data.value
  }

  function signIn(_provider = 'google', _opts?: { callbackUrl?: string }) {
    // OAuth redirect — callback URL is configured on the backend (FRONTEND_URL).
    window.location.href = apiUrl('/api/auth/signin/google')
  }

  async function signOut(opts?: { callbackUrl?: string }) {
    try {
      await useApiFetch('/api/auth/signout', { method: 'POST' })
    } catch {
      // still clear local state if the network call fails
    }
    data.value = { user: null }
    await navigateTo(opts?.callbackUrl || '/')
  }

  return { data, status, getSession, signIn, signOut }
}
