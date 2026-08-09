<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useForecastStore } from '@/stores/forecastStore'
import {
  getWeatherIconUrl,
  formatWindDirection,
  formatClockTime,
  formatRelativeTime,
  formatDayLength,
} from '@/utils/weatherFormat'
import AsyncStatePanel from '@/components/exercise/AsyncStatePanel.vue'
import ForecastChart from '@/components/exercise/ForecastChart.vue'

// 관측 데이터는 스토어에서 읽는다.
const weatherStore = useWeatherStore()

// 예보는 '지금 보고 있는 도시' 것만 필요하므로 별도 스토어에서 도시 단위로 받아온다.
const forecastStore = useForecastStore()

// 상단 툴바에서 단위를 바꾸면 이 화면의 기온도 같이 바뀌어야 한다.
const configStore = useConfigStore()

// 북마크가 스토어로 올라온 덕분에, 목록 화면을 거치지 않고 여기서 바로 켜고 끌 수 있다.
const bookmarkStore = useBookmarkStore()

// useRoute: '지금 어떤 URL로 들어왔는지'를 읽는 객체 (params, query 등)
// useRouter: '다른 곳으로 이동시키는' 객체 (push, back 등)
// 이름이 비슷하지만 역할이 완전히 다르므로 헷갈리지 않게 주의한다.
const route = useRoute()
const router = useRouter()

/**
 * 화면에 뿌릴 도시 객체.
 *
 * 예전에는 Mock 배열에서 직접 찾아 ref에 담았지만, 이제 원본은 스토어에 있다.
 * ref에 복사해 두면 스토어 데이터가 갱신돼도 이 화면은 옛 값을 들고 있게 되므로,
 * 스토어를 그대로 따라가는 computed로 둔다.
 * URL이 바뀌면 route.params.cityId가 바뀌고, 이 computed가 알아서 다시 계산된다.
 * (덕분에 예전에 필요했던 watch가 필요 없어졌다)
 */
const cityDetail = computed(() => weatherStore.findCityById(route.params.cityId))

// 도시를 못 찾았을 때 접근 오류가 나지 않도록 옵셔널 체이닝으로 감싼다.
const displayTemp = computed(() => configStore.convertTemp(cityDetail.value?.temp ?? 0))

// 이 화면에서 보여줄 예보 구간 (3시간 간격 8건 = 향후 24시간)
const forecastSlots = computed(() => forecastStore.getNextDayForecast(route.params.cityId))

// 상세 페이지 URL로 곧장 들어오는 경우엔 스토어가 비어 있으므로 여기서도 로딩을 보장한다.
onMounted(() => weatherStore.ensureLoaded())

/**
 * 예보는 도시마다 따로 받아야 한다.
 *
 * immediate: true 로 두면 최초 진입 시에도 한 번 실행되므로 onMounted가 따로 필요 없다.
 * 또 도시가 바뀌면(상세 → 다른 상세) 컴포넌트가 재사용되어 mount가 다시 일어나지 않는데,
 * 이 감시자는 파라미터 변화를 보고 있으므로 그 경우에도 새 예보를 받아온다.
 */
watch(
  () => route.params.cityId,
  (cityId) => forecastStore.ensureLoaded(cityId),
  { immediate: true },
)

const toggleBookmark = () => {
  // 도시를 못 찾은 상태에서는 버튼 자체가 렌더링되지 않지만, 방어적으로 한 번 더 확인한다.
  if (cityDetail.value === null) {
    return
  }
  bookmarkStore.toggleBookmark(cityDetail.value.id)
}

// 메인 대시보드로 복귀. router.back()이 아니라 push를 쓰는 이유는
// 주소창에 URL을 직접 입력해 들어온 경우 '뒤로 갈 곳'이 없기 때문이다.
const goToHome = () => {
  router.push({ name: 'weather-home' })
}
</script>

<template>
  <section class="detail-view">
    <h2 class="detail-title">
      📊 지역별 상세 기상 관측 정보
    </h2>

    <!-- 아직 불러오는 중이거나 실패한 경우 -->
    <AsyncStatePanel
      :is-loading="weatherStore.isLoading"
      :error-message="weatherStore.errorMessage"
      loading-text="관측 정보를 불러오는 중입니다..."
      error-title="관측 정보를 가져오지 못했습니다"
      @retry="weatherStore.loadWeather"
    />

    <!-- 정상적으로 도시를 찾은 경우 -->
    <div
      v-if="cityDetail"
      class="detail-box"
    >
      <div class="detail-head">
        <div class="detail-place">
          <img
            class="detail-icon"
            :src="getWeatherIconUrl(cityDetail.icon)"
            :alt="cityDetail.status"
          >
          <div>
            <p class="detail-region">
              📍 {{ cityDetail.region }}
            </p>
            <p class="detail-observed">
              {{ formatRelativeTime(cityDetail.observedAt) }} 관측
            </p>
          </div>
        </div>

        <button
          class="bookmark-btn"
          :class="{ 'is-on': bookmarkStore.isBookmarked(cityDetail.id) }"
          @click="toggleBookmark"
        >
          {{ bookmarkStore.isBookmarked(cityDetail.id) ? '⭐ 북마크됨' : '☆ 북마크' }}
        </button>
      </div>

      <dl class="detail-list">
        <div class="detail-row">
          <dt>실시간 기온</dt>
          <dd>{{ displayTemp }}{{ configStore.unitSymbol }}</dd>
        </div>
        <div class="detail-row">
          <dt>체감 온도</dt>
          <dd>
            {{ configStore.convertTemp(cityDetail.feelsLike) }}{{ configStore.unitSymbol }}
          </dd>
        </div>
        <div class="detail-row">
          <dt>기상 현황</dt>
          <dd>{{ cityDetail.status }} (구름 {{ cityDetail.clouds }}%)</dd>
        </div>
        <div class="detail-row">
          <dt>대기 습도</dt>
          <dd>{{ cityDetail.humidity }}%</dd>
        </div>
        <div class="detail-row">
          <dt>현재 풍속</dt>
          <dd>
            {{ formatWindDirection(cityDetail.windDeg) }}풍 {{ cityDetail.wind }}m/s
          </dd>
        </div>
        <div class="detail-row">
          <dt>기압 / 가시거리</dt>
          <dd>
            {{ cityDetail.pressure }}hPa / {{ Math.round(cityDetail.visibility / 1000) }}km
          </dd>
        </div>
        <div class="detail-row">
          <dt>일출 / 일몰</dt>
          <dd>
            {{ formatClockTime(cityDetail.sunrise) }} · {{ formatClockTime(cityDetail.sunset) }}
            <span class="detail-sub">
              (낮 {{ formatDayLength(cityDetail.sunrise, cityDetail.sunset) }})
            </span>
          </dd>
        </div>
      </dl>
    </div>

    <!-- 향후 24시간 예보. 현재 날씨와는 다른 API라 로딩·오류 상태도 따로 관리한다. -->
    <div
      v-if="cityDetail"
      class="forecast-box"
    >
      <h3 class="forecast-title">
        ⏱ 24시간 예보
      </h3>

      <AsyncStatePanel
        :is-loading="forecastStore.loadingCityId === route.params.cityId"
        :error-message="forecastStore.errorMessage"
        loading-text="예보를 불러오는 중입니다..."
        error-title="예보를 가져오지 못했습니다"
        @retry="forecastStore.loadForecast(route.params.cityId)"
      />

      <ForecastChart
        v-if="forecastSlots.length > 0"
        :entries="forecastSlots"
      />
    </div>

    <!-- 로딩도 오류도 아닌데 도시가 없는 경우.
         진입 시점의 잘못된 ID는 라우터 가드가 막으므로, 여기 걸리는 건
         응답에서 이 도시만 빠진 경우다. (일부 도시 조회 실패) -->
    <p
      v-else-if="!weatherStore.isLoading && !weatherStore.errorMessage"
      class="detail-empty"
    >
      '{{ route.params.cityId }}' 에 해당하는 관측 정보가 없습니다.
    </p>

    <button
      class="back-btn"
      @click="goToHome"
    >
      ← 메인 대시보드로 돌아가기
    </button>
  </section>
</template>

<style scoped>
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background-color: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.detail-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
}

.detail-box {
  padding: 18px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.detail-head {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.detail-place {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  width: 56px;
  height: 56px;
  margin: -6px;
}

.detail-region {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
}

.detail-observed {
  margin: 2px 0 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.detail-sub {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.forecast-box {
  padding: 18px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.forecast-title {
  margin: 0 0 6px;
  font-size: var(--fs-base);
  font-weight: 700;
}

.bookmark-btn {
  padding: 7px 14px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--ease);
}

.bookmark-btn:hover {
  border-color: var(--warm);
  color: var(--warm);
}

.bookmark-btn.is-on {
  background-color: #fdf6ea;
  border-color: var(--warm);
  color: var(--warm);
}

/* 항목을 2열 격자로 배치한다. 좁은 화면에서는 1열로 접힌다.
   최소 폭을 300px로 잡아야 넓은 화면에서 3열로 흩어지지 않는다.
   라벨과 값이 너무 멀어지면 어느 값이 어느 항목인지 눈으로 잇기 어려워진다. */
.detail-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2px 24px;
  margin: 0;
}

.detail-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid var(--surface-sunken);
  font-size: var(--fs-md);
}

.detail-row dt {
  color: var(--text-muted);
  white-space: nowrap;
}

.detail-row dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  text-align: right;
}

.detail-empty {
  margin: 0;
  padding: 34px 16px;
  background-color: var(--surface-sunken);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--fs-md);
  color: var(--text-muted);
  text-align: center;
}

.back-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--text-soft);
  cursor: pointer;
  transition: all var(--ease);
}

.back-btn:hover {
  background-color: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}
</style>
