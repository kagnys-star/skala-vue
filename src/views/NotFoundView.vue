<script setup>
// Catch-all 라우트('/:pathMatch(.*)*')가 잡아낸 경로에서 렌더링되는 화면.
import { useRoute, RouterLink } from 'vue-router'

// 어떤 주소로 들어왔는지 그대로 보여주면 오타인지 미구현인지 사용자가 바로 판단할 수 있다.
const route = useRoute()
</script>

<template>
  <section class="not-found-view">
    <p class="not-found-icon">🌞❓</p>
    <h2 class="not-found-title">페이지를 찾을 수 없습니다.</h2>

    <p class="not-found-desc">
      요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.<br />
      <code class="not-found-path">{{ route.fullPath }}</code>
    </p>

    <RouterLink class="home-link" :to="{ name: 'weather-home' }"> 날씨 메인으로 이동 </RouterLink>
  </section>
</template>

<style scoped>
.not-found-view {
  padding: 40px 16px;
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  text-align: center;
}

.not-found-icon {
  margin: 0 0 12px;
  font-size: 44px;
}

.not-found-title {
  margin: 0 0 10px;
  font-size: 16px;
}

.not-found-desc {
  margin: 0 0 20px;
  font-size: 12px;
  line-height: 1.8;
  color: #909399;
}

.not-found-path {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 6px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  color: #606266;
}

.home-link {
  display: inline-block;
  padding: 9px 20px;
  background-color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  color: #ffffff;
  text-decoration: none;
}

.home-link:hover {
  background-color: #66b1ff;
}
</style>
