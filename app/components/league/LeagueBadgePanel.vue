<template>
  <div class="flex min-h-28 items-center gap-4 border-t border-accented pt-3">
    <div
      class="grid size-22 shrink-0 place-items-center rounded-[10px] bg-default ring"
      :class="plateClass"
    >
      <img
        v-if="showBadge"
        :src="badge?.strBadge"
        :alt="badgeAlt"
        class="size-16 object-contain"
        @error="handleImageError"
      />

      <u-icon
        v-else
        name="i-lucide-shield"
        aria-hidden="true"
        class="size-12 text-muted"
      />
    </div>

    <div class="grid min-w-0 gap-0.5">
      <template v-if="isPending">
        <p class="font-display text-season font-bold">Looking up seasons</p>

        <p class="text-sm text-muted">One request per League, then cached</p>
      </template>

      <template v-else-if="error">
        <p class="font-display text-xl font-bold">
          Could not load the season badge
        </p>

        <p class="text-sm text-muted">The request failed or was rate limited</p>

        <u-button
          label="Retry"
          icon="i-lucide-rotate-cw"
          size="xl"
          class="mt-1.5 min-h-11 justify-self-start"
          @click="retry"
        />
      </template>

      <template v-else-if="showBadge">
        <p class="font-display text-season font-bold tabular-nums">
          {{ badge?.strSeason }}
        </p>

        <p class="text-sm text-muted">Most recent season with a badge</p>
      </template>

      <template v-else>
        <p class="font-display text-season font-bold">
          No badge for this League
        </p>

        <p class="text-sm text-muted">
          {{ noBadgeNote }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeasonBadgeQuery } from '@/services/queries/useLeagueQueries';

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

function retry() {
  refetch();
}

// * A failed image falls back to "no badge" with a note; no retry and no toast (feature 001)
const imageFailed = ref(false);

const showBadge = computed(() => Boolean(badge.value) && !imageFailed.value);

function handleImageError() {
  imageFailed.value = true;
}

const noBadgeNote = computed(() =>
  imageFailed.value
    ? 'The image could not load.'
    : 'TheSportsDB has no season image'
);

const badgeAlt = computed(
  () => `${props.leagueName} badge, ${badge.value?.strSeason}`
);

// * The plate: pulsing while it loads, dashed when there is nothing to show, red-ringed on error (the mockup's states)
const plateClass = computed(() => {
  if (isPending.value) {
    return 'ring-accented motion-safe:animate-pulse';
  }
  if (error.value) {
    return 'ring-primary/50';
  }
  if (showBadge.value) {
    return 'ring-accented';
  }
  return 'ring-0 border border-dashed border-accented';
});
</script>
