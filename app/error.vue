<template>
  <u-app>
    <u-main>
      <u-container class="flex flex-col items-start gap-4 py-8">
        <h1 class="text-2xl font-semibold">{{ heading }}</h1>

        <p class="text-muted">{{ description }}</p>

        <u-button label="Back to the start" @click="handleBack" />
      </u-container>
    </u-main>
  </u-app>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError<{ heading?: string; description?: string }>;
}>();

// ! Never render `statusMessage` — Nuxt writes the requested path into it, so it reflects attacker-supplied text onto the page
const heading = computed(
  () => props.error.data?.heading ?? 'Something went wrong'
);
const description = computed(
  () => props.error.data?.description ?? 'Please try again.'
);

function handleBack() {
  clearError({ redirect: '/' });
}
</script>
