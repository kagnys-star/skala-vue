<script setup>
// App은 '껍데기' 역할만 한다.
// 화면마다 달라지는 내용은 전부 RouterView가 채우므로 여기에는 상태나 로직이 없다.
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '@/components/exercise/UnitToggler.vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useWeatherStore } from '@/stores/weatherStore'

// 내비게이션 바에 북마크 개수를 띄우기 위해 스토어를 읽는다.
// 어느 화면에서 북마크를 눌러도 이 숫자가 즉시 따라 바뀐다.
const bookmarkStore = useBookmarkStore()

// 배경 하늘색을 낮/밤에 맞춰 바꾸기 위해 읽는다.
const weatherStore = useWeatherStore()
</script>

<template>
  <!-- is-night가 붙으면 main.css의 하늘색 변수만 어두운 값으로 덮인다 -->
  <div
    class="app-shell"
    :class="{ 'is-night': weatherStore.isNight }"
  >
    <header class="app-header">
      <div class="brand">
        <span class="brand-mark">🌤️</span>
        <div>
          <h1 class="brand-title">
            실시간 날씨 대시보드
          </h1>
          <p class="brand-sub">
            전국 10개 도시의 현재 날씨 · 예보 · 대기질
          </p>
        </div>
      </div>

      <!-- 어느 화면에 있든 항상 보여야 하므로 RouterView 바깥, App에 둔다.
           단위 값 자체는 스토어에 있으므로 App은 props를 넘겨줄 필요가 없다. -->
      <UnitToggler />
    </header>

    <!-- Navigation Bar -->
    <nav class="nav-bar">
      <!-- RouterLink는 최종적으로 <a>로 렌더링되지만, 클릭 시 페이지를 새로 받아오지 않고
           라우터가 컴포넌트만 교체한다. (SPA의 핵심) -->
      <RouterLink
        class="nav-item"
        :to="{ name: 'weather-home' }"
      >
        🌤️ 대시보드
      </RouterLink>
      <RouterLink
        class="nav-item"
        :to="{ name: 'bookmark-list' }"
      >
        ⭐ 북마크
        <span
          v-if="bookmarkStore.bookmarkCount > 0"
          class="nav-badge tabular"
        >
          {{ bookmarkStore.bookmarkCount }}
        </span>
      </RouterLink>
      <RouterLink
        class="nav-item"
        :to="{ name: 'air-quality' }"
      >
        🌫️ 대기질
      </RouterLink>
      <RouterLink
        class="nav-item"
        :to="{ name: 'movie-list' }"
      >
        🎬 영화
      </RouterLink>
      <RouterLink
        class="nav-item"
        :to="{ name: 'stock-list' }"
      >
        📈 주식
      </RouterLink>
      <RouterLink
        class="nav-item"
        :to="{ name: 'weather-about' }"
      >
        ℹ️ 소개
      </RouterLink>
    </nav>

    <!-- 현재 URL에 매칭된 라우트의 컴포넌트가 이 자리에 렌더링된다 -->
    <main class="app-body">
      <RouterView />
    </main>

    <footer class="app-footer">
      데이터 제공 · OpenWeatherMap
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100vh;
  padding: 28px 20px 40px;
  /* 위에서 아래로 옅어지는 하늘. 스크롤해도 그라데이션이 끊기지 않도록 fixed로 둔다. */
  background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bottom) 55%) fixed;
  transition: background var(--ease);
}

/* 화면이 아무리 넓어도 본문은 한 줄 길이가 읽기 좋은 폭을 넘지 않게 한다 */
.app-header,
.nav-bar,
.app-body,
.app-footer {
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
}

.app-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}

.brand-mark {
  font-size: 30px;
  line-height: 1;
}

.brand-title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-sub {
  margin: 2px 0 0;
  font-size: var(--fs-md);
  color: var(--text-soft);
}

/* 밤 배경에서는 헤더 글자가 배경 위에 바로 놓이므로 밝은 색으로 뒤집는다 */
.is-night .brand-title {
  color: #ffffff;
}

.is-night .brand-sub {
  color: rgba(255, 255, 255, 0.7);
}

/* 알약 모양 탭. 카드처럼 떠 있게 만들어 배경과 분리한다. */
.nav-bar {
  display: flex;
  gap: 4px;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  /* 배경 위에 반투명하게 얹히도록 흐림 효과를 준다 */
  backdrop-filter: blur(8px);
}

.nav-item {
  display: flex;
  flex: 1;
  gap: 5px;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--text-soft);
  text-decoration: none;
  white-space: nowrap;
  transition: all var(--ease);
}

.nav-item:hover {
  background-color: var(--accent-soft);
  color: var(--accent);
}

/* router-link-exact-active: 현재 경로와 '정확히' 일치할 때 라우터가 자동으로 붙여주는 클래스.
   router-link-active(부분 일치)를 쓰면 '/'가 모든 경로의 앞부분과 겹쳐서
   상세 페이지에 있을 때도 '대시보드'가 활성 상태로 보인다. */
.nav-item.router-link-exact-active {
  background-color: var(--accent);
  color: #ffffff;
  box-shadow: var(--shadow-sm);
}

.nav-badge {
  min-width: 17px;
  padding: 0 5px;
  background-color: var(--warm);
  border-radius: 9px;
  font-size: var(--fs-xs);
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.nav-item.router-link-exact-active .nav-badge {
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--accent);
}

.app-footer {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  text-align: center;
}

.is-night .app-footer {
  color: rgba(255, 255, 255, 0.5);
}

/* 좁은 화면에서는 탭 글자가 겹치므로 여백과 크기를 줄인다 */
@media (max-width: 540px) {
  .app-shell {
    padding: 18px 12px 28px;
  }

  .nav-item {
    padding: 8px 4px;
    font-size: var(--fs-sm);
  }
}
</style>
