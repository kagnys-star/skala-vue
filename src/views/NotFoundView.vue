<script setup>
// Catch-all 라우트('/:pathMatch(.*)*')가 잡아낸 경로에서 렌더링되는 화면.
import { useRoute, RouterLink } from 'vue-router'

// 어떤 주소로 들어왔는지 그대로 보여주면 오타인지 미구현인지 사용자가 바로 판단할 수 있다.
const route = useRoute()
</script>

<template>
  <section class="not-found-view">
    <p class="not-found-icon">
      🌞❓
    </p>
    <h2 class="not-found-title">
      페이지를 찾을 수 없습니다.
    </h2>

    <p class="not-found-desc">
      요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.<br>
      <code class="not-found-path">{{ route.fullPath }}</code>
    </p>

    <RouterLink
      class="home-link"
      :to="{ name: 'weather-home' }"
    >
      날씨 메인으로 이동
    </RouterLink>
  </section>
</template>

<style scoped>
.not-found-view {
  padding: 64px 20px;
  background-color: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  text-align: center;
  backdrop-filter: blur(12px);
}

.not-found-icon {
  margin: 0 0 14px;
  font-size: 52px;
  line-height: 1;
}

.not-found-title {
  margin: 0 0 10px;
  font-size: var(--fs-lg);
  font-weight: 700;
}

.not-found-desc {
  margin: 0 0 24px;
  font-size: var(--fs-md);
  line-height: 1.9;
  color: var(--text-muted);
}

.not-found-path {
  display: inline-block;
  margin-top: 6px;
  padding: 3px 9px;
  background-color: var(--surface-sunken);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: var(--fs-sm);
  color: var(--text-soft);
}

.home-link {
  display: inline-block;
  padding: 12px 26px;
  background-color: var(--accent);
  border-radius: var(--radius);
  font-size: var(--fs-md);
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  transition: all var(--ease);
}

.home-link:hover {
  background-color: var(--accent-hover);
  box-shadow: var(--shadow);
}
</style>
