<script setup>
import { onMounted } from 'vue'
import { useAirQualityStore } from '@/stores/airQualityStore'
import { describeAqi } from '@/utils/weatherFormat'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import AsyncStatePanel from '@/components/exercise/AsyncStatePanel.vue'

const airStore = useAirQualityStore()

// 이 화면에 들어왔을 때만 대기질 API를 부른다.
// 대시보드만 보고 나가는 사용자에게는 호출이 아예 일어나지 않는다.
onMounted(() => airStore.ensureLoaded())
</script>

<template>
  <section class="air-view">
    <BaseDashboardCard>
      <template #header>
        <h3 class="slot-card-title">
          🌫️ 지역별 대기질 순위
        </h3>
        <span class="count-badge">좋은 순</span>
      </template>

      <AsyncStatePanel
        :is-loading="airStore.isLoading"
        :error-message="airStore.errorMessage"
        loading-text="대기질 정보를 불러오는 중입니다..."
        @retry="airStore.loadAirQuality"
      />

      <template v-if="!airStore.isLoading && !airStore.errorMessage">
        <ol class="air-list">
          <li
            v-for="(item, index) in airStore.rankedByAqi"
            :key="item.id"
            class="air-row"
          >
            <span class="air-rank">{{ index + 1 }}</span>

            <span class="air-name">{{ item.name }}</span>

            <!-- 등급별 색은 유틸이 정한다. 컴포넌트마다 색을 다시 정하면 기준이 흩어진다. -->
            <span
              class="air-badge"
              :style="{ backgroundColor: describeAqi(item.aqi).color }"
            >
              {{ describeAqi(item.aqi).label }}
            </span>

            <span class="air-detail">
              초미세 {{ Math.round(item.pm25) }} / 미세 {{ Math.round(item.pm10) }}
              <span class="air-unit">㎍/㎥</span>
            </span>
          </li>
        </ol>

        <p
          v-if="airStore.failedCityNames.length > 0"
          class="partial-warning"
        >
          {{ airStore.failedCityNames.join(', ') }} 정보를 불러오지 못했습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <p class="air-note">
      대기질 등급은 OpenWeatherMap의 AQI(1~5) 기준이며, 국내 환경부 기준과는 다를 수 있습니다.
    </p>
  </section>
</template>

<style scoped>
/* #header 슬롯 내용은 부모 스코프에서 컴파일되므로 여기서 스타일을 정의한다 */
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

.air-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.air-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding: 8px 10px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.air-row:last-child {
  margin-bottom: 0;
}

.air-rank {
  width: 18px;
  font-size: 12px;
  font-weight: bold;
  color: #909399;
  text-align: center;
}

.air-name {
  width: 42px;
  font-size: 13px;
  font-weight: bold;
}

.air-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #ffffff;
}

.air-detail {
  margin-left: auto;
  font-size: 11px;
  color: #606266;
}

.air-unit {
  color: #c0c4cc;
}

.partial-warning {
  margin: 10px 0 0;
  padding: 8px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 11px;
  color: #e6a23c;
  text-align: center;
}

.air-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: #909399;
  text-align: center;
}
</style>
