<template>
  <ul
    aria-label="Leagues"
    class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <li v-for="league in leagues" :key="league.idLeague">
      <LeagueCard :league="league" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import LeagueCard from '@/components/league/LeagueCard.vue';

import type { League } from '@/types/league';

defineProps<{
  leagues: League[];
}>();
</script>
