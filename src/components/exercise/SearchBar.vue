<script setup>
import { ref, computed } from 'vue'
import { similarity } from '@/utils/hangulSearch'

const props = defineProps({
  // 부모가 소유한 검색어. props는 읽기 전용이므로 자식이 직접 바꾸지 않는다.
  query: {
    type: String,
    default: '',
  },
  // 추천 후보를 계산할 원본 도시 목록 (부모가 소유한 반응형 데이터)
  cityList: {
    type: Array,
    default: () => [],
  },
})

// 검색어가 바뀌면 update-query 이벤트로 부모에게 알린다. (실제 상태 변경은 부모가 수행)
const emit = defineEmits(['update-query'])

// 드롭다운 개폐는 검색창 내부 사정이므로 자식이 직접 갖는다.
const isOpen = ref(false)

// 추천 목록도 검색창의 관심사이므로 자식에서 계산한다.
const suggestions = computed(() => {
  const keyword = props.query.trim()

  if (keyword === '') {
    return []
  }

  return props.cityList
    .map((city) => ({ city, score: similarity(keyword, city.name) }))
    .filter((item) => item.score >= 0.5) // 너무 동떨어진 도시는 제외
    .sort((a, b) => b.score - a.score) // 점수 높은 순
    .slice(0, 5)
    .map((item) => item.city) // 점수는 정렬에만 쓰고 화면에는 도시 정보만 전달
})

const handleInput = (event) => {
  emit('update-query', event.target.value)
  isOpen.value = true
}

const selectSuggestion = (cityName) => {
  emit('update-query', cityName)
  isOpen.value = false
}
</script>

<template>
  <div class="search-box">
    <input
      class="search-input"
      type="text"
      placeholder="검색할 도시 이름 입력"
      :value="query"
      @input="handleInput"
      @focus="isOpen = true"
      @blur="isOpen = false"
      @keyup.esc="isOpen = false"
    />

    <ul v-if="isOpen && suggestions.length > 0" class="suggestion-dropdown">
      <li v-for="city in suggestions" :key="city.id">
        <!-- mousedown.prevent: 클릭 순간 input의 blur가 먼저 발생해 목록이 닫히는 것을 막는다 -->
        <button class="suggestion-item" @mousedown.prevent @click="selectSuggestion(city.name)">
          <span class="suggestion-name">{{ city.name }}</span>
          <span class="suggestion-meta">{{ city.status }} · {{ city.temp }}°C</span>
        </button>
      </li>
    </ul>

    <p class="search-echo">검색 중인 도시: {{ query }}</p>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.search-echo {
  margin: 8px 0 0;
  font-size: 12px;
  color: #606266;
}

.suggestion-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 10;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: dropdown-open 0.18s ease-out;
}

@keyframes dropdown-open {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  font-size: 13px;
  color: #303133;
  text-align: left;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.suggestion-meta {
  font-size: 11px;
  color: #909399;
}
</style>
