<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useWeatherStore } from '@/stores/weatherStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import AsyncStatePanel from '@/components/exercise/AsyncStatePanel.vue'

const router = useRouter()

// 이 화면은 자기 데이터를 하나도 갖지 않는다. 전부 스토어에서 읽는다.
// 북마크 목록이 화면이 아니라 스토어에 있기 때문에 이런 화면을 새로 만들 수 있다.
const bookmarkStore = useBookmarkStore()
const weatherStore = useWeatherStore()

// 이 주소로 곧장 들어올 수도 있으므로 여기서도 데이터 로딩을 보장한다.
onMounted(() => weatherStore.ensureLoaded())

const statusMessage = ref('북마크한 도시 목록입니다.')

// 목록 화면(WeatherHomeView)과 같은 WeatherCard를 재사용한다.
// 덕분에 기온 단위, 배지 기준, 디자인이 두 화면에서 저절로 일치한다.
const selectCard = (city) => {
  statusMessage.value = `${city.name}이(가) 선택되었습니다.`
}

const goToDetail = (cityId) => {
  router.push({ name: 'weather-detail', params: { cityId } })
}

const toggleBookmark = (city) => {
  bookmarkStore.toggleBookmark(city.id)
  statusMessage.value = `${city.name}을(를) 북마크에서 해제했습니다.`
}
</script>

<template>
  <section class="bookmark-view">
    <BaseDashboardCard>
      <template #header>
        <h3 class="slot-card-title">
          ⭐ 북마크한 도시
        </h3>
        <span class="count-badge">{{ bookmarkStore.bookmarkCount }}곳</span>
      </template>

      <AsyncStatePanel
        :is-loading="weatherStore.isLoading"
        :error-message="weatherStore.errorMessage"
        @retry="weatherStore.loadWeather"
      />

      <div
        v-if="!weatherStore.isLoading && !weatherStore.errorMessage && bookmarkStore.bookmarkCount > 0"
        class="card-list"
      >
        <WeatherCard
          v-for="city in bookmarkStore.bookmarkedCities"
          :key="city.id"
          :city-item="city"
          :is-bookmarked="true"
          @select-card="selectCard"
          @click-detail="goToDetail"
          @toggle-bookmark="toggleBookmark"
        />
      </div>

      <!-- 빈 목록일 때 그냥 비워두면 고장난 것처럼 보이므로 다음 행동을 안내한다 -->
      <p
        v-else-if="!weatherStore.isLoading && !weatherStore.errorMessage"
        class="empty-result"
      >
        아직 북마크한 도시가 없습니다.<br>
        <RouterLink :to="{ name: 'weather-home' }">
          대시보드
        </RouterLink>에서 카드의 북마크를 눌러
        보세요.
      </p>
    </BaseDashboardCard>

    <p class="status-bar">
      {{ statusMessage }}
    </p>
  </section>
</template>

<style scoped>
/* #header 슬롯 내용은 부모(이 컴포넌트) 스코프에서 컴파일되므로 여기서 스타일을 정의한다 */
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
  max-height: 380px;
  overflow-y: auto;
}

.empty-result {
  margin: 0;
  padding: 24px 16px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.8;
  color: #e6a23c;
  text-align: center;
}

.empty-result a {
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
