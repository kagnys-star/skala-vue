<script setup>
import SampleOne from './sampleOne.vue'
import SampleTwo from './sampleTwo.vue'
</script>

<template>
  <div class="app">
    <SampleOne />
    <SampleTwo />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
</style>
