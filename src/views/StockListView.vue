<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useStockStore } from '@/stores/stockStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import AsyncStatePanel from '@/components/exercise/AsyncStatePanel.vue'
import StaleDataNotice from '@/components/exercise/StaleDataNotice.vue'

const stockStore = useStockStore()

onMounted(() => stockStore.ensureLoaded())

// 등락에 따라 색과 기호를 정한다. 0은 보합으로 따로 표시한다.
const changeClass = (change) => {
  if (change > 0) return 'is-up'
  if (change < 0) return 'is-down'
  return 'is-flat'
}

const changeMark = (change) => {
  if (change > 0) return '▲'
  if (change < 0) return '▼'
  return '−'
}

// 미국 달러 시세라 소수점 두 자리로 맞춘다.
const formatPrice = (value) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <section class="stock-view">
    <StaleDataNotice
      :is-stale="stockStore.isStale"
      :fetched-at="stockStore.fetchedAt"
      @refresh="stockStore.loadQuotes"
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
          📈 주요 종목 시세
        </h3>
        <span class="count-badge tabular">
          상승 {{ stockStore.risingCount }} · 하락 {{ stockStore.fallingCount }}
        </span>
      </template>

      <AsyncStatePanel
        :is-loading="stockStore.isLoading"
        :error-message="stockStore.errorMessage"
        loading-text="시세를 불러오는 중입니다..."
        error-title="시세를 가져오지 못했습니다"
        @retry="stockStore.loadQuotes"
      />

      <template v-if="!stockStore.isLoading && !stockStore.errorMessage">
        <ul class="stock-list">
          <li
            v-for="quote in stockStore.sortedByChange"
            :key="quote.symbol"
            class="stock-row"
            :class="changeClass(quote.change)"
          >
            <div class="stock-head">
              <span class="stock-name">{{ quote.name }}</span>
              <span class="stock-symbol">{{ quote.symbol }}</span>
            </div>

            <div class="stock-price tabular">
              <strong>${{ formatPrice(quote.price) }}</strong>
              <span class="stock-change">
                {{ changeMark(quote.change) }} {{ formatPrice(Math.abs(quote.change)) }}
                ({{ quote.changePercent.toFixed(2) }}%)
              </span>
            </div>

            <div class="stock-meta tabular">
              고가 {{ formatPrice(quote.high) }} · 저가 {{ formatPrice(quote.low) }}
              <span class="stock-day">{{ quote.tradingDay }} 종가 기준</span>
            </div>
          </li>
        </ul>

        <p
          v-if="stockStore.failedSymbols.length > 0"
          class="partial-warning"
        >
          {{ stockStore.failedSymbols.join(', ') }} 시세를 불러오지 못했습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <p class="stock-note">
      무료 플랜은 하루 25회까지만 조회할 수 있어, 화면을 열 때마다 새로 받지 않고
      저장된 값을 먼저 보여줍니다. 최신 시세가 필요하면 새로고침을 눌러 주세요.
    </p>
  </section>
</template>

<style scoped>
.stock-view {
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

.stock-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.stock-row {
  position: relative;
  padding: 14px 16px;
  overflow: hidden;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: all var(--ease);
}

/* 왼쪽 색 띠로 상승·하락을 한눈에 구분한다 */
.stock-row::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  content: '';
}

.is-up::before {
  background-color: var(--hot);
}

.is-down::before {
  background-color: var(--cool);
}

.is-flat::before {
  background-color: var(--border-strong);
}

.stock-row:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.stock-head {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.stock-name {
  font-size: var(--fs-base);
  font-weight: 700;
}

.stock-symbol {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.stock-price {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-top: 4px;
}

.stock-price strong {
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stock-change {
  font-size: var(--fs-md);
  font-weight: 600;
}

/* 한국 관행대로 상승은 붉은색, 하락은 파란색으로 표시한다 */
.is-up .stock-change {
  color: var(--hot);
}

.is-down .stock-change {
  color: var(--cool);
}

.is-flat .stock-change {
  color: var(--text-muted);
}

.stock-meta {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.stock-day {
  display: block;
  font-size: var(--fs-xs);
}

.partial-warning {
  margin: 12px 0 0;
  padding: 10px;
  background-color: #fdf6ea;
  border: 1px solid #f6e4c8;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  color: var(--warm);
  text-align: center;
}

.stock-note {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--text-muted);
  text-align: center;
}

.is-night .stock-note {
  color: rgba(255, 255, 255, 0.55);
}
</style>
