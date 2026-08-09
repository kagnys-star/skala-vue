import axios from 'axios'

/**
 * TMDB(The Movie Database) 통신 계층.
 *
 * weatherApi.js와 같은 원칙이다. 응답 구조를 이 파일 안에 가두고,
 * 화면에는 우리가 정한 모양으로만 넘긴다.
 */

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

// 포스터는 API 서버가 아니라 별도 이미지 CDN에서 받는다.
// w342는 제공되는 크기 중 목록 카드에 적당한 폭이다.
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

const movieClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 8000,
  params: {
    api_key: API_KEY,
    // 한국어 제목과 줄거리를 받는다. 번역이 없으면 원문이 온다.
    language: 'ko-KR',
    region: 'KR',
  },
})

/**
 * 포스터 경로를 완전한 주소로 만든다.
 * poster_path가 없는 작품도 있으므로 그때는 null을 돌려주고 화면에서 대체 표시를 쓴다.
 */
export const getPosterUrl = (posterPath) => {
  return posterPath ? `${IMAGE_BASE}${posterPath}` : null
}

const toMovieItem = (data) => ({
  id: data.id,
  title: data.title ?? data.original_title ?? '제목 없음',
  overview: data.overview ?? '',
  posterUrl: getPosterUrl(data.poster_path),
  // vote_average는 10점 만점 실수다. 소수 한 자리로 줄인다.
  rating: Number((data.vote_average ?? 0).toFixed(1)),
  voteCount: data.vote_count ?? 0,
  // 개봉 전 작품은 release_date가 빈 문자열로 오기도 한다.
  releaseDate: data.release_date || null,
})

/**
 * 현재 인기 영화 목록.
 * TMDB는 한 페이지에 20편을 준다.
 */
export const fetchPopularMovies = async () => {
  const { data } = await movieClient.get('/movie/popular')
  return (data.results ?? []).map(toMovieItem)
}

/**
 * 제목으로 영화를 검색한다.
 * 검색어가 비어 있으면 TMDB가 오류를 내므로 호출 전에 걸러 준다.
 */
export const searchMovies = async (keyword) => {
  const trimmed = keyword.trim()
  if (trimmed === '') {
    return []
  }

  const { data } = await movieClient.get('/search/movie', {
    params: { query: trimmed, include_adult: false },
  })
  return (data.results ?? []).map(toMovieItem)
}

/**
 * TMDB 오류를 한국어 안내로 바꾼다.
 * weatherApi의 describeApiError와 역할은 같지만 상태 코드의 의미가 서비스마다 달라 따로 둔다.
 */
export const describeMovieApiError = (error) => {
  if (!API_KEY) {
    return 'TMDB API 키가 없습니다. .env.local 파일에 VITE_TMDB_API_KEY를 넣어 주세요.'
  }

  if (error.code === 'ECONNABORTED') {
    return '영화 정보 서버 응답이 너무 늦어 요청을 중단했습니다.'
  }

  if (!error.response) {
    return '영화 정보 서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.'
  }

  switch (error.response.status) {
    case 401:
      return 'TMDB API 키가 올바르지 않습니다. 발급받은 키를 다시 확인해 주세요.'
    case 404:
      return '요청한 영화 정보를 찾지 못했습니다.'
    case 429:
      return 'TMDB 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return `영화 정보 서버가 오류를 반환했습니다. (HTTP ${error.response.status})`
  }
}
