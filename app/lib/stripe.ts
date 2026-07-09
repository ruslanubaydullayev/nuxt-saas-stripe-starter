import Stripe from 'stripe'

// Lazily constructed: the Stripe constructor throws when the secret key is
// missing, which would crash the server at startup in dev environments
// without credentials. This way it only fails when Stripe is actually used.
let instance: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!instance) {
      const config = useRuntimeConfig()
      instance = new Stripe(config.StripeSecretKey, {
        apiVersion: '2025-09-30.clover',
        typescript: true
      })
    }
    return Reflect.get(instance, prop)
  }
})
