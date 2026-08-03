// 한글 검색 유사도 계산 유틸 (Vue와 무관한 순수 JavaScript 함수 모음)
// 반응형 상태를 갖지 않으므로 어떤 컴포넌트에서든 import해서 쓸 수 있다.

const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

const HANGUL_START = 0xac00 // '가'
const HANGUL_END = 0xd7a3 // '힣'

// '대구' -> 'ㄷㅐㄱㅜ' 처럼 완성형 한글을 자모 단위로 분해한다.
export const decomposeHangul = (text) => {
  let result = ''

  for (const char of text) {
    const code = char.charCodeAt(0)

    // 완성형 한글이 아니면(자음 단독, 영문, 숫자 등) 그대로 둔다.
    if (code < HANGUL_START || code > HANGUL_END) {
      result += char
      continue
    }

    const offset = code - HANGUL_START
    result += CHOSUNG[Math.floor(offset / 588)]
    result += JUNGSUNG[Math.floor((offset % 588) / 28)]
    result += JONGSUNG[offset % 28]
  }
  return result
}

// '대구' -> 'ㄷㄱ' 처럼 초성만 추출한다.
export const getChosung = (text) =>
  [...text]
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code < HANGUL_START || code > HANGUL_END) return char
      return CHOSUNG[Math.floor((code - HANGUL_START) / 588)]
    })
    .join('')

// 'ㄷㄱ' 처럼 자음으로만 이루어진 검색어인지 판별한다.
export const isChosungOnly = (text) =>
  text.length > 0 && [...text].every((char) => CHOSUNG.includes(char))

// 두 문자열을 같게 만드는 데 필요한 최소 편집 횟수 (Levenshtein 거리)
export const levenshtein = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // 삭제
        dp[i][j - 1] + 1, // 삽입
        dp[i - 1][j - 1] + cost, // 교체
      )
    }
  }
  return dp[a.length][b.length]
}

// 검색어와 대상 문자열의 유사도를 0~1 점수로 환산한다 (1에 가까울수록 비슷함)
export const similarity = (keyword, target) => {
  // 1) 'ㄷㄱ' 처럼 초성만 입력한 경우: 초성 검색으로 처리
  if (isChosungOnly(keyword)) {
    return getChosung(target).includes(keyword) ? 0.9 : 0
  }

  // 2) 한글은 글자 단위가 아니라 자모 단위로 비교해야 '댁' 과 '대구' 의 유사성이 잡힌다.
  const keywordJamo = decomposeHangul(keyword)
  const targetJamo = decomposeHangul(target)

  // 3) 한쪽이 다른 쪽을 포함하면(조합 중인 글자, '서울시' 같은 접미어) 높은 점수를 준다.
  if (targetJamo.includes(keywordJamo) || keywordJamo.includes(targetJamo)) {
    return 0.95
  }

  // 4) 그 외에는 자모 기준 편집 거리로 점수를 매긴다.
  const maxLength = Math.max(keywordJamo.length, targetJamo.length)
  if (maxLength === 0) return 1
  return 1 - levenshtein(keywordJamo, targetJamo) / maxLength
}
