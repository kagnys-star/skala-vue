<script setup>
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue'
import { similarity } from '@/utils/hangulSearch'
import { useConfigStore } from '@/stores/configStore'

// 추천 목록에도 기온이 보이므로, 목록 카드와 단위가 어긋나지 않도록 같은 스토어를 쓴다.
const configStore = useConfigStore()

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

/**
 * 드롭다운 UI 상태.
 *
 * isOpen(열림 여부)과 highlightedIndex(방향키로 짚은 항목)는 따로 노는 값이 아니라
 * 닫힐 때·검색어가 바뀔 때 항상 '같이' 초기화되는 한 덩어리다.
 * ref 두 개로 나누면 두 곳에서 매번 나란히 대입해야 하고, 하나만 리셋을 빠뜨리는
 * 실수가 생기기 쉽다. reactive로 묶어 두면 close()처럼 한 번의 대입으로 둘 다 리셋된다.
 */
const dropdown = reactive({
  isOpen: false,
  // -1은 '아무 것도 짚지 않음'을 뜻한다. 0 이상이면 suggestions의 인덱스다.
  highlightedIndex: -1,
})

const closeDropdown = () => {
  dropdown.isOpen = false
  dropdown.highlightedIndex = -1
}

/**
 * 드롭다운을 화면 어디에 그릴지 계산한 값.
 *
 * top/left/width는 항상 같은 순간에 같이 다시 계산되고 같이 쓰이는 값이라 reactive로 묶었다.
 * (하나만 갱신되면 드롭다운이 입력창과 어긋나 보인다)
 */
const dropdownPosition = reactive({ top: 0, left: 0, width: 0 })

// 위치를 계산하려면 실제 입력창 DOM이 필요하므로 템플릿 ref로 참조를 받는다.
const inputWrapRef = ref(null)

/**
 * 입력창 바로 아래에 드롭다운이 오도록 좌표를 다시 잰다.
 *
 * 드롭다운을 <Teleport>로 body 바깥에 그리는 이유:
 * 이 검색창은 카드(BaseDashboardCard) 안에 있고, 그 카드는 backdrop-filter를 쓴다.
 * backdrop-filter가 있는 요소는 브라우저가 새로운 '쌓임 맥락(stacking context)'을 만들어서,
 * 드롭다운에 아무리 큰 z-index를 줘도 카드 안에서만 유효하다.
 * 그 결과 DOM에서 뒤에 오는 '지역별 날씨 현황' 카드가 검색창의 드롭다운을 덮어 버린다.
 * (z-index는 '같은 쌓임 맥락 안에서'만 서로 비교된다 — 부모가 다른 쌓임 맥락에 있으면
 * 자식의 z-index를 아무리 올려도 다른 쌓임 맥락의 형제 요소를 앞지를 수 없다)
 *
 * body로 위치를 옮기면 이 카드의 쌓임 맥락에서 완전히 벗어나므로 항상 맨 위에 그려진다.
 * 다만 body 기준으로 그리면 더 이상 input 옆에 자동으로 붙지 않으므로, 좌표를 직접 계산해야 한다.
 */
const updateDropdownPosition = () => {
  if (!inputWrapRef.value) {
    return
  }
  const rect = inputWrapRef.value.getBoundingClientRect()
  dropdownPosition.top = rect.bottom + 6
  dropdownPosition.left = rect.left
  dropdownPosition.width = rect.width
}

/**
 * 열려 있는 동안에는 매 프레임 위치를 다시 잰다.
 * 그러지 않으면 페이지를 스크롤하거나 창 크기를 바꿨을 때 드롭다운만 그 자리에 멈춰
 * 입력창과 어긋난다.
 *
 * 'scroll' 이벤트를 듣는 대신 requestAnimationFrame으로 계속 다시 재는 이유:
 * 이 카드 목록은 내부 스크롤(.scroll-area)도 갖고 있고, 도시 카드가 늦게 도착해
 * 레이아웃이 밀리는 경우도 있다. 그런 변화를 전부 이벤트로 잡으려면
 * scroll/resize에 더해 ResizeObserver, MutationObserver까지 여러 개를 조합해야 한다.
 * 반면 rAF는 '무엇이 바뀌었는지'와 상관없이 화면이 다시 그려질 때마다 좌표를 확인하므로
 * 원인을 하나하나 따지지 않아도 항상 맞는 위치를 보장한다.
 * 드롭다운이 열려 있는 짧은 동안에만 도는 루프라 비용도 무시할 수준이다.
 */
let positionLoopId = null

const stopPositionLoop = () => {
  if (positionLoopId !== null) {
    cancelAnimationFrame(positionLoopId)
    positionLoopId = null
  }
}

const runPositionLoop = () => {
  updateDropdownPosition()
  positionLoopId = requestAnimationFrame(runPositionLoop)
}

watch(
  () => dropdown.isOpen,
  (isOpen) => {
    if (isOpen) {
      runPositionLoop()
    } else {
      stopPositionLoop()
    }
  },
)

// 드롭다운이 열린 채로 화면을 벗어나는 경우를 대비해 루프를 반드시 정리한다.
onBeforeUnmount(stopPositionLoop)

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

// 검색어가 바뀌어 추천 목록이 달라지면 이전 하이라이트 인덱스는 더 이상 의미가 없다.
// (예: 3번째를 짚은 채로 글자를 더 치면 목록이 2개로 줄어 인덱스가 범위를 벗어난다)
watch(suggestions, () => {
  dropdown.highlightedIndex = -1
})

const handleInput = (event) => {
  emit('update-query', event.target.value)
  dropdown.isOpen = true
}

const selectSuggestion = (cityName) => {
  emit('update-query', cityName)
  closeDropdown()
}

/**
 * 방향키로 추천 목록을 훑고 Enter로 고른다.
 * 마우스 없이 검색 → 화살표 → Enter 흐름이 되도록 하는 키보드 접근성 처리다.
 */
const handleKeydown = (event) => {
  if (!dropdown.isOpen || suggestions.value.length === 0) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault() // 커서가 입력창 텍스트 끝으로 이동하는 기본 동작을 막는다
    dropdown.highlightedIndex = (dropdown.highlightedIndex + 1) % suggestions.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const count = suggestions.value.length
    dropdown.highlightedIndex = (dropdown.highlightedIndex - 1 + count) % count
  } else if (event.key === 'Enter' && dropdown.highlightedIndex !== -1) {
    event.preventDefault()
    selectSuggestion(suggestions.value[dropdown.highlightedIndex].name)
  }
}
</script>

<template>
  <div class="search-box">
    <div
      ref="inputWrapRef"
      class="input-wrap"
    >
      <span
        class="input-icon"
        aria-hidden="true"
      >🔍</span>
      <input
        class="search-input"
        type="search"
        placeholder="도시 이름을 입력하세요 (예: 부산, ㅂㅅ) · ↑↓로 탐색, Enter로 선택"
        :value="query"
        @input="handleInput"
        @focus="dropdown.isOpen = true"
        @blur="closeDropdown"
        @keydown="handleKeydown"
      >
    </div>

    <!-- body로 옮겨 그려서, 이 카드의 backdrop-filter 쌓임 맥락에 갇히지 않고 항상 맨 위에 보인다 -->
    <Teleport to="body">
      <ul
        v-if="dropdown.isOpen && suggestions.length > 0"
        class="suggestion-dropdown"
        :style="{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }"
      >
        <li
          v-for="(city, index) in suggestions"
          :key="city.id"
        >
          <!-- mousedown.prevent: 클릭 순간 input의 blur가 먼저 발생해 목록이 닫히는 것을 막는다 -->
          <button
            class="suggestion-item"
            :class="{ 'is-highlighted': index === dropdown.highlightedIndex }"
            @mousedown.prevent
            @mouseenter="dropdown.highlightedIndex = index"
            @click="selectSuggestion(city.name)"
          >
            <span class="suggestion-name">{{ city.name }}</span>
            <span class="suggestion-meta">
              {{ city.status }} · {{ configStore.convertTemp(city.temp) }}{{ configStore.unitSymbol }}
            </span>
          </button>
        </li>
      </ul>
    </Teleport>

    <p
      v-if="query"
      class="search-echo"
    >
      검색 중: <strong>{{ query }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}

.input-wrap {
  position: relative;
}

/* 아이콘을 입력창 안쪽에 겹쳐 두고, 입력 글자는 그만큼 오른쪽에서 시작하게 한다 */
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

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent);
  outline: none;
  /* 테두리를 두껍게 만드는 대신 바깥으로 번지는 그림자를 써야 글자가 밀리지 않는다 */
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.search-echo {
  margin: 9px 0 0;
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

.search-echo strong {
  color: var(--accent);
}

/* body로 텔레포트되므로 top/left/width는 script의 dropdownPosition에서 인라인으로 정해진다.
   여기서는 fixed로 위치를 고정할 뿐, 좌표 자체는 이 CSS가 정하지 않는다. */
.suggestion-dropdown {
  position: fixed;
  z-index: 1000;
  margin: 0;
  padding: 5px;
  list-style: none;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
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
  padding: 9px 11px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--fs-md);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: all var(--ease);
}

.suggestion-item:hover,
.suggestion-item.is-highlighted {
  background-color: var(--accent-soft);
  color: var(--accent);
}

.suggestion-name {
  font-weight: 600;
}

.suggestion-meta {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
</style>
