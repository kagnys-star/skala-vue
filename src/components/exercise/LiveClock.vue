<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineProps({
  label: {
    type: String,
    default: '현재 시각',
  },
})

// 현재 시각을 담는 반응형 상태. 이 값만 바꾸면 아래 computed들이 알아서 다시 계산된다.
const now = ref(new Date())

// timerId는 화면에 그릴 값이 아니므로 ref로 만들 필요가 없다. (불필요한 반응형 오버헤드 방지)
let timerId = null

// onMounted: 컴포넌트가 실제 DOM에 붙은 뒤 실행된다. 타이머 시작 지점.
onMounted(() => {
  console.log('[LiveClock] onMounted - 1초 타이머를 시작합니다.')
  timerId = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

// onUnmounted: 컴포넌트가 화면에서 제거되기 직전 실행된다.
// 이 정리를 빼먹으면 컴포넌트가 사라져도 setInterval이 계속 돌아 메모리 누수가 된다.
onUnmounted(() => {
  clearInterval(timerId)
  console.log('[LiveClock] onUnmounted - 타이머를 정리했습니다.')
})

const dateText = computed(() =>
  now.value.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }),
)

const timeText = computed(() => now.value.toLocaleTimeString('ko-KR', { hour12: true }))
</script>

<template>
  <div class="live-clock">
    <div class="clock-label">
      <span class="live-dot" />
      {{ label }}
    </div>

    <div class="clock-body">
      <p class="clock-time">
        {{ timeText }}
      </p>
      <p class="clock-date">
        {{ dateText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.live-clock {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #16233a 0%, #2b3f5f 100%);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  color: #ffffff;
}

.clock-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--fs-sm);
  color: rgba(255, 255, 255, 0.65);
  /* 좁은 화면에서 라벨이 두 줄로 접히면 시계 높이가 불필요하게 커진다 */
  white-space: nowrap;
}

/* 실시간 갱신 중임을 나타내는 깜빡이는 점 */
.live-dot {
  width: 7px;
  height: 7px;
  background-color: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

.clock-body {
  text-align: right;
}

.clock-time {
  margin: 0;
  font-family: 'Menlo', 'Consolas', monospace;
  font-size: var(--fs-lg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  /* 시각이 두 줄로 접히면 시계 높이가 두 배가 된다 */
  white-space: nowrap;
}

/* 좁은 화면에서는 라벨과 시각이 한 줄에 다 들어가지 못한다.
   시각 글자를 한 단계 줄여 줄바꿈 없이 나란히 놓이게 한다. */
@media (max-width: 480px) {
  .clock-time {
    font-size: var(--fs-base);
  }
}

.clock-date {
  margin: 2px 0 0;
  font-size: var(--fs-xs);
  color: rgba(255, 255, 255, 0.55);
}
</style>
