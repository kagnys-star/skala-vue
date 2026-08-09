<script setup>
// App은 이제 '껍데기' 역할만 한다.
// 화면마다 달라지는 내용은 전부 RouterView가 채우므로 여기에는 상태나 로직이 없다.
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <h1 class="app-title">🌤️ 과제 4: 라우터 적용</h1>

    <!-- Navigation Bar -->
    <nav class="nav-bar">
      <!-- RouterLink는 최종적으로 <a>로 렌더링되지만, 클릭 시 페이지를 새로 받아오지 않고
           라우터가 컴포넌트만 교체한다. (SPA의 핵심) -->
      <RouterLink class="nav-item" :to="{ name: 'weather-home' }">🌤️ 날씨 대시보드</RouterLink>
      <RouterLink class="nav-item" :to="{ name: 'weather-about' }">ℹ️ 서비스 소개</RouterLink>
    </nav>

    <!-- 현재 URL에 매칭된 라우트의 컴포넌트가 이 자리에 렌더링된다 -->
    <main class="app-body">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  box-sizing: border-box;
  width: 460px;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-family: 'Malgun Gothic', sans-serif;
  color: #303133;
}

.app-title {
  margin: 0 0 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
}

.nav-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.nav-item {
  padding: 6px 12px;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  color: #606266;
  text-decoration: none;
}

.nav-item:hover {
  color: #409eff;
}

/* router-link-exact-active: 현재 경로와 '정확히' 일치할 때 라우터가 자동으로 붙여주는 클래스.
   router-link-active(부분 일치)를 쓰면 '/'가 모든 경로의 앞부분과 겹쳐서
   상세 페이지에 있을 때도 '날씨 대시보드'가 활성 상태로 보인다. */
.nav-item.router-link-exact-active {
  border-bottom-color: #409eff;
  color: #409eff;
  font-weight: bold;
}
</style>
