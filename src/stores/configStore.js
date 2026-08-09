import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { loadState, saveState } from '@/utils/storage'

const STORAGE_KEY = 'temperature-unit'

/**
 * 앱 전역 표시 설정 스토어.
 *
 * 온도 단위는 상단 툴바, 목록 카드, 검색 추천, 상세 페이지가 '동시에' 참고해야 한다.
 * props로 내려보내려면 App → RouterView → View → Card 까지 아무 관심도 없는 컴포넌트들을
 * 전부 거쳐야 하므로(prop drilling), 이런 값은 스토어에 두는 편이 맞다.
 *
 * 작성 방식) Composition API와 같은 문법으로 쓰는 Setup Store 형태다.
 * 옵션 방식의 state / getters / actions 와는 아래처럼 1:1로 대응된다.
 *   ref()      → state   (바뀌는 값)
 *   computed() → getters (state로부터 파생되는 값)
 *   function   → actions (state를 바꾸는 동작)
 */
export const useConfigStore = defineStore('config', () => {
  // ---- state ----
  // 'celsius' | 'fahrenheit'. 원본 데이터는 항상 섭씨이고, 이 값은 '어떻게 보여줄지'만 결정한다.
  // 새로고침해도 설정이 유지되도록 저장된 값에서 시작한다.
  // 저장소 값을 그대로 믿지 않고 아는 값일 때만 받아들인다. (직접 수정될 수 있는 곳이다)
  const restoredUnit = loadState(STORAGE_KEY, 'celsius')
  const unit = ref(restoredUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius')

  // ---- getters ----
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '°C' : '°F'))

  const unitLabel = computed(() => (unit.value === 'celsius' ? '섭씨' : '화씨'))

  /**
   * 섭씨 원본 값을 현재 단위에 맞춰 변환한다.
   *
   * getter는 원래 인자를 받지 못하지만, '함수를 반환하는 getter'로 만들면 인자를 넘길 수 있다.
   * 변환 공식을 여기 한 곳에만 두어 목록/검색/상세에서 같은 계산이 반복되는 것을 막는다.
   */
  const convertTemp = computed(() => {
    return (celsiusTemp) => {
      if (unit.value === 'fahrenheit') {
        return Math.round((celsiusTemp * 9) / 5 + 32)
      }
      return celsiusTemp
    }
  })

  // ---- actions ----
  const toggleUnit = () => {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
    console.log(`[configStore] 온도 단위를 '${unit.value}'로 변경했습니다.`)
  }

  // ---- 영속화 ----
  // unit은 문자열(원시값)이라 교체될 때마다 감시자가 실행된다. deep 옵션이 필요 없다.
  watch(unit, (nextUnit) => saveState(STORAGE_KEY, nextUnit))

  // Setup Store는 여기서 반환한 것만 외부에서 쓸 수 있다.
  return { unit, unitSymbol, unitLabel, convertTemp, toggleUnit }
})
