<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weatherMockList } from '@/data/weatherMockData'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import LiveClock from '@/components/exercise/LiveClock.vue'
import WeatherSummary from '@/components/exercise/WeatherSummary.vue'

// useRouter: 템플릿이 아닌 script에서 화면을 이동시킬 때 쓰는 라우터 인스턴스.
// (템플릿에서 링크를 거는 <RouterLink>와 달리, 이쪽은 '코드로' 이동시키는 Programmatic Navigation)
// useRoute: 지금 URL에 무엇이 담겨 있는지 읽는 쪽. 여기서는 검색어 쿼리(?q=)를 읽는 데 쓴다.
const router = useRouter()
const route = useRoute()

/**
 * 쿼리 문자열에서 검색어를 꺼낸다.
 * route.query 값은 없으면 undefined, '?q=a&q=b'처럼 중복되면 배열이 되므로
 * 문자열일 때만 받아들이고 나머지는 빈 문자열로 정규화한다.
 */
const readQueryKeyword = () => (typeof route.query.q === 'string' ? route.query.q : '')

// 1) 화면에 필요한 반응형 상태 -------------------------------------------
// 원본 목록은 데이터 모듈에서 가져오고, 이 화면은 그것을 반응형으로 감싸 쓴다.
const weatherList = ref(weatherMockList)

// 초기값을 URL에서 읽는다. 덕분에 '/?q=서울' 링크를 그대로 공유하거나
// 새로고침해도 검색 상태가 복원된다.
const searchQuery = ref(readQueryKeyword())
const selectedCityInfo = ref(null)
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const bookmarkedIds = ref([])

// 시계 표시 여부 (onUnmounted가 실제로 동작하는지 확인하는 용도)
const isClockVisible = ref(true)

const isBookmarked = (cityId) => bookmarkedIds.value.includes(cityId)

// 2) 검색 도시 (computed) ----------------------------------------------
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  if (keyword === '') {
    return weatherList.value
  }
  return weatherList.value.filter((city) => city.name.includes(keyword))
})

// 3) 반응형 변수 변화 감시 ------------------------------------------------
watch(selectedCityInfo, (newCity, oldCity) => {
  statusMessage.value = `${newCity.name}이(가) 선택되었습니다.`
  console.log(
    `[watch 감지] 상태 바 문구가 업데이트되었습니다 -> '${statusMessage.value}'`,
    oldCity ? `(이전 선택: ${oldCity.name})` : '(최초 선택)',
  )
})

watch(
  bookmarkedIds,
  (newIds, oldIds) => {
    console.log(
      `[watch deep] 북마크 목록이 변경되었습니다. 현재 ${newIds.length}곳`,
      `/ newIds === oldIds 참조 동일 여부: ${newIds === oldIds}`,
    )
  },
  { deep: true },
)

watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 데이터를 필터링합니다. (결과: ${filteredWeatherList.value.length}건)`,
  )
})

// 4) 검색어 ↔ URL 쿼리 동기화 --------------------------------------------
// 양쪽에서 서로를 바꾸므로 무한 루프가 나기 쉽다.
// 두 감시자 모두 '이미 값이 같으면 아무것도 하지 않는다'로 시작해 고리를 끊는다.

// (검색어 → URL) 타이핑할 때마다 주소창을 갱신한다.
// push가 아니라 replace를 쓰는 이유: 글자 하나마다 히스토리가 쌓이면
// 뒤로 가기를 수십 번 눌러야 이전 화면으로 돌아가게 된다.
watch(searchQuery, (keyword) => {
  if (keyword === readQueryKeyword()) {
    return
  }
  // 검색어가 비면 '?q=' 라는 지저분한 꼬리표를 남기지 않고 쿼리 자체를 지운다.
  router.replace({ query: keyword === '' ? {} : { q: keyword } })
})

// (URL → 검색어) 뒤로/앞으로 가기나 링크 직접 진입으로 주소가 바뀐 경우를 받는다.
watch(
  () => route.query.q,
  () => {
    const keyword = readQueryKeyword()
    if (keyword !== searchQuery.value) {
      searchQuery.value = keyword
    }
  },
)

// 5) 이벤트 핸들러 (자식 컴포넌트가 emit한 이벤트를 받아 상태를 바꾼다) -------
const selectCard = (city) => {
  selectedCityInfo.value = city
}

// SearchBar의 update-query 이벤트 처리: 상태 변경은 데이터를 소유한 부모가 수행한다.
const onQueryUpdate = (value) => {
  searchQuery.value = value
  console.log(`[emits] SearchBar -> update-query 수신: '${value}'`)
}

// WeatherCard의 click-detail 이벤트 처리.
// 이전에는 window.alert()로 내용을 띄웠지만, 이제는 상세 페이지로 화면을 이동시킨다.
// 경로 문자열을 직접 조립하지 않고 라우트 이름 + params로 넘겨 오타 위험을 없앤다.
const goToDetail = (cityId) => {
  router.push({ name: 'weather-detail', params: { cityId } })
}

// WeatherCard의 toggle-bookmark 이벤트 처리
const toggleBookmark = (city) => {
  const index = bookmarkedIds.value.indexOf(city.id)
  if (index === -1) {
    bookmarkedIds.value.push(city.id)
    statusMessage.value = `${city.name}을(를) 북마크에 추가했습니다. ⭐`
  } else {
    bookmarkedIds.value.splice(index, 1)
    statusMessage.value = `${city.name}을(를) 북마크에서 해제했습니다.`
  }
}
</script>

<template>
  <div class="weather-home">
    <!-- v-if로 시계를 껐다 켜면 onMounted / onUnmounted가 실제로 호출되는 것을 볼 수 있다 -->
    <div class="clock-area">
      <LiveClock v-if="isClockVisible" label="실시간 관측 시각" />
      <button class="clock-toggle" @click="isClockVisible = !isClockVisible">
        {{ isClockVisible ? '시계 끄기' : '시계 켜기' }}
      </button>
    </div>

    <!-- 원본 데이터만 넘기고, 요약 값 계산은 자식이 직접 한다 -->
    <WeatherSummary :city-list="weatherList" :bookmarked-ids="bookmarkedIds" />

    <!-- BaseDashboardCard(공통 디자인) + SearchBar(slot으로 주입) -->
    <BaseDashboardCard title="🔍 도시 검색">
      <!-- 검색어는 props로 내려주고, 변경은 update-query 이벤트로 올려받는다 -->
      <SearchBar :query="searchQuery" :city-list="weatherList" @update-query="onQueryUpdate" />
    </BaseDashboardCard>

    <!-- BaseDashboardCard(공통 디자인) + WeatherCard 목록(slot으로 주입) -->
    <!-- 위 검색 카드는 title prop(fallback)을 쓰고, 여기는 #header로 직접 채운다 -->
    <BaseDashboardCard>
      <template #header>
        <h3 class="slot-card-title">📋 지역별 날씨 현황</h3>
        <span class="count-badge">{{ filteredWeatherList.length }}곳</span>
      </template>

      <div class="card-list">
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city-item="city"
          :is-bookmarked="isBookmarked(city.id)"
          @select-card="selectCard"
          @click-detail="goToDetail"
          @toggle-bookmark="toggleBookmark"
        />
      </div>

      <p v-if="filteredWeatherList.length === 0" class="empty-result">
        '{{ searchQuery }}' 와(과) 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <p class="status-bar">{{ statusMessage }}</p>
  </div>
</template>

<style scoped>
/* #header 슬롯으로 넘긴 마크업은 '부모 스코프'에서 컴파일되므로,
   BaseDashboardCard의 .card-title 스타일이 적용되지 않는다. 여기서 직접 정의해야 한다. */
.slot-card-title {
  margin: 0;
  font-size: 14px;
  color: #409eff;
}

.count-badge {
  padding: 2px 8px;
  background-color: #ecf5ff;
  border-radius: 10px;
  font-size: 11px;
  color: #409eff;
}

.card-list {
  max-height: 340px;
  overflow-y: auto;
}

.empty-result {
  margin: 0;
  padding: 16px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 13px;
  color: #e6a23c;
  text-align: center;
}

.clock-area {
  margin-bottom: 14px;
}

.clock-toggle {
  width: 100%;
  margin-top: 6px;
  padding: 5px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 11px;
  color: #909399;
  cursor: pointer;
}

.clock-toggle:hover {
  border-color: #409eff;
  color: #409eff;
}

.status-bar {
  margin: 0;
  padding: 10px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  font-size: 13px;
  color: #67c23a;
  text-align: center;
}
</style>
