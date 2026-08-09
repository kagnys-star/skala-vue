import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { cityCatalog } from '@/data/cityCatalog'
import { fetchCityWeather, describeApiError } from '@/api/weatherApi'
import { loadState, saveState } from '@/utils/storage'

const CACHE_KEY = 'weather-cache'

/**
 * 날씨 데이터 스토어.
 *
 * 목록 화면, 상세 화면, 북마크 화면이 모두 같은 관측 데이터를 본다.
 * 화면마다 따로 호출하면 같은 데이터를 세 번 받아오게 되므로 스토어가 한 번만 받아 공유한다.
 *
 * 데이터뿐 아니라 '지금 불러오는 중인가(isLoading)', '실패했는가(errorMessage)'까지
 * 함께 들고 있어야 어느 화면에서든 같은 로딩/오류 화면을 그릴 수 있다.
 *
 * 캐시 정책:
 * 마지막으로 성공한 응답을 localStorage에 저장해 둔다.
 *   - 앱을 다시 열면 저장분을 먼저 보여주고, 그 뒤 조용히 새로 받아온다. (빈 화면을 안 보여준다)
 *   - 새로 받기에 실패하면 저장분을 계속 보여주되 '언제 받은 값인지' 함께 알린다.
 * 이 API는 간헐적으로 401을 내는 일이 있어, 실패했다고 화면을 비우면 쓸모가 크게 떨어진다.
 */
export const useWeatherStore = defineStore('weather', () => {
  // ---- state ----
  const restored = loadState(CACHE_KEY, null)

  // 저장분이 배열을 갖고 있을 때만 신뢰한다. (직접 수정될 수 있는 곳이다)
  const hasValidCache = Array.isArray(restored?.list) && restored.list.length > 0

  const weatherList = ref(hasValidCache ? restored.list : [])
  // 지금 화면에 보이는 값을 받아온 시각. 저장분을 복원했다면 그때의 시각이다.
  const fetchedAt = ref(hasValidCache ? restored.savedAt : null)
  // 화면의 값이 '방금 받은 것'이 아니라 '저장해 둔 것'인지 여부
  const isStale = ref(hasValidCache)

  const isLoading = ref(false)
  const errorMessage = ref('')
  // 일부 도시만 실패한 경우 어떤 도시가 빠졌는지 알려주기 위한 목록
  const failedCityNames = ref([])

  // ---- getters ----
  const hasData = computed(() => weatherList.value.length > 0)

  const findCityById = computed(() => {
    return (cityId) => weatherList.value.find((city) => city.id === cityId) ?? null
  })

  /**
   * 지금이 밤인지 여부.
   * OpenWeatherMap 아이콘 코드는 끝 글자로 낮(d)과 밤(n)을 구분한다.
   * 이 값으로 배경 하늘색을 바꾼다. 별도 호출 없이 이미 받은 데이터만 쓴다.
   */
  const isNight = computed(() => weatherList.value[0]?.icon?.endsWith('n') ?? false)

  // ---- actions ----
  /**
   * 카탈로그의 모든 도시 날씨를 받아온다.
   *
   * Promise.all이 아니라 allSettled를 쓰는 이유:
   * all은 하나라도 실패하면 즉시 전체가 실패로 끝나 성공한 나머지까지 버리게 된다.
   * allSettled는 전부 기다린 뒤 성공/실패를 각각 돌려주므로, 되는 것만이라도 보여줄 수 있다.
   */
  const loadWeather = async () => {
    // 이미 요청이 날아가 있는데 또 부르면 같은 호출이 중복된다. (한도가 있는 무료 API다)
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = ''
    failedCityNames.value = []

    try {
      const results = await Promise.allSettled(cityCatalog.map((city) => fetchCityWeather(city)))

      const loadedCities = []
      const failures = []

      // allSettled 결과는 입력 순서를 그대로 지키므로, 인덱스로 어느 도시였는지 되짚을 수 있다.
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loadedCities.push(result.value)
        } else {
          failures.push({ city: cityCatalog[index], reason: result.reason })
        }
      })

      if (loadedCities.length === 0) {
        // 전부 실패 = 개별 도시 문제가 아니라 키/네트워크 문제다.
        console.error('[weatherStore] 모든 도시 조회에 실패했습니다.', failures[0].reason)

        // 저장해 둔 값이 있으면 화면을 비우지 않는다. 대신 최신이 아님을 알린다.
        if (hasData.value) {
          isStale.value = true
          console.warn('[weatherStore] 저장된 이전 값을 그대로 보여줍니다.')
          return
        }

        errorMessage.value = describeApiError(failures[0].reason)
        return
      }

      weatherList.value = loadedCities
      failedCityNames.value = failures.map((failure) => failure.city.name)
      fetchedAt.value = Date.now()
      isStale.value = false

      // 다음 실행에서 쓸 수 있도록 성공한 응답을 저장해 둔다.
      saveState(CACHE_KEY, { savedAt: fetchedAt.value, list: loadedCities })

      if (failures.length > 0) {
        console.warn(`[weatherStore] 일부 도시 조회 실패: ${failedCityNames.value.join(', ')}`)
      }
    } finally {
      // 성공하든 실패하든 로딩 표시는 반드시 꺼야 한다.
      // finally에 두지 않으면 예외가 났을 때 화면이 영원히 '불러오는 중'에 머문다.
      isLoading.value = false
    }
  }

  /**
   * 화면이 열릴 때 부른다.
   *
   * 저장된 값이 있어도 그것은 과거 시점의 날씨이므로 한 번은 갱신을 시도한다.
   * 다만 이미 이번 실행에서 갱신에 성공했다면(isStale === false) 다시 부르지 않는다.
   * 덕분에 화면을 오갈 때마다 API를 반복 호출하지 않는다.
   */
  const ensureLoaded = async () => {
    if (isLoading.value) {
      return
    }
    if (hasData.value && !isStale.value) {
      return
    }
    await loadWeather()
  }

  return {
    weatherList,
    fetchedAt,
    isStale,
    isLoading,
    errorMessage,
    failedCityNames,
    hasData,
    findCityById,
    isNight,
    loadWeather,
    ensureLoaded,
  }
})
