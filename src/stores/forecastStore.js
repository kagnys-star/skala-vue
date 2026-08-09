import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { findCityInCatalog } from '@/data/cityCatalog'
import { fetchCityForecast, describeApiError } from '@/api/weatherApi'

/**
 * 시간별 예보 스토어.
 *
 * weatherStore와 나눈 이유:
 * 현재 날씨는 10개 도시를 한 번에 받아 목록·상세·북마크가 모두 쓰지만,
 * 예보는 상세 페이지에서 '보고 있는 도시 하나'만 필요하다.
 * 10개 도시 예보를 미리 받아두면 호출 40건이 낭비되므로, 요청이 있을 때 한 도시씩 받는다.
 *
 * 받아온 예보는 도시별로 쌓아 둔다. 상세 페이지를 다시 열어도 같은 도시라면 재호출하지 않는다.
 */
export const useForecastStore = defineStore('forecast', () => {
  // ---- state ----
  // { city_01: [...예보], city_03: [...예보] } 형태로 도시별 결과를 모아 둔다.
  const forecastByCityId = ref({})
  // 지금 어느 도시를 불러오는 중인지. 로딩 표시를 그 도시에만 적용하기 위해 id로 들고 있다.
  const loadingCityId = ref(null)
  const errorMessage = ref('')

  // ---- getters ----
  const isLoading = computed(() => loadingCityId.value !== null)

  const getForecast = computed(() => {
    return (cityId) => forecastByCityId.value[cityId] ?? null
  })

  /**
   * 오늘 이후 24시간치(3시간 간격 8건)만 잘라서 돌려준다.
   * 40건을 전부 그리면 막대가 너무 촘촘해 읽기 어렵다.
   */
  const getNextDayForecast = computed(() => {
    return (cityId) => (forecastByCityId.value[cityId] ?? []).slice(0, 8)
  })

  // ---- actions ----
  const loadForecast = async (cityId) => {
    const city = findCityInCatalog(cityId)

    // 우리가 아는 도시가 아니면 호출할 것도 없다.
    if (city === null) {
      errorMessage.value = '알 수 없는 도시입니다.'
      return
    }

    loadingCityId.value = cityId
    errorMessage.value = ''

    try {
      forecastByCityId.value[cityId] = await fetchCityForecast(city)
    } catch (error) {
      errorMessage.value = describeApiError(error)
      console.error(`[forecastStore] '${city.name}' 예보 조회 실패`, error)
    } finally {
      loadingCityId.value = null
    }
  }

  /**
   * 아직 받아온 적 없는 도시일 때만 호출한다.
   * 상세 페이지를 오갈 때마다 같은 예보를 다시 받지 않도록 막는 역할이다.
   */
  const ensureLoaded = async (cityId) => {
    if (forecastByCityId.value[cityId] || loadingCityId.value === cityId) {
      return
    }
    await loadForecast(cityId)
  }

  return {
    forecastByCityId,
    loadingCityId,
    errorMessage,
    isLoading,
    getForecast,
    getNextDayForecast,
    loadForecast,
    ensureLoaded,
  }
})
