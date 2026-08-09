import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

/**
 * 라우트 규칙 정의.
 *
 * name을 붙여둔 이유: 컴포넌트에서 router.push('/weather/' + id)처럼 문자열을 조립하면
 * 나중에 경로를 바꿀 때 호출부를 전부 찾아 고쳐야 한다.
 * router.push({ name: 'weather-detail', params: { cityId } }) 형태로 쓰면
 * 경로 문자열은 이 파일 한 곳에서만 관리된다.
 */
const routes = [
  {
    path: '/',
    name: 'weather-home',
    component: WeatherHomeView,
    // 첫 화면은 진입 즉시 무조건 필요하므로 지연 로딩하지 않고 메인 번들에 포함시킨다.
    // (지연 로딩하면 오히려 '빈 화면 → 청크 다운로드 → 렌더' 순서가 되어 체감 속도가 느려진다)
  },
  {
    path: '/about',
    name: 'weather-about',
    // 지연 로딩(Lazy Loading): 화살표 함수로 감싸면 이 라우트에 처음 진입할 때
    // 별도 청크로 분리된 파일을 그때 내려받는다. 초기 번들 크기가 줄어든다.
    component: () => import('@/views/WeatherAboutView.vue'),
  },
  {
    // ':cityId'가 동적 세그먼트. /weather/city_01 → route.params.cityId === 'city_01'
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),
  },
  {
    // Catch-all Route: 위 규칙에 하나도 걸리지 않은 모든 경로를 받아낸다.
    // (.*)* 는 '/kk' 처럼 한 단계든 '/a/b/c' 처럼 여러 단계든 전부 매칭한다는 뜻이다.
    // 반드시 배열의 '맨 마지막'에 두어야 한다. 위에서부터 순서대로 매칭되기 때문이다.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  // createWebHistory: 주소창에 #이 붙지 않는 History 모드.
  // 인자로 BASE_URL을 넘기는 이유는 vite.config.js의 base가 '/skala-vue/'이기 때문이다.
  // 이걸 빼면 GitHub Pages 배포 시 라우터가 경로를 '/'부터 계산해 링크가 전부 어긋난다.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  // 화면을 이동하면 스크롤을 항상 맨 위로 되돌린다.
  // (목록 아래쪽 카드를 눌러 상세로 들어갔을 때 중간부터 보이는 것을 막는다)
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
