<script setup lang="ts">
import type { RankingItem } from '~/stores/builder.store'

const props = defineProps<{
  title: string
  items: RankingItem[]
}>()

const current = ref(0)
const videoEl = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const PLACEHOLDER_MS = 3000
let placeholderTimer: ReturnType<typeof setTimeout> | null = null

const order = computed(() => props.items.map((_, i) => i).reverse())
const activeIndex = computed(() => order.value[current.value] ?? 0)
const active = computed(() => props.items[activeIndex.value] ?? null)
const currentRank = computed(() => activeIndex.value + 1)

function isRevealed(rank: number): boolean {
  return playing.value && rank >= currentRank.value
}

const PALETTE = [
  '#ffe14d',
  '#ff3b5c',
  '#37d5ff',
  '#6cff59',
  '#ff8a1f',
  '#b98dff',
  '#ffffff',
  '#ff4fd8',
  '#59b0ff',
  '#ffd23f'
]
const colorForRank = (rank: number) => PALETTE[(rank - 1) % PALETTE.length]

const titleWords = computed(() => props.title.split(/\s+/).filter(Boolean))

function clearTimer() {
  if (placeholderTimer) {
    clearTimeout(placeholderTimer)
    placeholderTimer = null
  }
}

function next() {
  clearTimer()
  if (current.value < props.items.length - 1) {
    current.value += 1
    startCurrent()
  } else {
    playing.value = false
    current.value = 0
  }
}

async function startCurrent() {
  await nextTick()
  const item = active.value
  if (!item) return
  if (item.previewUrl && videoEl.value) {
    try {
      videoEl.value.currentTime = 0
      await videoEl.value.play()
    } catch {
      placeholderTimer = setTimeout(next, PLACEHOLDER_MS)
    }
  } else {
    placeholderTimer = setTimeout(next, PLACEHOLDER_MS)
  }
}

function play() {
  playing.value = true
  current.value = 0
  startCurrent()
}

function stop() {
  clearTimer()
  playing.value = false
  videoEl.value?.pause()
  current.value = 0
}

onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-2xl border border-default bg-black"
    >
      <video
        v-if="active?.previewUrl"
        ref="videoEl"
        :src="active.previewUrl"
        class="size-full object-cover"
        muted
        playsinline
        @ended="next"
      />
      <div
        v-else
        class="flex size-full items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-900 text-center text-sm text-muted"
      >
        {{ active ? 'Preview on server render' : 'Press play to preview' }}
      </div>

      <div
        v-if="title"
        class="absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-x-1 bg-black px-2 py-1.5"
      >
        <span
          v-for="(word, i) in titleWords"
          :key="i"
          class="text-[12px] font-black leading-tight [text-shadow:1px_1px_2px_rgb(0_0_0)]"
          :style="{ color: PALETTE[i % PALETTE.length] }"
        >{{ word }}</span>
      </div>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-3 top-12 flex flex-col justify-center gap-4 px-2.5"
      >
        <div
          v-for="(item, idx) in items"
          :key="item.uid"
          class="flex items-baseline gap-2 truncate"
        >
          <span
            class="text-4xl font-black leading-none [-webkit-text-stroke:1px_black] [text-shadow:1px_1px_2px_rgb(0_0_0)]"
            :style="{ color: colorForRank(idx + 1) }"
          >{{ idx + 1 }}.</span>
          <span
            v-if="isRevealed(idx + 1) && item.label"
            class="truncate text-4xl font-black text-white [text-shadow:1px_1px_2px_rgb(0_0_0)]"
          >{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <UButton
        v-if="!playing"
        label="Preview"
        icon="i-lucide-play"
        @click="play"
      />
      <UButton
        v-else
        label="Stop"
        icon="i-lucide-square"
        color="neutral"
        variant="outline"
        @click="stop"
      />
      <span
        v-if="playing"
        class="text-sm text-muted"
      >Revealing #{{ currentRank }} ({{ current + 1 }} / {{ items.length }})</span>
    </div>
  </div>
</template>
