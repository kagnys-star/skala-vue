<script setup>
import { useConfigStore } from '@/stores/configStore'

// 이 컴포넌트는 props를 하나도 받지 않는다.
// 부모가 무엇을 내려주든 상관없이 스토어에서 직접 현재 단위를 읽고 직접 바꾼다.
const configStore = useConfigStore()

/**
 * 분절형(세그먼트) 컨트롤이라 두 칸 중 아무거나 눌릴 수 있다.
 * 이미 선택된 쪽을 누르면 아무 일도 일어나지 않아야 하므로, 다를 때만 토글한다.
 */
const selectUnit = (unit) => {
  if (configStore.unit !== unit) {
    configStore.toggleUnit()
  }
}
</script>

<template>
  <!-- role=group + aria-label: 화면 낭독기가 두 버튼을 한 덩어리로 읽게 한다 -->
  <div
    class="unit-toggler"
    role="group"
    aria-label="온도 단위 선택"
  >
    <button
      class="unit-option"
      :class="{ 'is-active': configStore.unit === 'celsius' }"
      :aria-pressed="configStore.unit === 'celsius'"
      @click="selectUnit('celsius')"
    >
      °C
    </button>
    <button
      class="unit-option"
      :class="{ 'is-active': configStore.unit === 'fahrenheit' }"
      :aria-pressed="configStore.unit === 'fahrenheit'"
      @click="selectUnit('fahrenheit')"
    >
      °F
    </button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  gap: 2px;
  padding: 4px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.unit-option {
  min-width: 46px;
  padding: 6px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--text-soft);
  cursor: pointer;
  transition: all var(--ease);
}

.unit-option:hover:not(.is-active) {
  background-color: var(--accent-soft);
  color: var(--accent);
}

.unit-option.is-active {
  background-color: var(--accent);
  color: #ffffff;
}
</style>
