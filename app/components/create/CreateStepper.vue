<script setup lang="ts">
const props = defineProps<{ step: number, total: number }>()

const labels = ['Clips', 'Title', 'Review', 'Result']
const pct = computed(() => ((props.step - 1) / (props.total - 1)) * 100)
</script>

<template>
  <div class="mb-8">
    <div class="mb-2 flex items-center justify-between text-sm">
      <span class="font-semibold text-highlighted">Step {{ step }} of {{ total }}</span>
      <span class="text-muted">{{ labels[step - 1] }}</span>
    </div>
    <UProgress
      :model-value="pct"
      color="primary"
      size="sm"
    />
    <div class="mt-4 flex justify-between">
      <div
        v-for="(label, i) in labels"
        :key="label"
        class="flex flex-col items-center gap-1"
      >
        <span
          class="flex size-7 items-center justify-center rounded-full text-xs font-bold transition"
          :class="step >= i + 1 ? 'bg-primary text-white' : 'bg-elevated text-muted'"
        >{{ i + 1 }}</span>
        <span
          class="hidden text-xs sm:block"
          :class="step >= i + 1 ? 'text-highlighted' : 'text-muted'"
        >{{ label }}</span>
      </div>
    </div>
  </div>
</template>
