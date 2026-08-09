<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findCityById } from '@/data/weatherMockData'
import { useConfigStore } from '@/stores/configStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'

// 상단 툴바에서 단위를 바꾸면 이 화면의 기온도 같이 바뀌어야 한다.
const configStore = useConfigStore()

// 북마크가 스토어로 올라온 덕분에, 목록 화면을 거치지 않고 여기서 바로 켜고 끌 수 있다.
const bookmarkStore = useBookmarkStore()

// useRoute: '지금 어떤 URL로 들어왔는지'를 읽는 객체 (params, query 등)
// useRouter: '다른 곳으로 이동시키는' 객체 (push, back 등)
// 이름이 비슷하지만 역할이 완전히 다르므로 헷갈리지 않게 주의한다.
const route = useRoute()
const router = useRouter()

// 화면에 뿌릴 도시 객체. 아직 못 찾았을 수도 있으므로 null로 시작한다.
const cityDetail = ref(null)

// 도시를 못 찾았을 때 접근 오류가 나지 않도록 옵셔널 체이닝으로 감싼다.
const displayTemp = computed(() => configStore.convertTemp(cityDetail.value?.temp ?? 0))

/**
 * 라우트 파라미터(:cityId)를 실제 도시 객체로 바꿔 담는다.
 *
 * 없는 ID로 '진입'하는 경우는 라우터의 beforeEnter 가드가 NotFound로 돌려보내므로
 * 여기까지 오지 않는다. 다만 아래 watch 설명처럼 '진입 후 파라미터만 바뀌는' 경우에는
 * 가드가 다시 실행되지 않으므로, 그때를 대비해 null 처리를 남겨둔다.
 */
const loadCityDetail = () => {
  const { cityId } = route.params
  cityDetail.value = findCityById(cityId)

  if (cityDetail.value === null) {
    console.warn(`[WeatherDetailView] '${cityId}'에 해당하는 도시를 찾지 못했습니다.`)
  }
}

// Mount 시점에 한 번 데이터를 채운다.
onMounted(loadCityDetail)

// 주의) onMounted만으로는 부족하다.
// /weather/city_01 에서 /weather/city_02 로 이동하면 라우트는 바뀌지만
// 매칭된 컴포넌트가 같아서 Vue가 인스턴스를 '재사용'한다. 즉 다시 mount되지 않는다.
// (같은 이유로 라우터의 beforeEnter 가드도 이때는 실행되지 않는다.)
// 그래서 파라미터 변화를 따로 감시해 데이터를 다시 읽어야 화면이 갱신된다.
watch(() => route.params.cityId, loadCityDetail)

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

    <!-- 존재하지 않는 도시 ID로 들어온 경우 (예: /weather/city_99) -->
    <p v-else class="detail-empty">
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
