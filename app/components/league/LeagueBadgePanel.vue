<template>
  <div class="flex min-h-24 flex-col items-center justify-center gap-2 py-2">
    <p v-if="isPending" class="flex items-center gap-2 text-sm text-muted">
      <u-icon name="i-lucide-loader-circle" class="size-5 animate-spin" />
      Looking up the season badge…
    </p>

    <u-alert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load the season badge"
      :actions="errorActions"
    />

    <template v-else-if="showBadge">
      <img
        :src="badge?.strBadge"
        :alt="badgeAlt"
        class="h-28 w-auto object-contain"
        @error="handleImageError"
      />

      <p class="text-sm font-medium">{{ badge?.strSeason }}</p>
    </template>

    <template v-else>
      <p class="text-sm text-muted">No badge for this League</p>

      <p v-if="imageFailed" class="text-xs text-dimmed">
        The image could not load.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSeasonBadgeQuery } from '@/services/queries/useLeagueQueries';

import type { ButtonProps } from '@nuxt/ui';

const props = defineProps<{
  idLeague: string;
  leagueName: string;
}>();

const {
  data: badge,
  error,
  isPending,
  refetch
} = useSeasonBadgeQuery(toRef(props, 'idLeague'));

const errorActions: ButtonProps[] = [
  { label: 'Retry', icon: 'i-lucide-rotate-cw', onClick: retry }
];

function retry() {
  refetch();
}

// * A failed image falls back to "no badge" with a note; no retry and no toast (feature 001)
const imageFailed = ref(false);

const showBadge = computed(() => Boolean(badge.value) && !imageFailed.value);

const badgeAlt = computed(
  () => `${props.leagueName} badge, ${badge.value?.strSeason}`
);

function handleImageError() {
  imageFailed.value = true;
}
</script>
