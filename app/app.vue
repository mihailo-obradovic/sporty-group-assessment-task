<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  title: 'Sporty leagues'
});
</script>

<template>
  <u-app>
    <u-main>
      <nuxt-page />
    </u-main>
  </u-app>
</template>
