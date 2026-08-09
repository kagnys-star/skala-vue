/**
 * 이 앱이 다루는 도시 목록.
 *
 * 관측값은 API에서 받지만 '어떤 도시를 보여줄 것인가'는 앱이 정하는 설정이므로 여기 남는다.
 *
 * query: OpenWeatherMap에 도시를 지정할 때 쓰는 문자열. 동명 도시가 있어 국가 코드(KR)를 함께 넘긴다.
 *        일부 도시는 'Suwon'으로는 찾지 못하고 'Siheung-si'처럼 -si를 붙여야 응답한다.
 *        아래 값은 전부 실제 호출로 200을 확인한 것이다.
 * lat/lon: 대기질 API는 도시 이름을 받지 않고 좌표만 받는다. API가 알려준 실제 값이다.
 *
 * 개수를 54개로 맞춘 이유:
 * 무료 플랜은 분당 60회로 제한된다. 목록을 한 번 불러올 때 도시 수만큼 호출이 나가므로,
 * 60을 넘기면 뒷부분이 통째로 429를 맞는다. 여유를 두고 54에서 끊었다.
 * (도시를 더 늘리려면 요청을 나눠 보내거나 유료 플랜이 필요하다)
 */
export const cityCatalog = [
  // ---- 특별시 · 광역시 ----
  { id: 'seoul', name: '서울', region: '서울특별시', query: 'Seoul,KR', lat: 37.5683, lon: 126.9778 },
  { id: 'busan', name: '부산', region: '부산광역시', query: 'Busan,KR', lat: 35.1028, lon: 129.0403 },
  { id: 'incheon', name: '인천', region: '인천광역시', query: 'Incheon,KR', lat: 37.45, lon: 126.4161 },
  { id: 'daegu', name: '대구', region: '대구광역시', query: 'Daegu,KR', lat: 35.8, lon: 128.55 },
  { id: 'daejeon', name: '대전', region: '대전광역시', query: 'Daejeon,KR', lat: 36.3333, lon: 127.4167 },
  { id: 'gwangju', name: '광주', region: '광주광역시', query: 'Gwangju,KR', lat: 35.1547, lon: 126.9156 },
  { id: 'ulsan', name: '울산', region: '울산광역시', query: 'Ulsan,KR', lat: 35.5372, lon: 129.3167 },
  { id: 'sejong', name: '세종', region: '세종특별자치시', query: 'Sejong,KR', lat: 36.4817, lon: 127.2871 },

  // ---- 경기도 ----
  { id: 'suwon', name: '수원', region: '경기도 수원시', query: 'Suwon,KR', lat: 37.2911, lon: 127.0089 },
  { id: 'seongnam', name: '성남', region: '경기도 성남시', query: 'Seongnam,KR', lat: 37.4386, lon: 127.1378 },
  { id: 'yongin', name: '용인', region: '경기도 용인시', query: 'Yongin,KR', lat: 37.2342, lon: 127.2064 },
  { id: 'goyang', name: '고양', region: '경기도 고양시', query: 'Goyang,KR', lat: 37.6564, lon: 126.835 },
  { id: 'bucheon', name: '부천', region: '경기도 부천시', query: 'Bucheon,KR', lat: 37.4989, lon: 126.7831 },
  { id: 'ansan', name: '안산', region: '경기도 안산시', query: 'Ansan,KR', lat: 37.3236, lon: 126.8219 },
  { id: 'anyang', name: '안양', region: '경기도 안양시', query: 'Anyang,KR', lat: 37.3925, lon: 126.9269 },
  { id: 'namyangju', name: '남양주', region: '경기도 남양주시', query: 'Namyangju,KR', lat: 37.6367, lon: 127.2142 },
  { id: 'hwaseong', name: '화성', region: '경기도 화성시', query: 'Hwaseong,KR', lat: 37.2068, lon: 126.8169 },
  { id: 'pyeongtaek', name: '평택', region: '경기도 평택시', query: 'Pyeongtaek,KR', lat: 36.9947, lon: 127.0889 },
  { id: 'uijeongbu', name: '의정부', region: '경기도 의정부시', query: 'Uijeongbu-si,KR', lat: 37.7415, lon: 127.0474 },
  { id: 'paju', name: '파주', region: '경기도 파주시', query: 'Paju,KR', lat: 37.7611, lon: 126.775 },

  // ---- 강원특별자치도 ----
  { id: 'chuncheon', name: '춘천', region: '강원특별자치도 춘천시', query: 'Chuncheon,KR', lat: 37.8747, lon: 127.7342 },
  { id: 'wonju', name: '원주', region: '강원특별자치도 원주시', query: 'Wonju,KR', lat: 37.3514, lon: 127.9453 },
  { id: 'gangneung', name: '강릉', region: '강원특별자치도 강릉시', query: 'Gangneung,KR', lat: 37.7556, lon: 128.8961 },
  { id: 'sokcho', name: '속초', region: '강원특별자치도 속초시', query: 'Sokcho,KR', lat: 38.2083, lon: 128.5911 },
  { id: 'donghae', name: '동해', region: '강원특별자치도 동해시', query: 'Donghae-si,KR', lat: 37.5245, lon: 129.1146 },

  // ---- 충청북도 ----
  { id: 'cheongju', name: '청주', region: '충청북도 청주시', query: 'Cheongju,KR', lat: 36.6372, lon: 127.4897 },
  { id: 'chungju', name: '충주', region: '충청북도 충주시', query: 'Chungju,KR', lat: 36.9706, lon: 127.9322 },
  { id: 'jecheon', name: '제천', region: '충청북도 제천시', query: 'Jecheon,KR', lat: 37.1361, lon: 128.2119 },

  // ---- 충청남도 ----
  { id: 'cheonan', name: '천안', region: '충청남도 천안시', query: 'Cheonan,KR', lat: 36.8065, lon: 127.1522 },
  { id: 'asan', name: '아산', region: '충청남도 아산시', query: 'Asan,KR', lat: 36.7836, lon: 127.0042 },
  { id: 'gongju', name: '공주', region: '충청남도 공주시', query: 'Gongju,KR', lat: 36.4556, lon: 127.1247 },
  { id: 'seosan', name: '서산', region: '충청남도 서산시', query: 'Seosan,KR', lat: 36.7817, lon: 126.4522 },
  { id: 'boryeong', name: '보령', region: '충청남도 보령시', query: 'Boryeong,KR', lat: 36.3493, lon: 126.5977 },

  // ---- 전북특별자치도 ----
  { id: 'jeonju', name: '전주', region: '전북특별자치도 전주시', query: 'Jeonju,KR', lat: 35.8219, lon: 127.1489 },
  { id: 'gunsan', name: '군산', region: '전북특별자치도 군산시', query: 'Gunsan,KR', lat: 35.9786, lon: 126.7114 },
  { id: 'iksan', name: '익산', region: '전북특별자치도 익산시', query: 'Iksan,KR', lat: 35.9439, lon: 126.9544 },
  { id: 'jeongeup', name: '정읍', region: '전북특별자치도 정읍시', query: 'Jeongeup,KR', lat: 35.5699, lon: 126.856 },

  // ---- 전라남도 ----
  { id: 'mokpo', name: '목포', region: '전라남도 목포시', query: 'Mokpo,KR', lat: 34.7936, lon: 126.3886 },
  { id: 'yeosu', name: '여수', region: '전라남도 여수시', query: 'Yeosu,KR', lat: 34.7546, lon: 127.6599 },
  { id: 'suncheon', name: '순천', region: '전라남도 순천시', query: 'Suncheon,KR', lat: 34.9481, lon: 127.4895 },
  { id: 'naju', name: '나주', region: '전라남도 나주시', query: 'Naju,KR', lat: 35.0283, lon: 126.7175 },
  { id: 'gwangyang', name: '광양', region: '전라남도 광양시', query: 'Gwangyang,KR', lat: 34.9407, lon: 127.6959 },

  // ---- 경상북도 ----
  { id: 'pohang', name: '포항', region: '경상북도 포항시', query: 'Pohang,KR', lat: 36.0322, lon: 129.365 },
  { id: 'gyeongju', name: '경주', region: '경상북도 경주시', query: 'Gyeongju,KR', lat: 35.8428, lon: 129.2117 },
  { id: 'gumi', name: '구미', region: '경상북도 구미시', query: 'Gumi,KR', lat: 36.1136, lon: 128.336 },
  { id: 'andong', name: '안동', region: '경상북도 안동시', query: 'Andong,KR', lat: 36.5656, lon: 128.725 },
  { id: 'gyeongsan', name: '경산', region: '경상북도 경산시', query: 'Gyeongsan,KR', lat: 35.8251, lon: 128.7413 },
  { id: 'yeongju', name: '영주', region: '경상북도 영주시', query: 'Yeongju,KR', lat: 36.8217, lon: 128.6308 },

  // ---- 경상남도 ----
  { id: 'changwon', name: '창원', region: '경상남도 창원시', query: 'Changwon,KR', lat: 35.2281, lon: 128.6811 },
  { id: 'jinju', name: '진주', region: '경상남도 진주시', query: 'Jinju,KR', lat: 35.1928, lon: 128.0847 },
  { id: 'gimhae', name: '김해', region: '경상남도 김해시', query: 'Gimhae,KR', lat: 35.2342, lon: 128.8811 },
  { id: 'yangsan', name: '양산', region: '경상남도 양산시', query: 'Yangsan,KR', lat: 35.3386, lon: 129.0386 },
  { id: 'miryang', name: '밀양', region: '경상남도 밀양시', query: 'Miryang,KR', lat: 35.4933, lon: 128.7489 },

  // ---- 제주특별자치도 ----
  { id: 'jeju', name: '제주', region: '제주특별자치도 제주시', query: 'Jeju City,KR', lat: 33.5097, lon: 126.5219 },
]

/**
 * 대기질 순위에 쓸 대표 도시.
 *
 * 대기질도 도시마다 한 번씩 호출해야 하므로 54개를 전부 조회하면
 * 날씨 조회와 합쳐 분당 한도를 넘긴다. 광역시 + 세종만 추린다.
 */
export const majorCityIds = [
  'seoul',
  'busan',
  'incheon',
  'daegu',
  'daejeon',
  'gwangju',
  'ulsan',
  'sejong',
  'jeju',
]

export const majorCities = cityCatalog.filter((city) => majorCityIds.includes(city.id))

/**
 * 도시 ID가 우리가 아는 도시인지 확인한다.
 *
 * 라우터 가드가 이 함수를 쓴다. API 응답과 무관하게 항상 판단할 수 있어야 하므로
 * (네트워크가 끊겨도 '없는 주소'는 없는 주소다) 관측 데이터가 아닌 이 목록을 기준으로 삼는다.
 *
 * @returns {object | null} 카탈로그에 있는 도시 정보. 없으면 null
 */
export const findCityInCatalog = (cityId) => {
  return cityCatalog.find((city) => city.id === cityId) ?? null
}
