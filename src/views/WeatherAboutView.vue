<script setup>
// 정적 소개 페이지. 반응형 상태가 필요 없으므로 ref도 computed도 두지 않는다.
// 화면 이동은 <RouterLink> 하나로 끝나므로 useRouter()도 쓰지 않는다.
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="about-view">
    <h2 class="about-title">
      ℹ️ 서비스 소개
    </h2>

    <p class="about-lead">
      본 앱은 Vue 3, Vue Router, Pinia를 기반으로 제작된 실습용 가상 관측 대시보드입니다.
    </p>

    <ul class="about-list">
      <li>현재 날씨·24시간 예보·대기질 세 가지 API를 조합해 화면을 구성합니다.</li>
      <li>온도 단위(섭씨/화씨)는 Pinia 스토어가 관리하며, 모든 화면에 즉시 반영됩니다.</li>
      <li>북마크도 스토어가 관리하여 목록·상세·전용 화면 어디서나 함께 갱신됩니다.</li>
      <li>단위 설정과 북마크는 브라우저에 저장되어 새로고침 후에도 유지됩니다.</li>
      <li><code>components/exercise/</code> 폴더 내부의 독립 부품 컴포넌트를 조합해 화면을 구성합니다.</li>
      <li>클라이언트 사이드 라우팅으로 새로고침 없이 화면이 전환됩니다.</li>
      <li>도시별 상세 관측 정보는 <code>/weather/:cityId</code> 동적 경로로 연결됩니다.</li>
      <li>검색어는 <code>?q=</code> 쿼리 파라미터에 실시간 동기화되어, 주소를 그대로 공유할 수 있습니다.</li>
      <li>존재하지 않는 도시 ID는 라우트 가드가 걸러 안내 페이지로 보냅니다.</li>
      <li>정의되지 않은 주소로 접근하면 Catch-all 라우트가 안내 페이지를 대신 보여줍니다.</li>
    </ul>

    <!-- 단순 이동은 RouterLink가 정석이다.
         <a href>와 달리 페이지 전체를 다시 내려받지 않고 컴포넌트만 교체된다. -->
    <RouterLink
      class="home-link"
      :to="{ name: 'weather-home' }"
    >
      대시보드 홈으로 이동
    </RouterLink>
  </section>
</template>

<style scoped>
.about-view {
  padding: 22px;
  background-color: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.about-title {
  margin: 0 0 14px;
  font-size: var(--fs-lg);
  font-weight: 700;
}

.about-lead {
  margin: 0 0 16px;
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--text-soft);
}

.about-list {
  margin: 0 0 20px;
  padding-left: 20px;
  font-size: var(--fs-md);
  line-height: 2;
  color: var(--text-soft);
}

.about-list code {
  padding: 2px 6px;
  background-color: var(--surface-sunken);
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: var(--fs-sm);
  color: var(--accent);
}

.home-link {
  display: block;
  padding: 13px;
  background-color: var(--accent);
  border-radius: var(--radius);
  font-size: var(--fs-md);
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  text-decoration: none;
  transition: all var(--ease);
}

.home-link:hover {
  background-color: var(--accent-hover);
  box-shadow: var(--shadow);
}
</style>
