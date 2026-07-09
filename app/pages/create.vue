<script setup lang="ts">
import { useBuilderStore } from '~/stores/builder.store'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Create a ranking video',
  robots: 'noindex, nofollow'
})

const store = useBuilderStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { status: authStatus, getSession } = useAuth()
const isLoggedIn = computed(() => authStatus.value === 'authenticated')

const { data: usage, refresh: refreshUsage } = await useAsyncData(
  'usage-status',
  () => useApiFetch<{ isAuthenticated: boolean, reason: string }>('/api/usage/status')
)

onMounted(async () => {
  if (route.query.signInCallback) {
    await getSession()
    await refreshUsage()
    router.replace({ query: {} })
    toast.add({
      title: 'Welcome!',
      color: 'primary',
      description: 'You have successfully signed in.'
    })
  }
})

const phase = ref<'idle' | 'processing' | 'done' | 'failed'>('idle')
const renderError = ref<string | null>(null)
let poll: ReturnType<typeof setInterval> | null = null

function stopPolling() {
  if (poll) {
    clearInterval(poll)
    poll = null
  }
}

async function generate() {
  if (!store.canGenerate) return

  const payload = {
    title: store.title.trim(),
    items: store.readyItems.map((i, idx) => ({
      clipId: i.clipId as string,
      label: i.label.trim(),
      order: idx
    }))
  }

  store.setStep(4)
  phase.value = 'processing'
  renderError.value = null

  try {
    const { jobId } = await useApiFetch<{ jobId: string }>('/api/render', {
      method: 'POST',
      body: payload
    })
    store.jobId = jobId
    startPolling(jobId)
  } catch (err) {
    const e = err as { statusCode?: number, statusMessage?: string }
    phase.value = 'failed'
    renderError.value = e.statusMessage ?? 'Couldn’t start the render.'
    store.setStep(3)
    phase.value = 'idle'
    toast.add({ title: renderError.value, color: 'error' })
  }
}

function startPolling(jobId: string) {
  stopPolling()
  poll = setInterval(async () => {
    try {
      const s = await useApiFetch<{ status: string, error: string | null }>(
        `/api/render/${jobId}/status`
      )
      if (s.status === 'done') {
        stopPolling()
        const { url } = await useApiFetch<{ url: string }>(
          `/api/render/${jobId}/download`
        )
        store.resultUrl = url
        phase.value = 'done'
      } else if (s.status === 'failed') {
        stopPolling()
        phase.value = 'failed'
        renderError.value = s.error ?? 'Render failed. You can try again.'
      }
    } catch {
      // transient — keep polling
    }
  }, 2500)
}

function createAnother() {
  stopPolling()
  store.reset()
  phase.value = 'idle'
}

onBeforeUnmount(stopPolling)
</script>

<template>
  <UContainer class="max-w-2xl py-10">
    <h1 class="mb-6 text-2xl font-bold text-highlighted">
      Create a ranking video
    </h1>

    <UAlert
      v-if="!usage?.isAuthenticated"
      color="primary"
      variant="subtle"
      class="mb-6"
      title="Free to use"
      description="No sign-up needed. Sign in to save your work to your account."
    />

    <CreateCreateStepper
      :step="store.step"
      :total="store.totalSteps"
    />

    <Transition
      name="fade-slide"
      mode="out-in"
    >
      <div
        v-if="store.step === 1"
        key="1"
      >
        <CreateClipListBuilder />
        <div class="mt-6 flex justify-end">
          <UButton
            label="Next: title"
            :disabled="!store.canProceedFromList"
            @click="store.setStep(2)"
          />
        </div>
        <p
          v-if="!store.canProceedFromList"
          class="mt-2 text-right text-xs text-muted"
        >
          Add at least 2 clips with labels to continue.
        </p>
      </div>

      <div
        v-else-if="store.step === 2"
        key="2"
      >
        <UCard>
          <UFormField
            label="Overall video title"
            hint="Shown at the top of your video for the whole duration."
          >
            <UInput
              v-model="store.title"
              maxlength="40"
              placeholder="Ranking The Funniest School Moments"
              class="w-full"
            />
          </UFormField>
          <p class="mt-1 text-right text-xs text-muted">
            {{ store.title.length }}/40
          </p>
        </UCard>
        <div class="mt-6 flex justify-between">
          <UButton
            label="Back"
            color="neutral"
            variant="outline"
            @click="store.setStep(1)"
          />
          <UButton
            label="Next: review"
            :disabled="!store.title.trim()"
            @click="store.setStep(3)"
          />
        </div>
      </div>

      <div
        v-else-if="store.step === 3"
        key="3"
      >
        <div class="grid gap-6 sm:grid-cols-2">
          <UCard>
            <h3 class="font-semibold text-highlighted">
              {{ store.title }}
            </h3>
            <ol class="mt-4 space-y-2">
              <li
                v-for="(item, i) in store.readyItems"
                :key="item.uid"
                class="flex items-center gap-3 text-sm"
              >
                <span
                  class="flex size-7 items-center justify-center rounded-lg border-2 border-primary font-black"
                >{{ i + 1 }}</span>
                <span class="truncate">{{ item.label }}</span>
              </li>
            </ol>
          </UCard>
          <CreateClipPreview
            :title="store.title"
            :items="store.readyItems"
          />
        </div>

        <p class="mt-4 text-center text-xs text-muted">
          By generating, you confirm you own or have the rights to use these clips.
        </p>
        <div class="mt-4 flex justify-between">
          <UButton
            label="Back"
            color="neutral"
            variant="outline"
            @click="store.setStep(2)"
          />
          <UButton
            label="Generate video"
            icon="i-lucide-sparkles"
            :disabled="!store.canGenerate"
            @click="generate"
          />
        </div>
      </div>

      <div
        v-else
        key="4"
      >
        <UCard
          v-if="phase === 'processing'"
          class="text-center"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="mx-auto size-10 animate-spin text-primary"
          />
          <p class="mt-4 font-semibold text-highlighted">
            Rendering your video…
          </p>
          <p class="mt-1 text-sm text-muted">
            This usually takes ~30 seconds. Hang tight.
          </p>
        </UCard>

        <UCard
          v-else-if="phase === 'done'"
          class="text-center"
        >
          <p class="text-lg font-semibold text-highlighted">
            Your ranking short is ready 🎉
          </p>
          <video
            v-if="store.resultUrl"
            :src="store.resultUrl"
            controls
            playsinline
            class="mx-auto mt-4 aspect-[9/16] max-h-[70vh] rounded-xl bg-black"
          />
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <UButton
              v-if="store.resultUrl"
              label="Download .mp4"
              icon="i-lucide-download"
              :href="store.resultUrl"
              target="_blank"
              download="ranking-short.mp4"
              tag="a"
            />
            <UButton
              label="Create another"
              color="neutral"
              variant="outline"
              @click="createAnother"
            />
          </div>

          <UAlert
            v-if="!isLoggedIn"
            color="neutral"
            variant="subtle"
            class="mt-6 text-left"
            title="Want to keep this video and make more?"
            description="Sign in — your video comes with you."
          >
            <template #actions>
              <UButton
                label="Sign in"
                to="/login?callbackUrl=/create"
                size="xs"
              />
            </template>
          </UAlert>
        </UCard>

        <UCard
          v-else
          class="text-center"
        >
          <p class="text-lg font-semibold text-error">
            Render failed
          </p>
          <p class="mt-2 text-sm text-muted">
            {{ renderError }}
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <UButton
              label="Try again"
              @click="store.setStep(3)"
            />
            <UButton
              label="Start over"
              color="neutral"
              variant="outline"
              @click="createAnother"
            />
          </div>
        </UCard>
      </div>
    </Transition>
  </UContainer>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
