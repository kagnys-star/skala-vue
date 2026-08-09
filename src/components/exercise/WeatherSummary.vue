<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

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

// 평균은 섭씨 원본으로 먼저 구하고, 표시 직전에만 단위를 변환한다.
// (도시별로 화씨 변환한 뒤 평균 내면 반올림 오차가 누적된다)
const averageTemp = computed(() => {
  if (props.cityList.length === 0) return 0
  const total = props.cityList.reduce((sum, city) => sum + city.temp, 0)
  return configStore.convertTemp(Math.round(total / props.cityList.length))
})

// 원본 배열을 직접 sort하면 부모의 반응형 데이터가 변형되므로 복사본을 정렬한다.
// 정렬 기준도 섭씨 원본이다. 단위 변환은 순서를 바꾸지 않으므로 결과는 동일하다.
const hottestCity = computed(() => [...props.cityList].sort((a, b) => b.temp - a.temp)[0])

const hottestTemp = computed(() => configStore.convertTemp(hottestCity.value?.temp ?? 0))
</script>

<template>
  <section class="summary-panel">
    <span class="summary-item">⭐ 북마크 {{ bookmarkedCount }}곳</span>
    <span class="summary-item">🌡 평균 {{ averageTemp }}{{ configStore.unitSymbol }}</span>
    <span v-if="hottestCity" class="summary-item">
      🔥 최고 {{ hottestCity.name }} {{ hottestTemp }}{{ configStore.unitSymbol }}
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
