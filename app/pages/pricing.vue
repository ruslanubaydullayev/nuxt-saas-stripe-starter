<script setup lang="ts">
const { status: authStatus } = useAuth()
const isLoggedIn = computed(() => authStatus.value === 'authenticated')
const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const selectedFrequency = ref<'monthly' | 'yearly'>('monthly')
const items = page.value?.subscriptions.frequencies.map(freq => ({
  label: freq.label,
  value: freq.value
}))
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
    >
      <template #links>
        <UTabs
          v-model="selectedFrequency"
          :items="items"
          color="neutral"
          size="xs"
          class="w-48"
          :ui="{
            list: 'ring ring-accented rounded-full',
            indicator: 'rounded-full',
            trigger: 'w-1/2'
          }"
        />
      </template>
    </UPageHero>

    <UContainer>
      <UPricingPlans scale>
        <UPricingPlan
          v-for="(plan, index) in page.plans"
          :key="index"
          :title="plan.title"
          :scale="plan.scale"
          :description="plan.description"
          :billing-cycle="page.subscriptions.frequencies.find(f => f.value === selectedFrequency)?.cycle"
          :billing-period="plan.billing_period"
          :features="plan.features"
          :price="formatCurrency(plan.price[selectedFrequency], page.subscriptions.currency)"
          :highlight="plan.highlight"
        >
          <template #button>
            <UButton
              v-if="plan.price[selectedFrequency] === 0"
              label="Start creating"
              to="/create"
              color="primary"
              block
              :variant="plan.highlight ? 'solid' : 'outline'"
            />
            <UButton
              v-else-if="!isLoggedIn"
              label="Sign in"
              to="/login"
              color="primary"
              block
              :variant="plan.highlight ? 'solid' : 'outline'"
            />
            <UButton
              v-else
              label="Coming soon"
              color="neutral"
              variant="outline"
              block
              disabled
            />
          </template>
        </UPricingPlan>
      </UPricingPlans>
    </UContainer>

    <UPageSection
      :title="page.faq.title"
      :description="page.faq.description"
    >
      <UAccordion
        :items="page.faq.items"
        :unmount-on-hide="false"
        :default-value="['0']"
        type="multiple"
        class="max-w-3xl mx-auto"
        :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted'
        }"
      />
    </UPageSection>
  </div>
</template>
