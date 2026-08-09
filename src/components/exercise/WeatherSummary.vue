<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'

const configStore = useConfigStore()

// 북마크 개수는 전역 값이므로 부모를 거치지 않고 스토어에서 직접 읽는다.
// 반면 cityList는 화면마다 달라질 수 있는 값이라 계속 props로 받는다.
const bookmarkStore = useBookmarkStore()

const props = defineProps({
  // 요약할 날씨 목록 (부모 소유). 요약 값 계산은 이 컴포넌트가 직접 한다.
  cityList: {
    type: Array,
    default: () => [],
  },
})

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

const coolestCity = computed(() => [...props.cityList].sort((a, b) => a.temp - b.temp)[0])

const hottestTemp = computed(() => configStore.convertTemp(hottestCity.value?.temp ?? 0))

const coolestTemp = computed(() => configStore.convertTemp(coolestCity.value?.temp ?? 0))
</script>

<template>
  <section class="summary-panel">
    <div class="summary-tile">
      <p class="tile-label">
        평균 기온
      </p>
      <p class="tile-value tabular">
        {{ averageTemp }}{{ configStore.unitSymbol }}
      </p>
      <p class="tile-sub">
        {{ cityList.length }}개 도시
      </p>
    </div>

    <div class="summary-tile">
      <p class="tile-label">
        🔥 가장 더운 곳
      </p>
      <p class="tile-value tabular is-hot">
        {{ hottestTemp }}{{ configStore.unitSymbol }}
      </p>
      <p class="tile-sub">
        {{ hottestCity?.name ?? '-' }}
      </p>
    </div>

    <div class="summary-tile">
      <p class="tile-label">
        ❄ 가장 선선한 곳
      </p>
      <p class="tile-value tabular is-cool">
        {{ coolestTemp }}{{ configStore.unitSymbol }}
      </p>
      <p class="tile-sub">
        {{ coolestCity?.name ?? '-' }}
      </p>
    </div>

    <div class="summary-tile">
      <p class="tile-label">
        ⭐ 북마크
      </p>
      <p class="tile-value tabular">
        {{ bookmarkStore.bookmarkCount }}
      </p>
      <p class="tile-sub">
        저장한 도시
      </p>
    </div>
  </section>
</template>

<style scoped>
/* auto-fit + minmax: 화면이 좁아지면 칸 수가 알아서 줄어든다. 미디어 쿼리가 필요 없다. */
.summary-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.summary-tile {
  padding: 14px 16px;
  background-color: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(12px);
}

.tile-label {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.tile-value {
  margin: 2px 0 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.tile-value.is-hot {
  color: var(--hot);
}

.tile-value.is-cool {
  color: var(--cool);
}

.tile-sub {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-soft);
}
</style>
