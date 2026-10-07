<template>
  <div class="flex flex-col gap-3 md:flex-row">
    <u-input
      v-model="search"
      type="search"
      icon="i-lucide-search"
      placeholder="Search leagues"
      aria-label="Search leagues by name"
      class="md:flex-1"
    />

    <u-select
      :model-value="selectedSport"
      :items="sportItems"
      aria-label="Filter by Sport"
      class="md:w-64"
      @update:model-value="handleSportSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';

const props = defineProps<{
  sports: string[];
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
