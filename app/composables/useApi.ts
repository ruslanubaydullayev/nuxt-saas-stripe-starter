/**
 * All API calls go to the Python backend (NUXT_PUBLIC_API_BASE).
 * Uses credentials so the session-token cookie is sent cross-origin.
 */
export function useApiBase(): string {
  return useRuntimeConfig().public.apiBase
}

export function apiUrl(path: string): string {
  const base = useApiBase().replace(/\/$/, '')
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function useApiFetch<T>(
  path: string,
  opts: Parameters<typeof $fetch<T>>[1] = {}
) {
  return $fetch<T>(apiUrl(path), {
    credentials: 'include',
    ...opts
  })
}
