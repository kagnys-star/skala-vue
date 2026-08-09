/**
 * localStorage 읽기/쓰기 헬퍼.
 *
 * 스토어마다 try/catch와 JSON 변환을 반복해서 적는 대신 여기로 모았다.
 * 예외 처리가 필요한 이유는 세 가지다.
 *   1. 저장된 문자열이 깨져 있으면 JSON.parse가 던진다 (사용자가 직접 수정한 경우 등)
 *   2. 브라우저 시크릿 모드나 저장 공간 초과 시 setItem이 던진다
 *   3. localStorage 자체를 막아둔 환경이 있다
 * 어느 경우든 '설정 저장에 실패했을 뿐' 앱은 계속 돌아가야 하므로 삼키고 경고만 남긴다.
 */

// 같은 도메인의 다른 앱과 키가 부딪히지 않도록 접두어를 붙인다.
const KEY_PREFIX = 'skala-vue:'

/**
 * @param {string} key - 접두어를 뺀 키 이름
 * @param {*} fallback - 저장된 값이 없거나 읽기에 실패했을 때 돌려줄 기본값
 */
export const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch (error) {
    console.warn(`[storage] '${key}' 복원에 실패해 기본값을 사용합니다.`, error)
    return fallback
  }
}

export const saveState = (key, value) => {
  try {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] '${key}' 저장에 실패했습니다.`, error)
  }
}
