<script setup>
import WeatherParent from './WeatherParent.vue'
import sampleTwo from '@/sampleTwo.vue'
</script>

<template>
  <div class="app">
    <WeatherParent />
    <!-- <sampleTwo /> -->
  </div>
</template>

<style scoped>
.app {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
</style>
