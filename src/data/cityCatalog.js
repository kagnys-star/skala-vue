/**
 * 이 앱이 다루는 도시 목록.
 *
 * 이전에는 기온·습도까지 여기 하드코딩되어 있었지만(Mock 데이터), 이제 관측값은 API에서 받는다.
 * 다만 '어떤 도시를 보여줄 것인가'는 서버가 정해주는 게 아니라 앱이 정하는 설정이므로 여기 남는다.
 *
 * query: OpenWeatherMap에 도시를 지정할 때 쓰는 문자열이다.
 *        동명 도시가 있어 국가 코드(KR)를 함께 넘긴다.
 */
export const cityCatalog = [
  { id: 'city_01', name: '서울', region: '대한민국 서울특별시', query: 'Seoul,KR' },
  { id: 'city_02', name: '수원', region: '대한민국 경기도 수원시', query: 'Suwon,KR' },
  { id: 'city_03', name: '부산', region: '대한민국 부산광역시', query: 'Busan,KR' },
  { id: 'city_04', name: '인천', region: '대한민국 인천광역시', query: 'Incheon,KR' },
  { id: 'city_05', name: '대구', region: '대한민국 대구광역시', query: 'Daegu,KR' },
  { id: 'city_06', name: '대전', region: '대한민국 대전광역시', query: 'Daejeon,KR' },
  { id: 'city_07', name: '광주', region: '대한민국 광주광역시', query: 'Gwangju,KR' },
  { id: 'city_08', name: '울산', region: '대한민국 울산광역시', query: 'Ulsan,KR' },
  { id: 'city_09', name: '제주', region: '대한민국 제주특별자치도', query: 'Jeju City,KR' },
  { id: 'city_10', name: '강릉', region: '대한민국 강원특별자치도 강릉시', query: 'Gangneung,KR' },
]

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
