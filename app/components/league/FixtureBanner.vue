<template>
  <u-alert
    color="warning"
    variant="subtle"
    icon="i-lucide-flask-conical"
    title="Sample data"
    description="TheSportsDB's free tier lists only 10 Soccer leagues, so this list is a sample of 19 real leagues across 5 Sports. Season badges still come from the live API."
    :actions="actions"
  />
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const { setSource } = useLeagueFilters();

// * Sets `source=live` explicitly, so it works where the configured default is `fixture`; a link, not a red action, per the mockup
const actions: ButtonProps[] = [
  {
    label: 'Show the live list',
    color: 'neutral',
    variant: 'link',
    // * Alert actions default to xs (24px); md keeps the link a comfortable touch target
    size: 'md',
    trailingIcon: 'i-lucide-arrow-right',
    onClick: showLiveList
  }
];

function showLiveList() {
  setSource('live');
}
</script>
