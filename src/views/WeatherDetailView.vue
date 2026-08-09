<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useWeatherStore } from '@/stores/weatherStore'
import AsyncStatePanel from '@/components/exercise/AsyncStatePanel.vue'

// 관측 데이터는 스토어에서 읽는다.
const weatherStore = useWeatherStore()

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

// 상세 페이지 URL로 곧장 들어오는 경우엔 스토어가 비어 있으므로 여기서도 로딩을 보장한다.
onMounted(() => weatherStore.ensureLoaded())

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
    <h2 class="detail-title">📊 지역별 상세 기상 관측 정보</h2>

    <!-- 아직 불러오는 중이거나 실패한 경우 -->
    <AsyncStatePanel
      :is-loading="weatherStore.isLoading"
      :error-message="weatherStore.errorMessage"
      loading-text="관측 정보를 불러오는 중입니다..."
      @retry="weatherStore.loadWeather"
    />

    <!-- 정상적으로 도시를 찾은 경우 -->
    <div v-if="cityDetail" class="detail-box">
      <div class="detail-head">
        <p class="detail-region">📍 지정 지역: {{ cityDetail.region }}</p>

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
          <dt>기상 현황</dt>
          <dd>{{ cityDetail.status }}</dd>
        </div>
        <div class="detail-row">
          <dt>대기 습도</dt>
          <dd>{{ cityDetail.humidity }}%</dd>
        </div>
        <div class="detail-row">
          <dt>현재 풍속</dt>
          <dd>{{ cityDetail.wind }}m/s</dd>
        </div>
      </dl>
    </div>

    <!-- 로딩도 오류도 아닌데 도시가 없는 경우.
         진입 시점의 잘못된 ID는 라우터 가드가 막으므로, 여기 걸리는 건
         응답에서 이 도시만 빠진 경우다. (일부 도시 조회 실패) -->
    <p v-else-if="!weatherStore.isLoading && !weatherStore.errorMessage" class="detail-empty">
      '{{ route.params.cityId }}' 에 해당하는 관측 정보가 없습니다.
    </p>

    <button class="back-btn" @click="goToHome">← 메인 대시보드로 돌아가기</button>
  </section>
</template>

<style scoped>
.detail-view {
  padding: 12px;
  background-color: #f7f9fc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.detail-title {
  margin: 0 0 12px;
  font-size: 14px;
  color: #409eff;
}

.detail-box {
  padding: 12px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e4e7ed;
}

.detail-region {
  margin: 0;
  font-size: 13px;
  font-weight: bold;
}

.bookmark-btn {
  padding: 4px 10px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 11px;
  color: #909399;
  cursor: pointer;
}

.bookmark-btn:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.bookmark-btn.is-on {
  background-color: #fdf6ec;
  border-color: #e6a23c;
  color: #e6a23c;
}

.detail-list {
  margin: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
}

.detail-row dt {
  color: #909399;
}

.detail-row dd {
  margin: 0;
  color: #303133;
}

.detail-empty {
  margin: 0;
  padding: 16px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 13px;
  color: #e6a23c;
  text-align: center;
}

.back-btn {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.back-btn:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
