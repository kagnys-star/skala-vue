/**
 * 날씨 실습용 Mock 데이터.
 *
 * 지금까지는 WeatherParent 컴포넌트가 이 배열을 직접 들고 있었다.
 * 하지만 라우터를 도입하면서 메인 목록(WeatherHomeView)과 상세 페이지(WeatherDetailView)가
 * '서로 다른 화면'이 되었고, 두 화면 모두 같은 원본 데이터를 참조해야 한다.
 * 그래서 어느 한쪽 컴포넌트에 두지 않고 별도 모듈로 끌어냈다.
 *
 * 참고) 이후 Axios 연동 단계에서 이 모듈은 실제 API 응답으로 대체된다.
 */
export const weatherMockList = [
  {
    id: 'city_01',
    name: '서울',
    region: '대한민국 서울특별시',
    temp: 28,
    status: '맑음',
    humidity: 55,
    wind: 2.5,
  },
  {
    id: 'city_02',
    name: '수원',
    region: '대한민국 경기도 수원시',
    temp: 24,
    status: '비',
    humidity: 80,
    wind: 1.8,
  },
  {
    id: 'city_03',
    name: '부산',
    region: '대한민국 부산광역시',
    temp: 26,
    status: '구름',
    humidity: 65,
    wind: 3.2,
  },
  {
    id: 'city_04',
    name: '인천',
    region: '대한민국 인천광역시',
    temp: 25,
    status: '흐림',
    humidity: 70,
    wind: 4.1,
  },
  {
    id: 'city_05',
    name: '대구',
    region: '대한민국 대구광역시',
    temp: 31,
    status: '맑음',
    humidity: 45,
    wind: 1.2,
  },
  {
    id: 'city_06',
    name: '대전',
    region: '대한민국 대전광역시',
    temp: 27,
    status: '구름',
    humidity: 60,
    wind: 2.0,
  },
  {
    id: 'city_07',
    name: '광주',
    region: '대한민국 광주광역시',
    temp: 29,
    status: '맑음',
    humidity: 58,
    wind: 1.6,
  },
  {
    id: 'city_08',
    name: '울산',
    region: '대한민국 울산광역시',
    temp: 26,
    status: '비',
    humidity: 75,
    wind: 2.8,
  },
  {
    id: 'city_09',
    name: '제주',
    region: '대한민국 제주특별자치도',
    temp: 23,
    status: '흐림',
    humidity: 85,
    wind: 5.3,
  },
  {
    id: 'city_10',
    name: '강릉',
    region: '대한민국 강원특별자치도 강릉시',
    temp: 22,
    status: '맑음',
    humidity: 62,
    wind: 3.5,
  },
]

/**
 * 도시 ID로 도시 객체 하나를 찾는다.
 *
 * 상세 페이지는 URL의 동적 세그먼트(:cityId)만 알고 있으므로,
 * 그 문자열을 실제 데이터로 바꿔주는 책임을 데이터 모듈이 갖는다.
 *
 * @param {string} cityId - 라우트 파라미터로 넘어온 도시 ID (예: 'city_01')
 * @returns {object | null} 찾은 도시 객체. 없으면 null (URL을 직접 조작한 경우)
 */
export const findCityById = (cityId) => {
  return weatherMockList.find((city) => city.id === cityId) ?? null
}
