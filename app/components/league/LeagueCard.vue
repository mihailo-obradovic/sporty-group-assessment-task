<template>
  <u-card class="h-full">
    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold">{{ league.strLeague }}</h2>

      <u-badge :label="league.strSport" class="self-start" />

      <p v-if="league.strLeagueAlternate" class="text-sm text-muted">
        {{ league.strLeagueAlternate }}
      </p>
    </div>
  </u-card>
</template>

<script setup lang="ts">
import type { League } from '@/types/league';

defineProps<{
  league: League;
}>();
</script>
