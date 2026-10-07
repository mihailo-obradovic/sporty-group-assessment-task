<template>
  <div class="flex flex-col">
    <header class="border-b border-accented">
      <u-container class="flex items-center justify-between gap-3 py-3.5">
        <h1
          class="flex items-center gap-2.5 font-display text-wordmark font-extrabold italic"
        >
          <span aria-hidden="true" class="slant-bar" />
          Sporty Leagues
        </h1>

        <LeagueSourceToggle />
      </u-container>
    </header>

    <!-- ! The fixture list is never shown without this banner (feature 001, KNOWN_FAKES.md) -->
    <u-container v-if="isFixture" class="pt-4">
      <FixtureBanner />
    </u-container>

    <!-- * Sticks to the top of main, the page's only scrolling region (page-layout.md) -->
    <div
      class="sticky top-0 z-20 border-b border-accented bg-default/90 backdrop-blur"
    >
      <u-container class="py-3.5">
        <LeagueFilters :sports="sports" :count="count" />
      </u-container>
    </div>

    <u-container class="py-5">
      <ul
        v-if="isLoadingList"
        aria-busy="true"
        aria-label="Loading leagues"
        class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
      >
        <li v-for="placeholder in SKELETON_COUNT" :key="placeholder">
          <!-- * The card's surface and size, so the grid does not jump when the Leagues arrive -->
          <div
            class="flex min-h-27 flex-col gap-3 rounded-xl bg-elevated/50 py-4 ps-5.5 pe-4.5 ring ring-accented"
          >
            <u-skeleton class="h-6 w-[70%]" />

            <u-skeleton class="h-3.5 w-full" />

            <u-skeleton class="h-3.5 w-[45%]" />
          </div>
        </li>
      </ul>

      <u-alert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Could not load the leagues"
        description="TheSportsDB did not answer as expected. Try again in a moment."
        :actions="errorActions"
      />

      <u-empty
        v-else-if="emptyState"
        icon="i-lucide-trophy"
        :title="emptyState.title"
        :description="emptyState.description"
        :actions="emptyState.actions"
      >
        <template #title>
          <span class="font-display text-empty font-bold italic">
            {{ emptyState.title }}
          </span>
        </template>
      </u-empty>

      <LeagueList v-else :leagues="visibleLeagues" />
    </u-container>
  </div>
</template>

<script setup lang="ts">
import LeagueSourceToggle from '@/components/league/LeagueSourceToggle.vue';
import FixtureBanner from '@/components/league/FixtureBanner.vue';
import LeagueFilters from '@/components/league/LeagueFilters.vue';
import LeagueList from '@/components/league/LeagueList.vue';

import { useLeaguesQuery } from '@/services/queries/useLeagueQueries';

import type { ButtonProps } from '@nuxt/ui';

const SKELETON_COUNT = 6;

const { filters, clearFilters } = useLeagueFilters();

const source = computed(() => filters.value.source);
const isFixture = computed(() => source.value === 'fixture');
const {
  data: leagues,
  error,
  isPending,
  isPlaceholderData,
  refetch
} = useLeaguesQuery(source);

// * While a source switch loads, the previous source's list is placeholder data; it is not shown under the new source
const isLoadingList = computed(
  () => isPending.value || isPlaceholderData.value
);

const sports = computed(() => listSports(leagues.value ?? []));

const visibleLeagues = computed(() =>
  filterLeagues(leagues.value ?? [], filters.value)
);

const count = computed(() =>
  isLoadingList.value || error.value ? null : visibleLeagues.value.length
);

const errorActions: ButtonProps[] = [
  // * 44px touch target (annexes/design-system.md, Sizing)
  {
    label: 'Retry',
    icon: 'i-lucide-rotate-cw',
    size: 'xl',
    class: 'min-h-11',
    onClick: retry
  }
];

const emptyState = computed(() => {
  if ((leagues.value ?? []).length === 0) {
    return {
      title: 'No leagues available',
      description: 'TheSportsDB returned no leagues for this source.',
      actions: []
    };
  }
  if (visibleLeagues.value.length === 0) {
    return {
      title: 'No leagues match these filters',
      description: 'Try another name or Sport.',
      actions: [
        {
          label: 'Clear filters',
          size: 'xl' as const,
          class: 'min-h-11',
          onClick: handleClearFilters
        }
      ]
    };
  }
  return null;
});

function retry() {
  refetch();
}

function handleClearFilters() {
  clearFilters();
}
</script>
