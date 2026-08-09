import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { stockSymbols, fetchStockQuote, describeStockApiError } from '@/api/stockApi'
import { loadState, saveState } from '@/utils/storage'

const CACHE_KEY = 'stock-cache'

// 요청 사이에 두는 간격. 짧으면 서버가 '너무 몰아서 보낸다'며 일부를 거절한다.
const REQUEST_GAP_MS = 1200
// 거절당한 종목을 다시 부르기 전에 기다리는 시간
const RETRY_DELAY_MS = 3000

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 종목 목록을 하나씩 순서대로 조회한다.
 *
 * 날씨와 달리 병렬(Promise.allSettled)로 부르지 않는 이유:
 * Alpha Vantage는 짧은 시간에 몰린 요청을 거절하고
 * "Please consider spreading out your free API requests more sparingly" 라고 답한다.
 * 게다가 그 안내가 HTTP 200 본문으로 오기 때문에 429처럼 보이지도 않아 원인을 찾기 어렵다.
 *
 * @returns {{ loaded: object[], failures: object[] }} 성공 목록과 실패 목록
 */
const fetchInSequence = async (items) => {
  const loaded = []
  const failures = []

  for (const [index, item] of items.entries()) {
    try {
      loaded.push(await fetchStockQuote(item))
    } catch (error) {
      failures.push({ item, reason: error })
    }

    // 마지막 종목 뒤에는 기다릴 이유가 없다.
    if (index < items.length - 1) {
      await delay(REQUEST_GAP_MS)
    }
  }

  return { loaded, failures }
}

/**
 * 주식 시세 스토어.
 *
 * 무료 플랜이 분당 5회 · 하루 25회뿐이라 저장이 특히 중요하다.
 * 종목이 5개이므로 한 번 갱신할 때마다 5회를 쓴다. 즉 하루에 다섯 번만 새로 받을 수 있다.
 * 그래서 화면을 열 때마다 갱신하지 않고, 저장분이 있으면 그것을 먼저 보여준다.
 */
export const useStockStore = defineStore('stock', () => {
  // ---- state ----
  const restored = loadState(CACHE_KEY, null)
  const hasValidCache = Array.isArray(restored?.list) && restored.list.length > 0

  const quotes = ref(hasValidCache ? restored.list : [])
  const fetchedAt = ref(hasValidCache ? restored.savedAt : null)
  const isStale = ref(hasValidCache)

  const isLoading = ref(false)
  const errorMessage = ref('')
  const failedSymbols = ref([])

  // ---- getters ----
  const hasData = computed(() => quotes.value.length > 0)

  // 등락률이 큰 순으로 정렬한다. 원본 배열을 sort하면 state가 변형되므로 복사본을 쓴다.
  const sortedByChange = computed(() =>
    [...quotes.value].sort((a, b) => b.changePercent - a.changePercent),
  )

  // 오른 종목과 내린 종목이 각각 몇 개인지. 화면 상단 요약에 쓴다.
  const risingCount = computed(() => quotes.value.filter((q) => q.change > 0).length)
  const fallingCount = computed(() => quotes.value.filter((q) => q.change < 0).length)

  // ---- actions ----
  const loadQuotes = async () => {
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = ''
    failedSymbols.value = []

    try {
      // 1차 조회
      const first = await fetchInSequence(stockSymbols)

      let loaded = first.loaded
      let failures = first.failures

      /**
       * 실패한 종목만 한 번 더 시도한다.
       *
       * 위 안내대로 간격을 두어도 간헐적으로 한두 종목이 거절당한다.
       * 거절된 종목을 잠시 뒤 단독으로 부르면 정상 응답하므로, 한 번의 재시도로 대부분 채워진다.
       * 하루 한도가 25회뿐이라 재시도는 딱 한 번만 한다.
       */
      if (failures.length > 0) {
        console.warn(
          `[stockStore] ${failures.map((f) => f.item.symbol).join(', ')} 재시도합니다.`,
        )
        await delay(RETRY_DELAY_MS)

        const retried = await fetchInSequence(failures.map((failure) => failure.item))
        loaded = [...loaded, ...retried.loaded]
        failures = retried.failures
      }

      if (loaded.length === 0) {
        console.error('[stockStore] 모든 종목 조회에 실패했습니다.', failures[0].reason)

        if (hasData.value) {
          isStale.value = true
          return
        }
        errorMessage.value = describeStockApiError(failures[0].reason)
        return
      }

      quotes.value = loaded
      failedSymbols.value = failures.map((failure) => failure.item.symbol)
      fetchedAt.value = Date.now()
      isStale.value = false
      saveState(CACHE_KEY, { savedAt: fetchedAt.value, list: loaded })
    } finally {
      isLoading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (isLoading.value) {
      return
    }
    // 주식은 호출 한도가 빠듯하므로, 저장분이 있으면 오래됐더라도 자동 갱신하지 않는다.
    // 최신 값이 필요하면 사용자가 새로고침 버튼을 눌러 직접 요청한다.
    if (hasData.value) {
      return
    }
    await loadQuotes()
  }

  return {
    quotes,
    fetchedAt,
    isStale,
    isLoading,
    errorMessage,
    failedSymbols,
    hasData,
    sortedByChange,
    risingCount,
    fallingCount,
    loadQuotes,
    ensureLoaded,
  }
})
