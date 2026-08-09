<script setup>
import { useConfigStore } from '@/stores/configStore'

// 이 컴포넌트는 props를 하나도 받지 않는다.
// 부모가 무엇을 내려주든 상관없이 스토어에서 직접 현재 단위를 읽고 직접 바꾼다.
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-current">
      날씨 단위: {{ configStore.unitLabel }}({{ configStore.unitSymbol }})
    </span>

    <!-- toggleUnit은 인자가 없으므로 괄호 없이 그대로 넘겨도 된다 -->
    <button class="unit-btn" @click="configStore.toggleUnit">단위 변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-current {
  font-size: 12px;
  color: #606266;
}

.unit-btn {
  padding: 4px 10px;
  background-color: #409eff;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  color: #ffffff;
  cursor: pointer;
}

.unit-btn:hover {
  background-color: #66b1ff;
}
</style>
