<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useMovieStore } from '@/stores/movieStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import AsyncStatePanel from '@/components/exercise/AsyncStatePanel.vue'
import StaleDataNotice from '@/components/exercise/StaleDataNotice.vue'

const movieStore = useMovieStore()

// 입력창의 값은 이 화면의 관심사이므로 여기서 갖는다.
const keyword = ref('')

onMounted(() => movieStore.ensureLoaded())

/**
 * 타이핑할 때마다 검색 API를 부르면 글자 수만큼 호출이 나간다.
 * 마지막 입력 후 400ms 동안 조용할 때만 실제로 호출한다. (디바운스)
 */
let debounceId = null

watch(keyword, (value) => {
  clearTimeout(debounceId)
  debounceId = setTimeout(() => movieStore.search(value), 400)
})

// 별점 표시용. 10점 만점을 5개 별로 환산해 채운 개수를 구한다.
const toStarCount = (rating) => Math.round(rating / 2)
</script>

<template>
  <section class="movie-view">
    <StaleDataNotice
      :is-stale="movieStore.isStale"
      :fetched-at="movieStore.fetchedAt"
      @refresh="movieStore.loadPopular"
    />

    <RouterLink
      class="back-link"
      :to="{ name: 'weather-home' }"
    >
      ← 날씨 대시보드로
    </RouterLink>

    <BaseDashboardCard>
      <template #header>
        <h3 class="slot-card-title">
          🎬 {{ movieStore.searchKeyword.trim() ? '검색 결과' : '인기 영화' }}
        </h3>
        <span class="count-badge">{{ movieStore.visibleMovies.length }}편</span>
      </template>

      <div class="input-wrap">
        <span
          class="input-icon"
          aria-hidden="true"
        >🔍</span>
        <input
          v-model="keyword"
          class="search-input"
          type="search"
          placeholder="영화 제목을 검색하세요"
        >
      </div>

      <AsyncStatePanel
        :is-loading="movieStore.isLoading"
        :error-message="movieStore.errorMessage"
        loading-text="영화 정보를 불러오는 중입니다..."
        error-title="영화 정보를 가져오지 못했습니다"
        @retry="movieStore.loadPopular"
      />

      <template v-if="!movieStore.isLoading && !movieStore.errorMessage">
        <div
          v-if="movieStore.visibleMovies.length > 0"
          class="movie-grid scroll-area"
        >
          <article
            v-for="movie in movieStore.visibleMovies"
            :key="movie.id"
            class="movie-card"
          >
            <!-- 포스터가 없는 작품도 있으므로 대체 표시를 준비한다 -->
            <img
              v-if="movie.posterUrl"
              class="poster"
              :src="movie.posterUrl"
              :alt="`${movie.title} 포스터`"
              loading="lazy"
            >
            <div
              v-else
              class="poster poster-empty"
            >
              🎞️
            </div>

            <div class="movie-body">
              <h4 class="movie-title">
                {{ movie.title }}
              </h4>

              <p class="movie-meta tabular">
                {{ movie.releaseDate ?? '개봉일 미정' }}
              </p>

              <p class="movie-rating">
                <span class="stars">{{ '★'.repeat(toStarCount(movie.rating)) }}</span>
                <span class="tabular">{{ movie.rating }}</span>
                <span class="vote tabular">({{ movie.voteCount }}명)</span>
              </p>
            </div>
          </article>
        </div>

        <p
          v-else
          class="empty-result"
        >
          '{{ movieStore.searchKeyword }}' 와(과) 일치하는 영화가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>
  </section>
</template>

<style scoped>
.movie-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back-link {
  align-self: flex-start;
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--text-soft);
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
}

.slot-card-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
}

.count-badge {
  padding: 3px 10px;
  background-color: var(--accent-soft);
  border-radius: 999px;
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--accent);
}

.input-wrap {
  position: relative;
  margin-bottom: 14px;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  font-size: var(--fs-md);
  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 14px 11px 38px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: var(--fs-base);
  color: var(--text);
  transition: all var(--ease);
}

.search-input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  max-height: 620px;
  padding-right: 4px;
}

.movie-card {
  overflow: hidden;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: all var(--ease);
}

.movie-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

/* 포스터 비율(2:3)을 고정해 두면 이미지가 늦게 와도 칸이 흔들리지 않는다 */
.poster {
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  background-color: var(--surface-sunken);
}

.poster-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.movie-body {
  padding: 10px 12px 12px;
}

.movie-title {
  margin: 0;
  font-size: var(--fs-md);
  font-weight: 700;
  line-height: 1.4;
}

.movie-meta {
  margin: 3px 0 0;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.movie-rating {
  display: flex;
  gap: 4px;
  align-items: center;
  margin: 6px 0 0;
  font-size: var(--fs-sm);
  font-weight: 600;
}

.stars {
  color: var(--warm);
  letter-spacing: -1px;
}

.vote {
  font-weight: 400;
  color: var(--text-muted);
}

.empty-result {
  margin: 0;
  padding: 44px 16px;
  background-color: var(--surface-sunken);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--fs-md);
  color: var(--text-muted);
  text-align: center;
}
</style>
