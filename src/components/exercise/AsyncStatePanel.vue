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
    default: '날씨 정보를 불러오는 중입니다...',
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
      ⚠️ 날씨 정보를 가져오지 못했습니다
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
  padding: 24px 16px;
  border-radius: 6px;
  text-align: center;
}

.state-loading {
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
}

.state-error {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.state-title {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: bold;
  color: #f56c6c;
}

.state-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #909399;
}

.state-error .state-text {
  color: #f56c6c;
}

/* 테두리 한 변만 색을 넣고 회전시켜 만드는 로딩 스피너 */
.spinner {
  display: inline-block;
  width: 22px;
  height: 22px;
  margin-bottom: 10px;
  border: 2px solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background-color: #ffffff;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  font-size: 12px;
  color: #f56c6c;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #f56c6c;
  color: #ffffff;
}
</style>
