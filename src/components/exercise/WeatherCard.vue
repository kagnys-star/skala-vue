<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { getWeatherIconUrl } from '@/utils/weatherFormat'

const props = defineProps({
  // 선택된(혹은 목록의) 도시 객체 전체를 통째로 전달받는다.
  cityItem: {
    type: Object,
    required: true,
  },
  // 북마크 여부는 별도 배열(bookmarkedIds)로 관리되므로, 부모가 계산해서 내려준다.
  isBookmarked: {
    type: Boolean,
    default: false,
  },
})

// 요구사항: 카드 선택은 select-card, 상세보기는 click-detail.
// 북마크 토글은 부모(bookmarkedIds)가 실제 상태를 갖고 있어 별도 emit이 필요하다.
//
// click-detail은 원래 표시용 문자열(도시명, 날씨)을 넘겼지만,
// 이제 부모가 상세 페이지로 라우팅해야 하므로 식별자인 id만 넘긴다.
// '무엇을 눌렀는지'만 알리고 '무엇을 할지'는 부모가 정하는 것이 자식 컴포넌트의 올바른 역할이다.
const emit = defineEmits(['select-card', 'click-detail', 'toggle-bookmark'])

// 단위 설정은 전역 값이므로 부모에게 props로 받지 않고 스토어에서 직접 읽는다.
const configStore = useConfigStore()

// 원본(props.cityItem.temp)은 항상 섭씨이고, 화면에 뿌릴 값만 여기서 변환한다.
// unit이 바뀌면 computed가 자동으로 다시 계산되어 카드 전체가 갱신된다.
const displayTemp = computed(() => configStore.convertTemp(props.cityItem.temp))

/**
 * 기온 구간을 하나의 이름으로 정리한다.
 *
 * 주의: 판정은 변환된 값이 아니라 '섭씨 원본'으로 해야 한다.
 * 화씨로 바꾼 값(82 등)을 25/28과 비교하면 모든 도시가 무더움으로 나온다.
 */
const tempLevel = computed(() => {
  const celsius = props.cityItem.temp
  if (celsius >= 28) return { key: 'hot', label: '무더움', mark: '🔥' }
  if (celsius >= 25) return { key: 'warm', label: '더움', mark: '🌡' }
  return { key: 'cool', label: '선선함', mark: '❄' }
})
</script>

<template>
  <article
    class="weather-card"
    :class="`level-${tempLevel.key}`"
    @click="emit('select-card', cityItem)"
  >
    <header class="card-top">
      <h4 class="city-name">
        {{ cityItem.name }}
      </h4>

      <!-- .stop: 카드 클릭(select-card)이 같이 발생하는 것을 막는다 -->
      <button
        class="star-btn"
        :class="{ 'is-on': isBookmarked }"
        :aria-label="isBookmarked ? '북마크 해제' : '북마크 추가'"
        @click.stop="emit('toggle-bookmark', cityItem)"
      >
        {{ isBookmarked ? '★' : '☆' }}
      </button>
    </header>

    <div class="card-main">
      <!-- 응답에 함께 오던 아이콘 코드를 이미지로 보여준다. (추가 호출 없음)
           alt에 날씨 설명을 넣어 이미지가 안 뜨거나 화면 낭독 시에도 의미가 전달되게 한다. -->
      <img
        class="card-icon"
        :src="getWeatherIconUrl(cityItem.icon)"
        :alt="cityItem.status"
        loading="lazy"
      >

      <div class="temp-block">
        <p class="temp-main tabular">
          {{ displayTemp }}<span class="temp-unit">{{ configStore.unitSymbol }}</span>
        </p>
        <p class="temp-feels tabular">
          체감 {{ configStore.convertTemp(cityItem.feelsLike) }}{{ configStore.unitSymbol }}
        </p>
      </div>

      <span class="level-chip">
        {{ tempLevel.mark }} {{ tempLevel.label }}
      </span>
    </div>

    <p class="card-status">
      {{ cityItem.status }}
    </p>

    <footer class="card-foot">
      <span class="card-meta tabular">
        💧 {{ cityItem.humidity }}% · 💨 {{ cityItem.wind }}m/s
      </span>

      <button
        class="detail-btn"
        @click.stop="emit('click-detail', cityItem.id)"
      >
        상세보기 →
      </button>
    </footer>
  </article>
</template>

<style scoped>
.weather-card {
  position: relative;
  padding: 14px 16px 12px;
  overflow: hidden;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--ease);
}

/* 카드 왼쪽에 기온 구간을 나타내는 색 띠를 둔다.
   숫자를 읽지 않아도 목록을 훑으며 더운 곳을 찾을 수 있다. */
.weather-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  content: '';
}

.level-hot::before {
  background-color: var(--hot);
}

.level-warm::before {
  background-color: var(--warm);
}

.level-cool::before {
  background-color: var(--cool);
}

.weather-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.city-name {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
}

.star-btn {
  padding: 0 4px;
  background: none;
  border: none;
  font-size: 17px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--ease);
}

.star-btn:hover {
  transform: scale(1.15);
}

.star-btn.is-on {
  color: var(--warm);
}

.card-main {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 2px;
}

.card-icon {
  width: 54px;
  height: 54px;
  margin-left: -6px;
}

.temp-block {
  flex: 1;
}

.temp-main {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.temp-unit {
  margin-left: 1px;
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--text-muted);
}

.temp-feels {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.level-chip {
  padding: 4px 9px;
  border-radius: 999px;
  font-size: var(--fs-xs);
  font-weight: 600;
  white-space: nowrap;
}

.level-hot .level-chip {
  background-color: #fdeceb;
  color: var(--hot);
}

.level-warm .level-chip {
  background-color: #fdf3e3;
  color: var(--warm);
}

.level-cool .level-chip {
  background-color: #e8f3fc;
  color: var(--cool);
}

.card-status {
  margin: 4px 0 0;
  font-size: var(--fs-md);
  color: var(--text-soft);
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.card-meta {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.detail-btn {
  padding: 5px 10px;
  background-color: var(--surface-sunken);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text-soft);
  cursor: pointer;
  transition: all var(--ease);
}

.detail-btn:hover {
  background-color: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}
</style>
