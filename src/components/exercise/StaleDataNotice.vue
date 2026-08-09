<script setup>
import { computed } from 'vue'
import { formatRelativeTime } from '@/utils/weatherFormat'

const props = defineProps({
  // 화면의 값이 저장해 둔 것인지 여부
  isStale: {
    type: Boolean,
    default: false,
  },
  // 그 값을 받아온 시각 (밀리초). 아직 한 번도 못 받았다면 null.
  fetchedAt: {
    type: Number,
    default: null,
  },
})

// 다시 받아오기는 부모가 시킨다. 이 컴포넌트는 '눌렸다'는 사실만 알린다.
defineEmits(['refresh'])

// formatRelativeTime은 초 단위를 받으므로 밀리초를 나눠서 넘긴다.
const relativeText = computed(() => {
  if (!props.fetchedAt) {
    return '시각 정보 없음'
  }
  return formatRelativeTime(Math.floor(props.fetchedAt / 1000))
})

// 정확한 시각도 함께 보여준다. '3시간 전'만으로는 언제인지 가늠하기 어렵다.
const absoluteText = computed(() => {
  if (!props.fetchedAt) {
    return ''
  }
  return new Date(props.fetchedAt).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <div
    v-if="isStale"
    class="stale-notice"
  >
    <span class="stale-icon">📦</span>

    <p class="stale-text">
      최신 정보를 받지 못해 <strong>{{ relativeText }}</strong> 저장된 값을 보여주고 있습니다.
      <span class="stale-time">({{ absoluteText }} 기준)</span>
    </p>

    <button
      class="refresh-btn"
      @click="$emit('refresh')"
    >
      새로고침
    </button>
  </div>
</template>

<style scoped>
.stale-notice {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 11px 14px;
  background-color: #fdf6ea;
  border: 1px solid #f6e4c8;
  border-radius: var(--radius);
}

.stale-icon {
  font-size: var(--fs-base);
}

.stale-text {
  flex: 1;
  min-width: 200px;
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--warm);
}

.stale-time {
  color: var(--text-muted);
}

.refresh-btn {
  padding: 6px 14px;
  background-color: var(--surface);
  border: 1px solid var(--warm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--warm);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--ease);
}

.refresh-btn:hover {
  background-color: var(--warm);
  color: #ffffff;
}
</style>
