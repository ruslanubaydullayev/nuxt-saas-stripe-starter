import { defineCollection, z } from '@nuxt/content'

const createBaseSchema = () => z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty()
})

export const collections = {
  pricing: defineCollection({
    source: '2.pricing.yml',
    type: 'page',
    schema: z.object({
      subscriptions: z.object({
        frequencies: z.array(
          z.object({
            label: z.string().nonempty(),
            value: z.string().nonempty(),
            cycle: z.string().nonempty()
          })
        ),
        currency: z.string().nonempty()
      }),
      plans: z.array(
        z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          price: z.object({
            monthly: z.number().nonnegative(),
            yearly: z.number().nonnegative()
          }),
          stripeIds: z.object({
            monthly: z.string().nullable(),
            yearly: z.string().nullable()
          }).nullable(),
          scale: z.boolean().optional(),
          billing_period: z.string().nonempty(),
          billing_cycle: z.string().nonempty(),
          features: z.array(z.string().nonempty()),
          highlight: z.boolean().optional()
        })
      ),
      faq: createBaseSchema().extend({
        items: z.array(
          z.object({
            label: z.string().nonempty(),
            content: z.string().nonempty()
          })
        )
      })
    })
  })
}
