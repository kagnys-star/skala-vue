import axios from 'axios'

/**
 * OpenWeatherMap 통신 계층.
 *
 * 컴포넌트나 스토어가 axios를 직접 부르지 않고 이 파일만 거치게 한다.
 * 그래야 API 응답 구조(data.main.temp 같은 것)가 화면 코드까지 새어 나가지 않고,
 * 나중에 다른 날씨 서비스로 바꿔도 고칠 곳이 여기 하나로 끝난다.
 */

// Vite는 'VITE_' 접두어가 붙은 환경 변수만 클라이언트 번들에 넣어준다.
// 실제 값은 .env.local 에 있고 그 파일은 git이 추적하지 않는다.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 공통 설정을 담은 전용 인스턴스. 전역 axios를 건드리지 않아 다른 요청에 영향을 주지 않는다.
const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  // 응답이 끝없이 지연될 때 로딩 화면에 갇히지 않도록 상한을 둔다.
  timeout: 8000,
  params: {
    appid: API_KEY,
    units: 'metric', // 섭씨로 받는다. 화씨 변환은 화면 표시 단계(configStore)에서 처리한다.
    lang: 'kr', // 날씨 설명을 한국어로 받는다
  },
})

/**
 * API 응답을 이 앱이 쓰는 모양으로 변환한다.
 * 화면 컴포넌트들은 예전 Mock 데이터와 똑같은 형태만 알면 되도록 맞춰준다.
 */
const toWeatherItem = (city, data) => ({
  id: city.id,
  name: city.name,
  region: city.region,
  temp: Math.round(data.main.temp),
  // weather는 배열이고 비어 있을 수 있으므로 그대로 [0]을 믿지 않는다.
  status: data.weather?.[0]?.description ?? '정보 없음',
  // 아이콘 코드. 끝의 d/n이 낮과 밤을 구분하므로 밤에는 밤 아이콘이 나온다.
  icon: data.weather?.[0]?.icon ?? '01d',
  humidity: data.main.humidity,
  // 소수점이 길게 오는 경우가 있어 한 자리로 자른다. toFixed는 문자열을 주므로 숫자로 되돌린다.
  wind: Number((data.wind?.speed ?? 0).toFixed(1)),

  // 아래는 원래 응답에 함께 오던 값들이다. 추가 호출 없이 그대로 쓸 수 있다.
  feelsLike: Math.round(data.main.feels_like),
  windDeg: data.wind?.deg ?? null,
  pressure: data.main.pressure,
  clouds: data.clouds?.all ?? null,
  visibility: data.visibility ?? null,
  sunrise: data.sys?.sunrise ?? null,
  sunset: data.sys?.sunset ?? null,
  // 관측 시각(UTC 기준 초 단위). '몇 분 전 값인지' 알려주는 데 쓴다.
  observedAt: data.dt,
})

/**
 * 도시 한 곳의 현재 날씨를 가져온다.
 * 실패하면 예외를 그대로 던진다. '어떻게 보여줄지'는 호출한 스토어가 정할 일이다.
 */
export const fetchCityWeather = async (city) => {
  const { data } = await weatherClient.get('/weather', {
    params: { q: city.query },
  })

  return toWeatherItem(city, data)
}

/**
 * 도시 한 곳의 5일치 예보를 가져온다.
 *
 * 응답의 list는 3시간 간격 40건(5일)이다.
 * 화면에서는 앞쪽 일부만 쓰지만, 자르는 기준은 화면이 정할 일이므로 여기서는 전부 넘긴다.
 */
export const fetchCityForecast = async (city) => {
  const { data } = await weatherClient.get('/forecast', {
    params: { q: city.query },
  })

  return data.list.map((slot) => ({
    // dt는 초 단위, JavaScript Date는 밀리초 단위라 1000을 곱해야 한다.
    time: new Date(slot.dt * 1000),
    temp: Math.round(slot.main.temp),
    icon: slot.weather?.[0]?.icon ?? '01d',
    status: slot.weather?.[0]?.description ?? '정보 없음',
    // pop = probability of precipitation. 0~1 실수로 오므로 백분율로 바꾼다.
    pop: Math.round((slot.pop ?? 0) * 100),
  }))
}

/**
 * 도시 한 곳의 대기질을 가져온다.
 *
 * 이 엔드포인트는 도시 이름을 받지 않고 좌표(lat/lon)만 받는다.
 * 그래서 cityCatalog에 좌표를 함께 적어 두었다.
 */
export const fetchCityAirQuality = async (city) => {
  const { data } = await weatherClient.get('/air_pollution', {
    params: { lat: city.lat, lon: city.lon },
  })

  const current = data.list?.[0]
  if (!current) {
    throw new Error('대기질 응답이 비어 있습니다.')
  }

  return {
    id: city.id,
    name: city.name,
    // aqi는 1(좋음) ~ 5(매우 나쁨) 등급이다.
    aqi: current.main.aqi,
    pm25: current.components.pm2_5,
    pm10: current.components.pm10,
    o3: current.components.o3,
    no2: current.components.no2,
  }
}

/**
 * axios 오류를 사용자가 읽을 수 있는 한국어 문장으로 바꾼다.
 *
 * 'Request failed with status code 401'을 그대로 띄우면 사용자는 무엇을 해야 할지 알 수 없다.
 * 원인별로 다음 행동을 알려주는 것이 오류 처리의 목적이다.
 */
export const describeApiError = (error) => {
  // 키를 아예 넣지 않은 경우는 서버에 물어볼 것도 없이 여기서 걸러진다.
  if (!API_KEY) {
    return 'API 키가 설정되지 않았습니다. .env.local 파일에 VITE_OPENWEATHER_API_KEY를 넣어 주세요.'
  }

  if (error.code === 'ECONNABORTED') {
    return '날씨 서버 응답이 너무 늦어 요청을 중단했습니다. 잠시 후 다시 시도해 주세요.'
  }

  // response가 없다 = 서버까지 닿지도 못했다 (네트워크 끊김, CORS, DNS 실패 등)
  if (!error.response) {
    return '날씨 서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.'
  }

  switch (error.response.status) {
    case 401:
      return 'API 키가 올바르지 않거나 아직 활성화되지 않았습니다. (새 키는 활성화까지 시간이 걸립니다)'
    case 404:
      return '요청한 도시를 날씨 서버에서 찾지 못했습니다.'
    case 429:
      return '무료 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return `날씨 서버가 오류를 반환했습니다. (HTTP ${error.response.status})`
  }
}
