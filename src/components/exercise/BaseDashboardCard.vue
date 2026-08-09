<script setup>
defineProps({
  // header 슬롯을 쓰지 않을 때만 사용되는 기본 제목
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <!-- 검색박스와 리스트박스가 공통으로 쓰는 카드 껍데기 -->
  <section class="dashboard-card">
    <div class="card-header">
      <!-- 이름 있는 슬롯(named slot).
           부모가 #header를 채우지 않으면 아래 fallback 내용이 대신 렌더링된다. -->
      <slot name="header">
        <h3 class="card-title">
          {{ title }}
        </h3>
      </slot>
    </div>

    <!-- 이름 없는 기본 슬롯(default slot) -->
    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  margin-bottom: 14px;
  padding: 12px;
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* 주의: 이 스타일은 fallback 내용(위 h3)에만 적용된다.
   부모가 #header로 넘긴 마크업은 부모 스코프에서 컴파일되므로 여기 스타일이 닿지 않는다. */
.card-title {
  margin: 0;
  font-size: 14px;
  color: #409eff;
}
</style>
