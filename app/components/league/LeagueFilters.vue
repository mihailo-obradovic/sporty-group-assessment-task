<template>
  <div
    class="grid grid-cols-1 items-center gap-2.5 md:grid-cols-[minmax(0,1fr)_14rem_auto]"
  >
    <u-input
      v-model="search"
      type="search"
      icon="i-lucide-search"
      placeholder="Search leagues"
      aria-label="Search leagues by name"
    />

    <u-select
      :model-value="selectedSport"
      :items="sportItems"
      aria-label="Filter by Sport"
      @update:model-value="handleSportSelect"
    />

    <!-- * A reserved cell: invisible while the list loads, so the bar does not shift when the number arrives -->
    <p
      role="status"
      class="font-display text-count font-bold whitespace-nowrap tabular-nums"
      :class="{ invisible: count === null }"
      :aria-hidden="count === null"
    >
      {{ count ?? 0 }}
      <span class="ms-1 font-sans text-sm font-normal text-muted">leagues</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';

const props = defineProps<{
  sports: string[];
  // * `null` while the list loads
  count: number | null;
}>();

const { filters, setQuery, setSport } = useLeagueFilters();

// * Reka's Select rejects `''` as an item value, so All needs a value of its own
const ALL_SPORTS = '__all__';

const selectedSport = computed(() => filters.value.sport ?? ALL_SPORTS);

// * A Sport from the URL that the data lacks stays listed, so the select still shows it as chosen
const sportItems = computed(() => {
  const sports =
    filters.value.sport === undefined ||
    props.sports.includes(filters.value.sport)
      ? props.sports
      : [...props.sports, filters.value.sport];

  return [
    { label: 'All Sports', value: ALL_SPORTS },
    ...sports.map((sport) => ({ label: sport, value: sport }))
  ];
});

function handleSportSelect(value: string) {
  setSport(value === ALL_SPORTS ? undefined : value);
}

const search = ref(filters.value.q);
let lastWrittenQuery = filters.value.q;

watchDebounced(
  search,
  (value) => {
    lastWrittenQuery = value;
    setQuery(value);
  },
  { debounce: 250 }
);

// * Follows URL changes this input did not make (Clear filters, Back); its own debounced writes are skipped so typing is never overwritten
watch(
  () => filters.value.q,
  (q) => {
    if (q === lastWrittenQuery) {
      return;
    }
    lastWrittenQuery = q;
    search.value = q;
  }
);
</script>
