<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

// 1) 반응형 상태 관리 --------------------------------------------------
// 지역별 날씨 데이터 (1일차와 동일)
// 날씨 데이터에는 'bookmarked' 필드를 두지 않는다. (북마크는 별도 상태로 분리 - 아래 설명 참고)
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

// 북마크한 도시의 id만 따로 관리한다. weatherList가 통째로 교체되어도(예: API 재조회)
// 이 배열은 영향받지 않는다.
const bookmarkedIds = ref([])

const isBookmarked = (cityId) => bookmarkedIds.value.includes(cityId)

// 검색어
const searchQuery = ref('')

// 선택된 도시 (watch 감시 대상)
const selectedCityInfo = ref(null)

// 상태바 문구
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')

// 추천 드롭다운 노출 여부
const isSuggestionOpen = ref(false)

// 2) 검색 도시 (computed 활용) ----------------------------------------
// 검색어가 도시 이름에 포함된 항목만 필터링한다.
const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  // 검색어가 비었을 때는 원본 데이터를 그대로 반환
  if (keyword === '') {
    return weatherList.value
  }
  return weatherList.value.filter((city) => city.name.includes(keyword))
})

// 유사도 계산 (Vue 문법이 아닌 순수 JavaScript 함수) ------------------
// 한글 자모 테이블
const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

const HANGUL_START = 0xac00 // '가'
const HANGUL_END = 0xd7a3 // '힣'

// '대구' -> 'ㄷㅐㄱㅜ' 처럼 완성형 한글을 자모 단위로 분해한다.
const decomposeHangul = (text) => {
  let result = ''

  for (const char of text) {
    const code = char.charCodeAt(0)

    // 완성형 한글이 아니면(자음 단독, 영문, 숫자 등) 그대로 둔다.
    if (code < HANGUL_START || code > HANGUL_END) {
      result += char
      continue
    }

    const offset = code - HANGUL_START
    result += CHOSUNG[Math.floor(offset / 588)]
    result += JUNGSUNG[Math.floor((offset % 588) / 28)]
    result += JONGSUNG[offset % 28]
  }
  return result
}

// '대구' -> 'ㄷㄱ' 처럼 초성만 추출한다.
const getChosung = (text) =>
  [...text]
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code < HANGUL_START || code > HANGUL_END) return char
      return CHOSUNG[Math.floor((code - HANGUL_START) / 588)]
    })
    .join('')

// 'ㄷㄱ' 처럼 자음으로만 이루어진 검색어인지 판별한다.
const isChosungOnly = (text) => text.length > 0 && [...text].every((char) => CHOSUNG.includes(char))

// 두 문자열을 같게 만드는 데 필요한 최소 편집 횟수 (Levenshtein 거리)
const levenshtein = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // 삭제
        dp[i][j - 1] + 1, // 삽입
        dp[i - 1][j - 1] + cost, // 교체
      )
    }
  }
  return dp[a.length][b.length]
}

// 검색어와 도시 이름의 유사도를 0~1 점수로 환산한다 (1에 가까울수록 비슷함)
const similarity = (keyword, cityName) => {
  // 1) 'ㄷㄱ' 처럼 초성만 입력한 경우: 초성 검색으로 처리
  if (isChosungOnly(keyword)) {
    return getChosung(cityName).includes(keyword) ? 0.9 : 0
  }

  // 2) 한글은 글자 단위가 아니라 자모 단위로 비교해야 '댁' 과 '대구' 의 유사성이 잡힌다.
  const keywordJamo = decomposeHangul(keyword)
  const cityJamo = decomposeHangul(cityName)

  // 3) 한쪽이 다른 쪽을 포함하면(조합 중인 글자, '서울시' 같은 접미어) 높은 점수를 준다.
  if (cityJamo.includes(keywordJamo) || keywordJamo.includes(cityJamo)) {
    return 0.95
  }

  // 4) 그 외에는 자모 기준 편집 거리로 점수를 매긴다.
  const maxLength = Math.max(keywordJamo.length, cityJamo.length)
  if (maxLength === 0) return 1
  return 1 - levenshtein(keywordJamo, cityJamo) / maxLength
}

// 검색창 아래에 펼쳐질 추천 목록 (자동완성)
const suggestions = computed(() => {
  const keyword = searchQuery.value.trim()

  if (keyword === '') {
    return []
  }

  return weatherList.value
    .map((city) => ({ city, score: similarity(keyword, city.name) }))
    .filter((item) => item.score >= 0.5) // 너무 동떨어진 도시는 제외
    .sort((a, b) => b.score - a.score) // 점수 높은 순
    .slice(0, 5)
    .map((item) => item.city) // 점수는 정렬에만 쓰고 화면에는 도시 정보만 전달
})

// 원본 데이터에서 파생되는 요약 값들도 computed로 관리한다.
const bookmarkedCount = computed(() => bookmarkedIds.value.length)

const averageTemp = computed(() => {
  const total = weatherList.value.reduce((sum, city) => sum + city.temp, 0)
  return Math.round(total / weatherList.value.length)
})

// 원본 배열을 직접 sort하면 반응형 데이터가 변형되므로 복사본을 정렬한다.
const hottestCity = computed(() => [...weatherList.value].sort((a, b) => b.temp - a.temp)[0])

// 3) 반응형 변수 변화 감시 --------------------------------------------
// (1) selectedCityInfo 감시 (watch): 선택 도시가 바뀔 때만 실행
watch(selectedCityInfo, (newCity, oldCity) => {
  statusMessage.value = `${newCity.name}이(가) 선택되었습니다.`
  console.log(
    `[watch 감지] 상태 바 문구가 업데이트되었습니다 -> '${statusMessage.value}'`,
    oldCity ? `(이전 선택: ${oldCity.name})` : '(최초 선택)',
  )
})

// (2) bookmarkedIds 깊은 감시 (deep): push/splice로 배열 내부가 바뀌는 것까지 추적
// bookmarkedIds.value = [...] 처럼 통째로 교체하는 게 아니라 push/splice로 '내부만' 바꾸므로,
// deep: true가 없으면 ref 자체(.value 참조)는 그대로라 감지되지 않는다.
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

// (3) searchQuery 감시 (watchEffect): 의존성을 자동 추적하여 최초 1회 + 변경 시마다 실행
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 데이터를 필터링합니다. (결과: ${filteredWeatherList.value.length}건)`,
  )
})

// 이벤트 핸들러 --------------------------------------------------------
// 카드 선택: 상태바 문구를 직접 바꾸지 않고 selectedCityInfo만 갱신 (문구 변경은 watch가 담당)
const selectCard = (city) => {
  selectedCityInfo.value = city
}

// 검색어 입력: 타이핑하는 동안 추천 드롭다운을 펼친다.
const onSearchInput = (event) => {
  searchQuery.value = event.target.value
  isSuggestionOpen.value = true
}

// 추천 도시 클릭 시 검색어를 교체하고 드롭다운을 닫는다.
const applySuggestion = (cityName) => {
  searchQuery.value = cityName
  isSuggestionOpen.value = false
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// 체크박스가 city.bookmarked를 직접 v-model로 바꾸지 않으므로, 토글 로직을 직접 작성한다.
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
    <h2 class="app-title">🌤️ 과제 2: 날씨 (컴포지션)</h2>

    <section class="panel">
      <h3 class="panel-title">🔍 도시 검색</h3>
      <!-- 검색창 + 아래로 펼쳐지는 추천 드롭다운 -->
      <div class="search-box">
        <input
          class="search-input"
          type="text"
          placeholder="검색할 도시 이름 입력"
          :value="searchQuery"
          @input="onSearchInput"
          @focus="isSuggestionOpen = true"
          @blur="isSuggestionOpen = false"
          @keyup.esc="isSuggestionOpen = false"
        />

        <ul v-if="isSuggestionOpen && suggestions.length > 0" class="suggestion-dropdown">
          <li v-for="city in suggestions" :key="city.id">
            <!-- mousedown.prevent: 클릭 순간 input의 blur가 먼저 발생해 목록이 닫히는 것을 막는다 -->
            <button
              class="suggestion-item"
              @mousedown.prevent
              @click="applySuggestion(city.name)"
            >
              <span class="suggestion-name">{{ city.name }}</span>
              <span class="suggestion-meta">{{ city.status }} · {{ city.temp }}°C</span>
            </button>
          </li>
        </ul>
      </div>

      <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
    </section>

    <!-- 파생 상태(computed) 요약 -->
    <section class="panel summary-panel">
      <span class="summary-item">⭐ 북마크 {{ bookmarkedCount }}곳</span>
      <span class="summary-item">🌡 평균 {{ averageTemp }}°C</span>
      <span class="summary-item">🔥 최고기온 {{ hottestCity.name }}</span>
    </section>

    <!-- 4) 검색 결과 표시 (computed 결과인 filteredWeatherList를 렌더링) -->
    <section class="panel">
      <h3 class="panel-title">📋 지역별 날씨 현황</h3>

      <div class="card-list">
        <div
          v-for="city in filteredWeatherList"
          :key="city.id"
          class="weather-card"
          @click="selectCard(city)"
        >
        <div class="card-info">
          <p class="city-name">
            {{ city.name }} ({{ city.status }})
            <span v-show="isBookmarked(city.id)" class="star">⭐</span>
          </p>
          <p class="city-temp">현재 기온: {{ city.temp }}°C</p>
          <p class="city-detail">습도: {{ city.humidity }}% / 풍속: {{ city.wind }}m/s</p>

          <span v-if="city.temp >= 28" class="badge badge-very-hot">🔥 무더움 (28도 이상)</span>
          <span v-else-if="city.temp >= 25" class="badge badge-hot">🌡 더움 (25도 이상)</span>
          <span v-else class="badge badge-cool">❄ 선선함 (25도 미만)</span>
        </div>

        <div class="card-actions">
          <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
            상세보기
          </button>

          <!-- isBookmarked(city.id)는 계산된 값이라 v-model 대상이 될 수 없다.
               1일차에 배운 v-model의 원리(:checked + @change)를 그대로 적용한다. -->
          <label class="bookmark-label" @click.stop>
            <input type="checkbox" :checked="isBookmarked(city.id)" @change="toggleBookmark(city)" />
            북마크
          </label>
        </div>
        </div>
      </div>

      <!-- 검색어와 일치하는 데이터가 없을 때 안내 -->
      <p v-if="filteredWeatherList.length === 0" class="empty-result">
        '{{ searchQuery }}' 와(과) 일치하는 도시가 없습니다.
      </p>

    </section>

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

.panel {
  margin-bottom: 14px;
  padding: 12px;
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.panel-title {
  margin: 0 0 10px;
  font-size: 14px;
  color: #409eff;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.summary-panel {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
}

.summary-item {
  font-size: 12px;
  color: #606266;
}

.search-echo {
  margin: 8px 0 0;
  font-size: 12px;
  color: #606266;
}

.weather-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 12px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
}

.weather-card:last-child {
  margin-bottom: 0;
}

.weather-card:hover {
  border-color: #409eff;
}

.city-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: bold;
}

.city-temp {
  margin: 0 0 2px;
  font-size: 13px;
  color: #606266;
}

.city-detail {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
}

.star {
  font-size: 12px;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #ffffff;
}

.badge-very-hot {
  background-color: #f56c6c;
}

.badge-hot {
  background-color: #e6a23c;
}

.badge-cool {
  background-color: #409eff;
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.detail-btn {
  padding: 6px 12px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.detail-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.bookmark-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.bookmark-label input {
  cursor: pointer;
}

.card-list {
  max-height: 340px;
  overflow-y: auto;
}

.search-box {
  position: relative;
}

.suggestion-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 10;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: dropdown-open 0.18s ease-out;
}

/* 아래로 펼쳐지는 효과 */
@keyframes dropdown-open {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  font-size: 13px;
  color: #303133;
  text-align: left;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.suggestion-meta {
  font-size: 11px;
  color: #909399;
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
