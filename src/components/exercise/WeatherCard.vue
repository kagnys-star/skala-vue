<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

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
</script>

<template>
  <div class="weather-card" @click="emit('select-card', cityItem)">
    <div class="card-info">
      <p class="city-name">
        {{ cityItem.name }} ({{ cityItem.status }})
        <span v-show="isBookmarked" class="star">⭐</span>
      </p>
      <p class="city-temp">현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p class="city-detail">습도: {{ cityItem.humidity }}% / 풍속: {{ cityItem.wind }}m/s</p>

      <!-- 주의: 더움/선선함 판정은 변환된 값이 아니라 '섭씨 원본'으로 해야 한다.
           화씨로 바꾼 값(82 등)을 25/28과 비교하면 모든 도시가 무더움으로 나온다. -->
      <span v-if="cityItem.temp >= 28" class="badge badge-very-hot">🔥 무더움 (28도 이상)</span>
      <span v-else-if="cityItem.temp >= 25" class="badge badge-hot">🌡 더움 (25도 이상)</span>
      <span v-else class="badge badge-cool">❄ 선선함 (25도 미만)</span>
    </div>

    <div class="card-actions">
      <!-- .stop: 카드 클릭(select-card)이 같이 발생하는 것을 막는다 -->
      <button class="detail-btn" @click.stop="emit('click-detail', cityItem.id)">상세보기</button>

      <label class="bookmark-label" @click.stop>
        <input type="checkbox" :checked="isBookmarked" @change="emit('toggle-bookmark', cityItem)" />
        북마크
      </label>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 12px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
}

.weather-card:last-child {
  margin-bottom: 0;
}

.weather-card:hover {
  border-color: #409eff;
}

.city-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: bold;
}

.city-temp {
  margin: 0 0 2px;
  font-size: 13px;
  color: #606266;
}

.city-detail {
  margin: 0 0 8px;
  font-size: 12px;
  color: #909399;
}

.star {
  font-size: 12px;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #ffffff;
}

.badge-very-hot {
  background-color: #f56c6c;
}

.badge-hot {
  background-color: #e6a23c;
}

.badge-cool {
  background-color: #409eff;
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.detail-btn {
  padding: 6px 12px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.detail-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.bookmark-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.bookmark-label input {
  cursor: pointer;
}
</style>
