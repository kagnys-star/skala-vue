import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { stockSymbols, fetchStockQuote, describeStockApiError } from '@/api/stockApi'
import { loadState, saveState } from '@/utils/storage'

const CACHE_KEY = 'stock-cache'

/**
 * 주식 시세 스토어.
 *
 * 무료 플랜이 하루 25회뿐이라 저장이 특히 중요하다.
 * 종목이 6개이므로 한 번 갱신할 때마다 6회를 쓴다. 즉 하루에 네 번 정도만 새로 받을 수 있다.
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
      const results = await Promise.allSettled(stockSymbols.map((item) => fetchStockQuote(item)))

      const loaded = []
      const failures = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded.push(result.value)
        } else {
          failures.push({ item: stockSymbols[index], reason: result.reason })
        }
      })

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
