<script setup lang="ts">
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable'
import { useBuilderStore } from '~/stores/builder.store'

const store = useBuilderStore()
const toast = useToast()
const config = useRuntimeConfig()
const maxItems = config.public.maxRankingItems
const maxMb = config.public.maxUploadMb
const maxDuration = config.public.maxClipDurationSeconds

const mode = ref<'link' | 'upload'>('link')
const modeItems = [
  { label: 'Paste link', value: 'link' },
  { label: 'Upload file', value: 'upload' }
]
const linkUrl = ref('')
const newLabel = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const busy = ref(false)

const listEl = ref<HTMLElement | null>(null)
useSortable(listEl, store.items, {
  handle: '.drag-handle',
  animation: 150,
  onUpdate: (e: { oldIndex: number, newIndex: number }) => {
    moveArrayElement(store.items, e.oldIndex, e.newIndex)
  }
})

const atLimit = computed(() => store.items.length >= maxItems)

function detectPlatform(raw: string): 'instagram' | 'tiktok' | 'youtube' | null {
  try {
    const u = new URL(raw)
    if (/(^|\.)instagram\.com$/i.test(u.hostname)) return 'instagram'
    if (/(^|\.)(tiktok\.com|vm\.tiktok\.com)$/i.test(u.hostname)) return 'tiktok'
    if (/(^|\.)(youtube\.com|youtu\.be)$/i.test(u.hostname)) return 'youtube'
    return null
  } catch {
    return null
  }
}

function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src)
      resolve(Number.isFinite(el.duration) ? el.duration : null)
    }
    el.onerror = () => resolve(null)
    el.src = URL.createObjectURL(file)
  })
}

async function addLink() {
  if (atLimit.value) {
    return toast.add({ title: `Max ${maxItems} clips`, color: 'warning' })
  }
  const url = linkUrl.value.trim()
  const platform = detectPlatform(url)
  if (!platform) {
    return toast.add({
      title: 'Invalid link',
      description: 'Enter a valid Instagram, TikTok or YouTube link.',
      color: 'error'
    })
  }

  const item = store.addItem({
    sourceType: 'link',
    label: newLabel.value.trim(),
    sourceUrl: url,
    platform,
    status: 'uploading'
  })
  linkUrl.value = ''
  newLabel.value = ''
  busy.value = true

  try {
    const res = await useApiFetch<{
      clipId: string
      platform: string
      durationSeconds: number | null
    }>('/api/clips/import', {
      method: 'POST',
      body: { url, platform }
    })
    store.updateItem(item.uid, {
      clipId: res.clipId,
      durationSeconds: res.durationSeconds,
      status: 'ready'
    })
  } catch (err) {
    const message
      = (err as { statusMessage?: string })?.statusMessage
        ?? 'Couldn’t fetch this link.'
    store.updateItem(item.uid, { status: 'error', error: message })
    toast.add({ title: message, color: 'error' })
  } finally {
    busy.value = false
  }
}

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (atLimit.value) {
    return toast.add({ title: `Max ${maxItems} clips`, color: 'warning' })
  }
  if (!file.type.startsWith('video/')) {
    return toast.add({ title: 'Please choose a video file.', color: 'error' })
  }
  if (file.size > maxMb * 1024 * 1024) {
    return toast.add({ title: `File too large (max ${maxMb}MB).`, color: 'error' })
  }
  const duration = await readDuration(file)
  if (duration && duration > maxDuration) {
    return toast.add({ title: `Clip too long (max ${maxDuration}s).`, color: 'error' })
  }

  const item = store.addItem({
    sourceType: 'upload',
    label: newLabel.value.trim() || file.name.replace(/\.[^.]+$/, ''),
    filename: file.name,
    durationSeconds: duration,
    previewUrl: URL.createObjectURL(file),
    status: 'uploading'
  })
  newLabel.value = ''
  busy.value = true

  try {
    const form = new FormData()
    form.append('file', file)
    // Upload directly to API — bypasses Vercel proxy body limits that cause 500 errors.
    const res = await $fetch<{ clipId: string }>(`${useApiBase()}/api/clips/upload`, {
      method: 'POST',
      body: form,
      credentials: 'include'
    })
    store.updateItem(item.uid, { clipId: res.clipId, status: 'ready' })
  } catch (err) {
    const e = err as { data?: { detail?: string }, statusMessage?: string }
    const message = e?.data?.detail ?? e?.statusMessage ?? 'Upload failed.'
    store.updateItem(item.uid, { status: 'error', error: message })
    toast.add({ title: message, color: 'error' })
  } finally {
    busy.value = false
  }
}

function platformIcon(item: { platform?: string | null }) {
  if (item.platform === 'tiktok') return 'i-simple-icons-tiktok'
  if (item.platform === 'instagram') return 'i-simple-icons-instagram'
  if (item.platform === 'youtube') return 'i-simple-icons-youtube'
  return 'i-lucide-clapperboard'
}
</script>

<template>
  <div>
    <UCard>
      <div class="mb-4">
        <UTabs
          v-model="mode"
          :items="modeItems"
          color="neutral"
          size="xs"
          class="w-56"
        />
      </div>

      <div class="space-y-3">
        <UFormField label="Clip label">
          <UInput
            v-model="newLabel"
            placeholder="e.g. The substitute teacher"
            maxlength="30"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="mode === 'link'"
          label="Instagram, TikTok or YouTube link"
        >
          <div class="flex gap-2">
            <UInput
              v-model="linkUrl"
              placeholder="https://www.tiktok.com/@user/video/…"
              class="flex-1"
              @keyup.enter="addLink"
            />
            <UButton
              label="Add"
              :disabled="busy || atLimit"
              @click="addLink"
            />
          </div>
        </UFormField>

        <UFormField
          v-else
          :label="`Video file (max ${maxMb}MB, ${maxDuration}s)`"
        >
          <input
            ref="fileInput"
            type="file"
            accept="video/*"
            class="hidden"
            @change="onFilePicked"
          >
          <UButton
            label="Choose a video…"
            icon="i-lucide-upload"
            color="neutral"
            variant="outline"
            block
            :disabled="busy || atLimit"
            @click="fileInput?.click()"
          />
        </UFormField>

        <UAlert
          v-if="atLimit"
          color="warning"
          variant="subtle"
          :title="`You've reached the max of ${maxItems} clips.`"
        />
      </div>
    </UCard>

    <div class="mt-6">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-semibold text-highlighted">
          Your ranking ({{ store.items.length }})
        </h3>
        <span class="text-sm text-muted">Drag to reorder</span>
      </div>

      <p
        v-if="!store.items.length"
        class="rounded-lg border border-dashed border-default px-4 py-10 text-center text-muted"
      >
        No clips yet. Add at least 2 to build a ranking.
      </p>

      <ul
        ref="listEl"
        class="space-y-2"
      >
        <li
          v-for="(item, index) in store.items"
          :key="item.uid"
          class="flex items-center gap-3 rounded-lg border border-default bg-elevated/50 p-3"
        >
          <UIcon
            name="i-lucide-grip-vertical"
            class="drag-handle size-5 shrink-0 cursor-grab text-muted active:cursor-grabbing"
          />
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary text-sm font-black"
          >{{ index + 1 }}</span>

          <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-elevated">
            <video
              v-if="item.previewUrl"
              :src="item.previewUrl"
              class="size-full object-cover"
              muted
            />
            <UIcon
              v-else
              :name="platformIcon(item)"
              class="size-5 text-muted"
            />
          </div>

          <div class="min-w-0 flex-1">
            <UInput
              :model-value="item.label"
              variant="ghost"
              placeholder="Add a label…"
              maxlength="30"
              class="w-full"
              @update:model-value="store.updateItem(item.uid, { label: $event })"
            />
            <p class="truncate px-2.5 text-xs text-muted">
              <span v-if="item.status === 'uploading'">Processing…</span>
              <span
                v-else-if="item.status === 'error'"
                class="text-error"
              >{{ item.error }}</span>
              <span v-else>{{ item.filename || item.sourceUrl }}</span>
            </p>
          </div>

          <UIcon
            v-if="item.status === 'uploading'"
            name="i-lucide-loader-circle"
            class="size-4 shrink-0 animate-spin text-muted"
          />
          <UIcon
            v-else-if="item.status === 'ready'"
            name="i-lucide-check"
            class="size-4 shrink-0 text-success"
          />

          <UButton
            icon="i-lucide-x"
            color="error"
            variant="ghost"
            size="sm"
            aria-label="Remove"
            @click="store.removeItem(item.uid)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
