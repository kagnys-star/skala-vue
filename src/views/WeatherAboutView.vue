<script setup>
// 정적 소개 페이지. 반응형 상태가 필요 없으므로 ref도 computed도 두지 않는다.
// 화면 이동은 <RouterLink> 하나로 끝나므로 useRouter()도 쓰지 않는다.
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="about-view">
    <h2 class="about-title">ℹ️ 서비스 소개</h2>

    <p class="about-lead">
      본 앱은 Vue 3와 Vue Router 5를 기반으로 제작된 실습용 가상 관측 대시보드입니다.
    </p>

    <ul class="about-list">
      <li><code>components/exercise/</code> 폴더 내부의 독립 부품 컴포넌트를 조합해 화면을 구성합니다.</li>
      <li>클라이언트 사이드 라우팅으로 새로고침 없이 화면이 전환됩니다.</li>
      <li>도시별 상세 관측 정보는 <code>/weather/:cityId</code> 동적 경로로 연결됩니다.</li>
      <li>검색어는 <code>?q=</code> 쿼리 파라미터에 실시간 동기화되어, 주소를 그대로 공유할 수 있습니다.</li>
      <li>존재하지 않는 도시 ID는 라우트 가드가 걸러 안내 페이지로 보냅니다.</li>
      <li>정의되지 않은 주소로 접근하면 Catch-all 라우트가 안내 페이지를 대신 보여줍니다.</li>
    </ul>

    <!-- 단순 이동은 RouterLink가 정석이다.
         <a href>와 달리 페이지 전체를 다시 내려받지 않고 컴포넌트만 교체된다. -->
    <RouterLink class="home-link" :to="{ name: 'weather-home' }"> 대시보드 홈으로 이동 </RouterLink>
  </section>
</template>

<style scoped>
.about-view {
  padding: 12px;
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.about-title {
  margin: 0 0 12px;
  font-size: 14px;
  color: #409eff;
}

.about-lead {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
}

.about-list {
  margin: 0 0 14px;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.9;
  color: #606266;
}

.about-list code {
  padding: 1px 4px;
  background-color: #fdf6ec;
  border-radius: 3px;
  color: #e6a23c;
}

.home-link {
  display: block;
  padding: 9px;
  background-color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  color: #ffffff;
  text-align: center;
  text-decoration: none;
}

.home-link:hover {
  background-color: #66b1ff;
}
</style>
