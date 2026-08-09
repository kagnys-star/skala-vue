<script setup>
defineProps({
  // 불러오는 중인지 여부
  isLoading: {
    type: Boolean,
    default: false,
  },
  // 실패 사유. 빈 문자열이면 오류가 없다는 뜻이다.
  errorMessage: {
    type: String,
    default: '',
  },
  // 로딩 중에 보여줄 문구. 화면마다 다르게 쓸 수 있도록 열어둔다.
  loadingText: {
    type: String,
    default: '정보를 불러오는 중입니다...',
  },
  // 오류 제목. 이 컴포넌트는 날씨 외에 영화·주식 화면에서도 쓰이므로 문구를 고정하지 않는다.
  errorTitle: {
    type: String,
    default: '정보를 가져오지 못했습니다',
  },
})

// 재시도 버튼은 누가 눌렸는지만 알리고, 실제로 무엇을 다시 부를지는 부모가 정한다.
defineEmits(['retry'])
</script>

<template>
  <!-- 로딩과 오류는 동시에 일어나지 않으므로 v-if / v-else-if로 하나만 그린다.
       둘 다 아닐 때는 아무것도 렌더링하지 않고, 부모가 실제 내용을 보여준다. -->
  <div
    v-if="isLoading"
    class="state-panel state-loading"
  >
    <span
      class="spinner"
      aria-hidden="true"
    />
    <p class="state-text">
      {{ loadingText }}
    </p>
  </div>

  <div
    v-else-if="errorMessage"
    class="state-panel state-error"
  >
    <p class="state-title">
      ⚠️ {{ errorTitle }}
    </p>
    <p class="state-text">
      {{ errorMessage }}
    </p>
    <button
      class="retry-btn"
      @click="$emit('retry')"
    >
      다시 시도
    </button>
  </div>
</template>

<style scoped>
.state-panel {
  padding: 34px 20px;
  border-radius: var(--radius);
  text-align: center;
}

.state-loading {
  background-color: var(--surface-sunken);
  border: 1px solid var(--border);
}

.state-error {
  background-color: #fdf2f2;
  border: 1px solid #f8dcdc;
}

.state-title {
  margin: 0 0 6px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--hot);
}

.state-text {
  margin: 0;
  font-size: var(--fs-md);
  line-height: 1.7;
  color: var(--text-muted);
}

.state-error .state-text {
  color: var(--hot);
}

/* 테두리 한 변만 색을 넣고 회전시켜 만드는 로딩 스피너 */
.spinner {
  display: inline-block;
  width: 26px;
  height: 26px;
  margin-bottom: 12px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  margin-top: 14px;
  padding: 8px 20px;
  background-color: var(--surface);
  border: 1px solid var(--hot);
  border-radius: var(--radius-sm);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--hot);
  cursor: pointer;
  transition: all var(--ease);
}

.retry-btn:hover {
  background-color: var(--hot);
  color: #ffffff;
}
</style>
