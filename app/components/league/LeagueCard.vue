<template>
  <u-card :data-expanded="isExpanded" class="h-full">
    <div class="flex flex-col gap-2.5">
      <div class="flex items-start justify-between gap-2.5">
        <h2 class="font-display text-league font-bold italic">
          <!-- * The toggle stretches over the whole card, so a tap anywhere on it expands or collapses -->
          <button
            type="button"
            :aria-expanded="isExpanded"
            :aria-controls="panelId"
            class="text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
            @click="toggle"
          >
            {{ league.strLeague }}
          </button>
        </h2>

        <u-badge :label="league.strSport" class="mt-0.5 shrink-0" />
      </div>

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

    <u-icon
      name="i-lucide-chevron-down"
      aria-hidden="true"
      class="absolute end-3.5 bottom-3 size-5 text-muted motion-safe:transition-transform"
      :class="{ 'rotate-180': isExpanded }"
    />
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

function toggle() {
  isExpanded.value = !isExpanded.value;
}
</script>
