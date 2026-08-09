import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { weatherMockList } from '@/data/weatherMockData'
import { loadState, saveState } from '@/utils/storage'

const STORAGE_KEY = 'bookmarked-ids'

/**
 * 북마크 스토어.
 *
 * 원래 북마크 목록은 WeatherHomeView가 들고 있었다.
 * 그 결과 상세 페이지에서는 이 도시가 북마크된 상태인지조차 알 수 없었고,
 * 북마크만 모아 보는 화면도 만들 수 없었다.
 * 여러 화면이 공유해야 하는 값이므로 스토어로 끌어올린다.
 */
export const useBookmarkStore = defineStore('bookmark', () => {
  // ---- state ----
  // 도시 객체가 아니라 id만 저장한다.
  // 객체를 통째로 담으면 원본 날씨 데이터가 갱신돼도 북마크 쪽은 옛날 기온을 들고 있게 된다.
  const restored = loadState(STORAGE_KEY, [])
  // 저장된 값이 배열이 아니면(직접 수정 등) 신뢰하지 않고 빈 목록에서 시작한다.
  const bookmarkedIds = ref(Array.isArray(restored) ? restored : [])

  // ---- getters ----
  const bookmarkCount = computed(() => bookmarkedIds.value.length)

  // 인자를 받아야 하므로 '함수를 반환하는 getter' 형태로 만든다.
  const isBookmarked = computed(() => (cityId) => bookmarkedIds.value.includes(cityId))

  /**
   * id 목록을 실제 도시 객체 목록으로 바꿔준다.
   * 원본(weatherMockList) 순서를 기준으로 걸러내므로,
   * 저장된 id 중 지금은 없어진 도시가 있어도 자연스럽게 제외된다.
   */
  const bookmarkedCities = computed(() =>
    weatherMockList.filter((city) => bookmarkedIds.value.includes(city.id)),
  )

  // ---- actions ----
  /**
   * 북마크를 켜고 끈다.
   * @returns {boolean} 추가했으면 true, 해제했으면 false.
   *   호출한 화면이 '추가/해제 중 무엇이었는지' 알아야 안내 문구를 만들 수 있어서 결과를 돌려준다.
   */
  const toggleBookmark = (cityId) => {
    const index = bookmarkedIds.value.indexOf(cityId)

    if (index === -1) {
      bookmarkedIds.value.push(cityId)
      return true
    }

    bookmarkedIds.value.splice(index, 1)
    return false
  }

  // ---- 영속화 ----
  // push/splice는 배열 '내부'를 바꾸는 것이라 ref 교체가 일어나지 않는다.
  // deep 옵션이 없으면 이 감시자는 한 번도 실행되지 않는다.
  watch(
    bookmarkedIds,
    (ids) => {
      saveState(STORAGE_KEY, ids)
      console.log(`[bookmarkStore] 북마크 ${ids.length}곳을 저장했습니다.`)
    },
    { deep: true },
  )

  return { bookmarkedIds, bookmarkCount, isBookmarked, bookmarkedCities, toggleBookmark }
})
