<template>
  <u-app>
    <u-main>
      <nuxt-page />
    </u-main>
  </u-app>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
    // * Dark only (annexes/design-system.md); the colour-mode module is off
    class: 'dark'
  },
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  title: 'Sporty leagues'
});
</script>
