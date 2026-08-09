import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { majorCities } from '@/data/cityCatalog'
import { fetchCityAirQuality, describeApiError } from '@/api/weatherApi'

/**
 * 대기질 스토어.
 *
 * weatherStore와 구조가 거의 같다. 도시들을 병렬로 받아오고,
 * 일부만 실패하면 성공한 것만 보여준다.
 *
 * 전체 54개 도시가 아니라 광역시 중심의 대표 도시(majorCities)만 조회한다.
 * 대기질도 도시마다 한 번씩 호출해야 해서, 날씨 조회 54회에 더하면
 * 무료 플랜의 분당 60회 한도를 넘기기 때문이다.
 *
 * 대기질 화면에서만 필요한 데이터라 별도 스토어로 두었다.
 * 대시보드만 보고 나가는 사용자에게는 이 호출이 아예 일어나지 않는다.
 */
export const useAirQualityStore = defineStore('airQuality', () => {
  // ---- state ----
  const airList = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const failedCityNames = ref([])

  // ---- getters ----
  const hasData = computed(() => airList.value.length > 0)

  /**
   * 대기질이 좋은 순(AQI 오름차순)으로 정렬해 돌려준다.
   * 원본 배열을 sort하면 state가 변형되므로 복사본을 정렬한다.
   */
  const rankedByAqi = computed(() => [...airList.value].sort((a, b) => a.aqi - b.aqi))

  // ---- actions ----
  const loadAirQuality = async () => {
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = ''
    failedCityNames.value = []

    try {
      const results = await Promise.allSettled(majorCities.map((city) => fetchCityAirQuality(city)))

      const loaded = []
      const failures = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded.push(result.value)
        } else {
          failures.push({ city: majorCities[index], reason: result.reason })
        }
      })

      if (loaded.length === 0) {
        errorMessage.value = describeApiError(failures[0].reason)
        airList.value = []
        console.error('[airQualityStore] 모든 도시 조회에 실패했습니다.', failures[0].reason)
        return
      }

      airList.value = loaded
      failedCityNames.value = failures.map((failure) => failure.city.name)
    } finally {
      isLoading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (hasData.value || isLoading.value) {
      return
    }
    await loadAirQuality()
  }

  return {
    airList,
    isLoading,
    errorMessage,
    failedCityNames,
    hasData,
    rankedByAqi,
    loadAirQuality,
    ensureLoaded,
  }
})
