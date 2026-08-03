<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './components/exercise/BaseDashboardCard.vue'
import SearchBar from './components/exercise/SearchBar.vue'
import WeatherCard from './components/exercise/WeatherCard.vue'
import LiveClock from './components/exercise/LiveClock.vue'
import WeatherSummary from './components/exercise/WeatherSummary.vue'

// 1) 모든 반응형 데이터는 WeatherParent가 소유한다 (2일차와 동일) --------
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 55, wind: 2.5 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 80, wind: 1.8 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 65, wind: 3.2 },
  { id: 'city_04', name: '인천', temp: 25, status: '흐림', humidity: 70, wind: 4.1 },
  { id: 'city_05', name: '대구', temp: 31, status: '맑음', humidity: 45, wind: 1.2 },
  { id: 'city_06', name: '대전', temp: 27, status: '구름', humidity: 60, wind: 2.0 },
  { id: 'city_07', name: '광주', temp: 29, status: '맑음', humidity: 58, wind: 1.6 },
  { id: 'city_08', name: '울산', temp: 26, status: '비', humidity: 75, wind: 2.8 },
  { id: 'city_09', name: '제주', temp: 23, status: '흐림', humidity: 85, wind: 5.3 },
  { id: 'city_10', name: '강릉', temp: 22, status: '맑음', humidity: 62, wind: 3.5 },
])

const searchQuery = ref('')
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

// 이벤트 핸들러 (자식 컴포넌트가 emit한 이벤트를 받아 상태를 바꾼다) -------
const selectCard = (city) => {
  selectedCityInfo.value = city
}

// SearchBar의 update-query 이벤트 처리: 상태 변경은 데이터를 소유한 부모가 수행한다.
const onQueryUpdate = (value) => {
  searchQuery.value = value
  console.log(`[emits] SearchBar -> update-query 수신: '${value}'`)
}

// WeatherCard의 click-detail 이벤트 처리
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
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
  <div class="weather-app">
    <h2 class="app-title">🌤️ 과제 3: 날씨 (컴포넌트)</h2>

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
      <SearchBar
        :query="searchQuery"
        :city-list="weatherList"
        @update-query="onQueryUpdate"
      />
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
          @click-detail="showDetail"
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
.weather-app {
  width: 420px;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-family: 'Malgun Gothic', sans-serif;
  color: #303133;
}

.app-title {
  margin: 0 0 16px;
  font-size: 18px;
}

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
