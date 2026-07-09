import { Resend } from 'resend'

// Lazily constructed: `new Resend()` throws when the API key is missing,
// which would crash the whole server at startup in dev environments
// without credentials. This way it only fails when an email is actually sent.
let instance: Resend | null = null

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    if (!instance) {
      const config = useRuntimeConfig()
      instance = new Resend(config.ResendApiKey)
    }
    return Reflect.get(instance, prop)
  }
})
