<template>
  <u-card class="relative h-full">
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold">
        <!-- * The toggle stretches over the whole card, so a click anywhere on it expands or collapses -->
        <button
          type="button"
          :aria-expanded="isExpanded"
          :aria-controls="panelId"
          class="flex w-full items-start justify-between gap-2 text-left after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
          @click="toggle"
        >
          {{ league.strLeague }}

          <u-icon
            :name="toggleIcon"
            aria-hidden="true"
            class="mt-1 size-5 shrink-0 text-muted"
          />
        </button>
      </h2>

      <u-badge :label="league.strSport" class="self-start" />

      <p v-if="league.strLeagueAlternate" class="text-sm text-muted">
        {{ league.strLeagueAlternate }}
      </p>

      <!-- ! Above the stretched toggle, so Retry and the badge take their own clicks -->
      <div :id="panelId" class="relative z-10">
        <LeagueBadgePanel
          v-if="isExpanded"
          :id-league="league.idLeague"
          :league-name="league.strLeague"
        />
      </div>
    </div>
  </u-card>
</template>

<script setup lang="ts">
import LeagueBadgePanel from '@/components/league/LeagueBadgePanel.vue';

import type { League } from '@/types/league';

const props = defineProps<{
  league: League;
}>();

const isExpanded = ref(false);

const panelId = computed(() => `league-${props.league.idLeague}-badge`);

const toggleIcon = computed(() =>
  isExpanded.value ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
);

function toggle() {
  isExpanded.value = !isExpanded.value;
}
</script>
