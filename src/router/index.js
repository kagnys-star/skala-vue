import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'
import { findCityInCatalog } from '@/data/cityCatalog'

// 브라우저 탭에 항상 붙일 서비스 이름. 아래 beforeEach에서 각 화면 제목과 조합한다.
const APP_TITLE = '날씨 대시보드'

/**
 * 라우트 규칙 정의.
 *
 * name을 붙여둔 이유: 컴포넌트에서 router.push('/weather/' + id)처럼 문자열을 조립하면
 * 나중에 경로를 바꿀 때 호출부를 전부 찾아 고쳐야 한다.
 * router.push({ name: 'weather-detail', params: { cityId } }) 형태로 쓰면
 * 경로 문자열은 이 파일 한 곳에서만 관리된다.
 *
 * meta에는 라우터가 쓰지 않는 '우리가 정한' 부가 정보를 담을 수 있다.
 * 여기서는 브라우저 탭 제목을 담아두고 전역 가드가 꺼내 쓴다.
 */
const routes = [
  {
    path: '/',
    name: 'weather-home',
    component: WeatherHomeView,
    // 첫 화면은 진입 즉시 무조건 필요하므로 지연 로딩하지 않고 메인 번들에 포함시킨다.
    // (지연 로딩하면 오히려 '빈 화면 → 청크 다운로드 → 렌더' 순서가 되어 체감 속도가 느려진다)
    meta: { title: '' }, // 홈은 서비스 이름만 노출한다
  },
  {
    path: '/about',
    name: 'weather-about',
    // 지연 로딩(Lazy Loading): 화살표 함수로 감싸면 이 라우트에 처음 진입할 때
    // 별도 청크로 분리된 파일을 그때 내려받는다. 초기 번들 크기가 줄어든다.
    component: () => import('@/views/WeatherAboutView.vue'),
    meta: { title: '서비스 소개' },
  },
  {
    path: '/bookmarks',
    name: 'bookmark-list',
    component: () => import('@/views/BookmarkListView.vue'),
    meta: { title: '북마크 목록' },
  },
  {
    // ':cityId'가 동적 세그먼트. /weather/city_01 → route.params.cityId === 'city_01'
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),

    // 제목이 URL에 따라 달라지므로 문자열 대신 함수로 둔다. (아래 beforeEach가 호출해준다)
    meta: {
      title: (to) => {
        const city = findCityInCatalog(to.params.cityId)
        return city ? `${city.name} 상세 관측` : '상세 관측'
      },
    },

    /**
     * 라우트 단위 가드(beforeEnter).
     * 존재하지 않는 도시 ID로 들어오면 컴포넌트를 아예 만들지 않고 NotFound로 보낸다.
     * '일단 그리고 나서 없다고 알려주기'보다 '들어오기 전에 막기'가 라우터다운 처리다.
     *
     * 판단 기준은 API 응답이 아니라 도시 카탈로그다.
     * API 호출은 비동기라 가드가 실행되는 시점에는 아직 데이터가 없을 수 있고,
     * 서버가 죽었다고 해서 '/weather/city_01'이 없는 주소가 되는 것도 아니기 때문이다.
     *
     * 주소는 사용자가 입력한 그대로 남겨야 무엇이 잘못됐는지 알 수 있으므로,
     * redirect가 아니라 pathMatch를 직접 채워 NotFound 컴포넌트만 바꿔 끼운다.
     */
    beforeEnter: (to) => {
      if (findCityInCatalog(to.params.cityId) !== null) {
        return true // 통과
      }

      console.warn(`[router] 존재하지 않는 도시 ID입니다: '${to.params.cityId}'`)

      return {
        name: 'not-found',
        // '/weather/city_99' → ['weather', 'city_99'] 형태로 넘겨야 원래 주소가 그대로 복원된다
        params: { pathMatch: to.path.slice(1).split('/') },
        query: to.query,
      }
    },
  },
  {
    // Catch-all Route: 위 규칙에 하나도 걸리지 않은 모든 경로를 받아낸다.
    // (.*)* 는 '/kk' 처럼 한 단계든 '/a/b/c' 처럼 여러 단계든 전부 매칭한다는 뜻이다.
    // 반드시 배열의 '맨 마지막'에 두어야 한다. 위에서부터 순서대로 매칭되기 때문이다.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '페이지를 찾을 수 없음' },
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

/**
 * 전역 가드(beforeEach): 모든 화면 이동 직전에 한 번씩 실행된다.
 * 각 화면이 스스로 document.title을 건드리면 빠뜨리는 화면이 생기므로,
 * 제목 관리는 이렇게 한 곳에 모아두는 편이 안전하다.
 */
router.beforeEach((to) => {
  const { title } = to.meta
  // meta.title은 문자열일 수도, 상세 화면처럼 함수일 수도 있다.
  const pageTitle = typeof title === 'function' ? title(to) : title

  document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE
})

export default router
