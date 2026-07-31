<script setup>
import WeatherMockup from './WeatherMockup.vue'
import sampleOne from './sampleOne.vue'
</script>

<template>
  <div class="app">
    <WeatherMockup />
    <!--<sampleOne />-->
  </div>
</template>

<style scoped>
.app {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
</style>
