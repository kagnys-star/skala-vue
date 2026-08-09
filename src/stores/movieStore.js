import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchPopularMovies, searchMovies, describeMovieApiError } from '@/api/movieApi'
import { loadState, saveState } from '@/utils/storage'

const CACHE_KEY = 'movie-cache'

/**
 * 영화 스토어.
 *
 * 날씨 스토어와 같은 구조를 따른다. 목록 · 로딩 · 오류를 한곳에서 들고,
 * 마지막으로 성공한 결과를 저장해 두었다가 갱신에 실패하면 그것을 대신 보여준다.
 * 구조를 맞춰 두면 화면 쪽에서 같은 컴포넌트(AsyncStatePanel, StaleDataNotice)를 재사용할 수 있다.
 */
export const useMovieStore = defineStore('movie', () => {
  // ---- state ----
  const restored = loadState(CACHE_KEY, null)
  const hasValidCache = Array.isArray(restored?.list) && restored.list.length > 0

  // 인기 목록 (검색하지 않았을 때 보여줄 기본 목록)
  const popularMovies = ref(hasValidCache ? restored.list : [])
  const fetchedAt = ref(hasValidCache ? restored.savedAt : null)
  const isStale = ref(hasValidCache)

  const searchResults = ref([])
  const searchKeyword = ref('')

  const isLoading = ref(false)
  const errorMessage = ref('')

  // ---- getters ----
  const hasData = computed(() => popularMovies.value.length > 0)

  // 검색 중이면 검색 결과를, 아니면 인기 목록을 보여준다.
  const visibleMovies = computed(() => {
    return searchKeyword.value.trim() === '' ? popularMovies.value : searchResults.value
  })

  // ---- actions ----
  const loadPopular = async () => {
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      popularMovies.value = await fetchPopularMovies()
      fetchedAt.value = Date.now()
      isStale.value = false
      saveState(CACHE_KEY, { savedAt: fetchedAt.value, list: popularMovies.value })
    } catch (error) {
      console.error('[movieStore] 인기 영화 조회 실패', error)

      // 저장분이 있으면 화면을 비우지 않는다.
      if (hasData.value) {
        isStale.value = true
        return
      }
      errorMessage.value = describeMovieApiError(error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 제목으로 검색한다.
   * 검색어를 지우면 호출 없이 인기 목록으로 되돌아간다.
   */
  const search = async (keyword) => {
    searchKeyword.value = keyword

    if (keyword.trim() === '') {
      searchResults.value = []
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      searchResults.value = await searchMovies(keyword)
    } catch (error) {
      console.error('[movieStore] 영화 검색 실패', error)
      errorMessage.value = describeMovieApiError(error)
      searchResults.value = []
    } finally {
      isLoading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (isLoading.value) {
      return
    }
    if (hasData.value && !isStale.value) {
      return
    }
    await loadPopular()
  }

  return {
    popularMovies,
    searchResults,
    searchKeyword,
    fetchedAt,
    isStale,
    isLoading,
    errorMessage,
    hasData,
    visibleMovies,
    loadPopular,
    search,
    ensureLoaded,
  }
})
