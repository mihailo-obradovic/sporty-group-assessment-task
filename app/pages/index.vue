<template>
  <u-container class="flex flex-col gap-6 py-8">
    <h1 class="text-2xl font-semibold">Sporty leagues</h1>

    <LeagueFilters :sports="sports" />

    <ul
      v-if="isLoadingList"
      aria-busy="true"
      aria-label="Loading leagues"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <li v-for="placeholder in SKELETON_COUNT" :key="placeholder">
        <u-skeleton class="h-32 w-full" />
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
    />

    <LeagueList v-else :leagues="visibleLeagues" />
  </u-container>
</template>

<script setup lang="ts">
import LeagueFilters from '@/components/league/LeagueFilters.vue';
import LeagueList from '@/components/league/LeagueList.vue';

import { useLeaguesQuery } from '@/services/queries/useLeagueQueries';

import type { ButtonProps } from '@nuxt/ui';

const SKELETON_COUNT = 6;

const { filters, clearFilters } = useLeagueFilters();

const source = computed(() => filters.value.source);
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

const errorActions: ButtonProps[] = [
  { label: 'Retry', icon: 'i-lucide-rotate-cw', onClick: retry }
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
      actions: [{ label: 'Clear filters', onClick: handleClearFilters }]
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
