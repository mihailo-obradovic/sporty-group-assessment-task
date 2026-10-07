<template>
  <div
    role="group"
    aria-label="Data source"
    class="inline-flex gap-0.5 rounded-full p-0.5 ring ring-accented"
  >
    <u-button
      v-for="option in OPTIONS"
      :key="option.source"
      :aria-pressed="filters.source === option.source"
      color="neutral"
      :variant="filters.source === option.source ? 'soft' : 'ghost'"
      size="lg"
      class="rounded-full"
      @click="() => handleSelect(option.source)"
    >
      <span
        v-if="option.source === 'live'"
        aria-hidden="true"
        class="size-2 rounded-full bg-success"
      />
      {{ option.label }}
    </u-button>
  </div>
</template>

<script setup lang="ts">
import type { LeagueSource } from '@/types/league';

const OPTIONS: { source: LeagueSource; label: string }[] = [
  { source: 'live', label: 'Live' },
  { source: 'fixture', label: 'Sample' }
];

const { filters, setSource } = useLeagueFilters();

function handleSelect(source: LeagueSource) {
  if (source === filters.value.source) {
    return;
  }
  setSource(source);
}
</script>
