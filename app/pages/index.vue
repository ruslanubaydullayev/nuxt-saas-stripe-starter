<script setup lang="ts">
const config = useRuntimeConfig()
const price = config.public.planPriceUsd

useSeoMeta({
  title: 'Ranking Shorts — Turn Clips into Ranked Videos',
  description:
    'Rank your favorite TikTok & Instagram clips into a share-ready 9:16 short with numbered badges and captions — no editing skills needed.',
  ogTitle: 'Ranking Shorts — Turn Clips into Ranked Videos',
  ogDescription:
    'Drop in clips, rank them, and generate a polished vertical ranking video in seconds.'
})

const faqs = [
  {
    q: 'How do I make a ranking video?',
    a: 'Add your clips (paste a link or upload a file), give each one a label, set the order, add an overall title, and hit Generate. We render a vertical 9:16 MP4 with numbered badges and captions.'
  },
  {
    q: 'Do I need video editing skills?',
    a: 'No. Ranking Shorts handles trimming, formatting, badges, and captions automatically. You just choose the clips and the order.'
  },
  {
    q: 'What does it cost?',
    a: `You can make one video per day for free. Pro is $${price}/month for unlimited renders.`
  },
  {
    q: 'Where do the clips come from?',
    a: 'You can upload your own videos or import from TikTok, Instagram or YouTube links. You are responsible for making sure you have the rights to any content you use.'
  }
]

const steps = [
  {
    n: '1',
    title: 'Add your clips',
    body: 'Paste a link or upload straight from your device.',
    icon: 'i-lucide-link'
  },
  {
    n: '2',
    title: 'Rank & label',
    body: 'Drag to reorder and give each clip a name.',
    icon: 'i-lucide-list-ordered'
  },
  {
    n: '3',
    title: 'Generate',
    body: 'We render a vertical MP4 with numbered badges in ~30s.',
    icon: 'i-lucide-sparkles'
  }
]

const slides = [
  '/screen 1.png',
  '/screen 2.png',
  '/screen 3.png',
  '/screen 4.png'
].map(s => encodeURI(s))
const marquee = [...slides, ...slides]
</script>

<template>
  <div>
    <UPageHero
      description="Drop in TikTok & Instagram clips, rank them, and export a polished 9:16 short with numbered badges and captions — no editing skills required."
      :links="[
        { label: 'Start creating — free', to: '/create', icon: 'i-lucide-arrow-right', trailing: true, size: 'xl' },
        { label: 'See pricing', to: '/pricing', color: 'neutral', variant: 'subtle', size: 'xl' }
      ]"
    >
      <template #title>
        Turn your clips into
        <span class="text-primary">ranked videos</span>
      </template>
      <template #top>
        <HeroBackground />
      </template>

      <div class="carousel-mask relative overflow-hidden">
        <div class="marquee-track flex w-[800%] sm:w-[400%]">
          <div
            v-for="(src, i) in marquee"
            :key="i"
            class="w-[12.5%] shrink-0 px-2"
          >
            <div class="aspect-[9/16] overflow-hidden rounded-[1.5rem] border-4 border-default bg-black shadow-2xl">
              <img
                :src="src"
                alt="Ranking Shorts app screenshot"
                loading="lazy"
                class="size-full object-cover"
              >
            </div>
          </div>
        </div>
      </div>
    </UPageHero>

    <UPageSection
      title="How it works"
      description="Three steps from clips to a share-ready ranking short."
    >
      <UPageGrid>
        <UPageCard
          v-for="s in steps"
          :key="s.n"
          :title="s.title"
          :description="s.body"
          :icon="s.icon"
        />
      </UPageGrid>
    </UPageSection>

    <UPageCTA
      title="Make your first ranking short"
      description="Free to start. Just clips, ranked and ready to post."
      :links="[
        { label: 'Start creating', to: '/create', trailingIcon: 'i-lucide-arrow-right' }
      ]"
      variant="naked"
    >
      <LazyStarsBg />
    </UPageCTA>

    <UPageSection
      title="Frequently asked questions"
      description="Everything you need to know before your first render."
    >
      <UAccordion
        :items="faqs.map(f => ({ label: f.q, content: f.a }))"
        class="max-w-3xl mx-auto"
      />
    </UPageSection>
  </div>
</template>

<style scoped>
.marquee-track {
  animation: marquee 22s linear infinite;
  will-change: transform;
}
.carousel-mask:hover .marquee-track {
  animation-play-state: paused;
}
.carousel-mask {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
