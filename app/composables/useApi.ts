/**
 * API calls are proxied through this Nuxt app (/api/** → Python backend).
 * Same-origin requests keep auth cookies on the frontend domain.
 */
export function useApiBase(): string {
  return useRuntimeConfig().public.apiBase
}

export function useApiFetch<T>(
  path: string,
  opts: Parameters<typeof $fetch<T>>[1] = {}
) {
  return $fetch<T>(path, {
    credentials: 'include',
    ...opts
  })
}
