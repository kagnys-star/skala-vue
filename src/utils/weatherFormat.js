/**
 * 날씨 값을 화면에 보여줄 문자열로 바꾸는 함수 모음.
 *
 * 여러 컴포넌트가 같은 변환을 필요로 하므로 한곳에 모았다.
 * 스토어가 아니라 유틸에 둔 이유: 상태를 갖지 않고 입력만 보고 결과를 내는 순수 함수들이다.
 */

/**
 * OpenWeatherMap 아이콘 코드를 이미지 주소로 만든다.
 * 코드 끝의 'd'/'n'이 낮과 밤을 구분한다. (예: 04d = 낮의 흐림, 04n = 밤의 흐림)
 */
export const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

// 풍향을 16방위로 나눌 때 쓸 이름. 북(0도)에서 시계 방향 순서다.
const WIND_DIRECTIONS = [
  '북', '북북동', '북동', '동북동',
  '동', '동남동', '남동', '남남동',
  '남', '남남서', '남서', '서남서',
  '서', '서북서', '북서', '북북서',
]

/**
 * 풍향 각도(0~360)를 한글 방위로 바꾼다.
 *
 * 한 방위가 차지하는 각도는 360/16 = 22.5도다.
 * 북(0도)은 -11.25도 ~ +11.25도 범위이므로, 반올림 전에 11.25도를 더해 경계를 맞춘다.
 */
export const formatWindDirection = (deg) => {
  if (deg === null || deg === undefined) {
    return '정보 없음'
  }
  const index = Math.floor(((deg + 11.25) % 360) / 22.5)
  return WIND_DIRECTIONS[index]
}

/**
 * 유닉스 초(UTC)를 'HH:MM' 형태의 현지 시각 문자열로 바꾼다.
 * Date는 밀리초를 받으므로 1000을 곱한다.
 */
export const formatClockTime = (unixSeconds) => {
  if (!unixSeconds) {
    return '-'
  }
  return new Date(unixSeconds * 1000).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 관측 시각이 얼마나 지났는지 사람이 읽는 문장으로 바꾼다.
 * '1786245150' 같은 숫자보다 '3분 전 관측'이 훨씬 쓸모 있다.
 */
export const formatRelativeTime = (unixSeconds) => {
  if (!unixSeconds) {
    return '시각 정보 없음'
  }

  const diffMinutes = Math.floor((Date.now() - unixSeconds * 1000) / 60000)

  // 서버 시각과 브라우저 시각이 조금 어긋나면 음수가 나올 수 있다. 그때는 방금으로 본다.
  if (diffMinutes < 1) {
    return '방금 전'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  }
  return `${Math.floor(diffMinutes / 60)}시간 전`
}

/**
 * 낮 길이를 '13시간 52분' 형태로 만든다.
 * 일출·일몰 중 하나라도 없으면 계산하지 않는다.
 */
export const formatDayLength = (sunrise, sunset) => {
  if (!sunrise || !sunset) {
    return '-'
  }
  const totalMinutes = Math.floor((sunset - sunrise) / 60)
  return `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`
}

// AQI 등급(1~5)별 표시 정보. 인덱스 0은 쓰지 않으므로 자리만 채워 둔다.
const AQI_LEVELS = [
  null,
  { label: '좋음', color: '#67c23a' },
  { label: '보통', color: '#409eff' },
  { label: '나쁨', color: '#e6a23c' },
  { label: '많이 나쁨', color: '#f56c6c' },
  { label: '매우 나쁨', color: '#a04040' },
]

/**
 * AQI 등급 숫자를 라벨과 색으로 바꾼다.
 * 등급 범위를 벗어난 값이 와도 화면이 깨지지 않도록 기본값을 돌려준다.
 */
export const describeAqi = (aqi) => {
  return AQI_LEVELS[aqi] ?? { label: '알 수 없음', color: '#909399' }
}
