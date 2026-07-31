<script setup>
import { ref } from 'vue'

// 1) 배열 렌더링용 날씨 데이터
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

// 3) 양방향 바인딩(한글 처리)용 검색어
const searchQuery = ref('')

// 4) 이벤트 처리용 상태바 문구
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')

// 카드 선택 (버블링으로 상세보기 버튼과 구분 필요)
const selectCard = (cityName) => {
  statusMessage.value = `${cityName}가 선택되었습니다.`
}

// 상세보기 버튼 (버블링 없이 alert)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-app">
    <h2 class="app-title">🌤️ 과제 1: 날씨 (Mockup)</h2>

    <!-- 3) 양방향 바인딩 및 한글 처리 (:value, @input) -->
    <section class="panel">
      <h3 class="panel-title">🔍 도시 검색</h3>
      <input
        class="search-input"
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchQuery"
        @input="searchQuery = $event.target.value"
      />
      <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
    </section>

    <!-- 1) 배열 렌더링 (v-for) + :key 바인딩 -->
    <section class="panel">
      <h3 class="panel-title">📋 지역별 날씨 현황</h3>
      <div
        v-for="city in weatherList"
        :key="city.id"
        class="weather-card"
        @click="selectCard(city.name)"
      >
        <div class="card-info">
          <p class="city-name">{{ city.name }} ({{ city.status }})</p>
          <p class="city-temp">현재 기온: {{ city.temp }}°C</p>

          <!-- 2) 조건부 렌더링 (v-if / v-else) -->
          <span v-if="city.temp >= 25" class="badge badge-hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge badge-cool">❄ 선선함 (25도 미만)</span>
        </div>

        <!-- 4) 이벤트 수식어 .stop 으로 카드 클릭 버블링 차단 -->
        <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
          상세보기
        </button>
      </div>
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
  margin: 0 0 8px;
  font-size: 13px;
  color: #606266;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #ffffff;
}

.badge-hot {
  background-color: #f56c6c;
}

.badge-cool {
  background-color: #409eff;
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
