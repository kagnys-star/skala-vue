# skala-vue — 실시간 날씨 대시보드

Vue 3 · Vue Router · Pinia · Axios 실습 과제.
OpenWeatherMap API에서 국내 10개 도시의 현재 날씨를 받아 보여주는 SPA입니다.

## 실행 방법

```sh
npm install
```

API 키를 준비합니다. [OpenWeatherMap](https://home.openweathermap.org/api_keys)에서 발급받은 뒤
`.env.example`을 `.env.local`로 복사해 값을 채웁니다.

```sh
cp .env.example .env.local
```

```sh
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

> 새로 발급받은 키는 활성화까지 시간이 걸립니다. 그동안은 401 응답이 오고,
> 화면에는 "API 키가 올바르지 않거나 아직 활성화되지 않았습니다" 안내가 표시됩니다.

## 폴더 구조

```
src/
├── main.js                  # 앱 진입점 (Pinia · Router 주입)
├── App.vue                  # 내비게이션 바 + 단위 토글 + RouterView
├── router/
│   └── index.js             # 라우트 정의, 지연 로딩, 가드 2종
├── views/                   # 페이지 단위 컴포넌트
│   ├── WeatherHomeView.vue      # 메인 대시보드
│   ├── WeatherDetailView.vue    # 도시별 상세 (/weather/:cityId)
│   ├── BookmarkListView.vue     # 북마크 목록 (/bookmarks)
│   ├── WeatherAboutView.vue     # 서비스 소개 (/about)
│   └── NotFoundView.vue         # Catch-all
├── components/exercise/     # 재사용 부품 컴포넌트
│   ├── BaseDashboardCard.vue    # slot 기반 카드 껍데기
│   ├── SearchBar.vue            # 한글 유사도 검색 + 추천 목록
│   ├── WeatherCard.vue          # 도시 카드 (props / emits)
│   ├── WeatherSummary.vue       # 평균·최고 기온 요약
│   ├── UnitToggler.vue          # 섭씨 / 화씨 전환
│   ├── AsyncStatePanel.vue      # 공용 로딩 · 오류 표시
│   └── LiveClock.vue            # 생명주기 훅 예시
├── stores/                  # Pinia (Setup Store 방식)
│   ├── weatherStore.js          # 관측 데이터 + 로딩 / 오류 상태
│   ├── configStore.js           # 온도 단위 설정
│   └── bookmarkStore.js         # 북마크 id 목록
├── api/
│   └── weatherApi.js        # axios 인스턴스, 응답 변환, 오류 해석
├── data/
│   └── cityCatalog.js       # 대상 도시 목록 (정적 설정)
└── utils/
    ├── hangulSearch.js      # 초성 · 유사도 기반 한글 검색
    └── storage.js           # localStorage 읽기 / 쓰기
```

## 주요 구현

**라우팅** — 첫 화면을 제외한 모든 라우트를 지연 로딩합니다. `beforeEnter` 가드가 존재하지
않는 도시 ID를 걸러내고, 전역 `beforeEach`가 화면별 브라우저 탭 제목을 설정합니다.
검색어는 `?q=` 쿼리에 동기화되어 주소를 그대로 공유하거나 새로고침해도 유지됩니다.

**상태 관리** — 여러 화면이 공유하는 값만 스토어에 둡니다. 온도 단위와 북마크는
localStorage에 저장되어 새로고침 후에도 유지되며, 저장된 값이 손상되어도 기본값으로 복구합니다.

**API 연동** — 컴포넌트는 axios를 직접 호출하지 않고 `api/weatherApi.js`만 거칩니다.
10개 도시를 `Promise.allSettled`로 병렬 조회하여, 일부 도시가 실패해도 나머지는 정상 표시하고
실패한 도시만 따로 안내합니다.

**단위 변환** — 원본 데이터는 항상 섭씨이며 표시 직전에만 변환합니다.
더움 / 선선함 판정은 변환된 값이 아닌 섭씨 원본을 기준으로 하므로 단위를 바꿔도 결과가 같습니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 lint → build → GitHub Pages 배포를 수행합니다.

배포 전에 저장소 **Settings → Secrets and variables → Actions**에
`VITE_OPENWEATHER_API_KEY` 시크릿을 등록해야 합니다. 등록하지 않으면 빌드는 성공하지만
배포된 화면에서 401 오류가 표시됩니다.

> 참고: 클라이언트 사이드 앱이므로 빌드 결과물에 API 키가 포함됩니다.
> 브라우저가 API를 직접 호출하는 구조라 피할 수 없으며, 키를 감추려면 별도의 백엔드가 필요합니다.

History 모드 라우터를 쓰기 때문에 `/skala-vue/about` 같은 주소로 직접 접근하면
GitHub Pages가 404를 반환합니다. 이를 막기 위해 빌드 시 `index.html`을 `404.html`로
복사하도록 `vite.config.js`에 플러그인을 두었습니다.
