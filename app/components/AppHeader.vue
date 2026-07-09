<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { data: authData, signOut } = useAuth()

const items = computed(() => [{
  label: 'Create',
  to: '/create'
}, {
  label: 'Pricing',
  to: '/pricing'
}])

const dropdownMenuItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
    slot: 'dashboard' as const
  }, {
    label: 'Logout',
    onSelect: async () => {
      await signOut({ callbackUrl: '/' })
    },
    icon: 'i-lucide-log-out'
  }
] satisfies DropdownMenuItem[]
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-bold tracking-tight"
      >
        <span class="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">RS</span>
        <span class="hidden text-lg sm:inline">Ranking Shorts</span>
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UButton
        label="Create"
        icon="i-lucide-sparkles"
        to="/create"
        class="hidden lg:inline-flex"
      />

      <UColorModeButton />

      <UButton
        v-if="!authData"
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        to="/login"
        class="lg:hidden"
      />

      <UButton
        v-if="!authData"
        label="Sign in"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />
      <UDropdownMenu
        v-else
        :items="dropdownMenuItems"
        class="hidden lg:inline-flex"
        :ui="{ content: 'w-48' }"
      >
        <UButton
          :label="authData.user?.name ?? authData.user?.email ?? undefined"
          color="neutral"
          variant="outline"
          icon="i-lucide-user"
        />
      </UDropdownMenu>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        v-if="!authData"
        label="Sign in"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
      <UButton
        v-else
        label="Dashboard"
        color="primary"
        variant="solid"
        to="/dashboard"
        block
        class="mb-3"
      />
      <UButton
        icon="i-lucide-log-out"
        label="Logout"
        color="error"
        variant="subtle"
        block
        @click="signOut({ callbackUrl: '/' })"
      />
    </template>
  </UHeader>
</template>
