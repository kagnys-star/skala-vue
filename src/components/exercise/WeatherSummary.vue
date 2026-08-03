<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 원본 날씨 목록 (부모 소유). 요약 값 계산은 이 컴포넌트가 직접 한다.
  cityList: {
    type: Array,
    default: () => [],
  },
  // 북마크한 도시 id 목록 (부모 소유)
  bookmarkedIds: {
    type: Array,
    default: () => [],
  },
})

const bookmarkedCount = computed(() => props.bookmarkedIds.length)

const averageTemp = computed(() => {
  if (props.cityList.length === 0) return 0
  const total = props.cityList.reduce((sum, city) => sum + city.temp, 0)
  return Math.round(total / props.cityList.length)
})

// 원본 배열을 직접 sort하면 부모의 반응형 데이터가 변형되므로 복사본을 정렬한다.
const hottestCity = computed(() => [...props.cityList].sort((a, b) => b.temp - a.temp)[0])
</script>

<template>
  <section class="summary-panel">
    <span class="summary-item">⭐ 북마크 {{ bookmarkedCount }}곳</span>
    <span class="summary-item">🌡 평균 {{ averageTemp }}°C</span>
    <span v-if="hottestCity" class="summary-item">
      🔥 최고 {{ hottestCity.name }} {{ hottestCity.temp }}°C
    </span>
  </section>
</template>

<style scoped>
.summary-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 10px 12px;
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.summary-item {
  font-size: 12px;
  color: #606266;
}
</style>
