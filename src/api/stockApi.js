import axios from 'axios'

/**
 * Alpha Vantage 주식 시세 통신 계층.
 *
 * 주의할 점이 하나 있다.
 * 이 API는 호출 한도를 넘기거나 키가 잘못돼도 HTTP 200을 돌려준다.
 * 대신 본문이 { "Global Quote": {...} } 가 아니라 { "Information": "..." } 로 바뀐다.
 * 그래서 상태 코드만 보고 성공으로 판단하면 '데이터가 비어 있는 성공'이 되어 버린다.
 * 아래 fetchStockQuote가 본문 모양까지 확인하는 이유다.
 */

const API_KEY = import.meta.env.VITE_ALPHAVANTAGE_API_KEY

const stockClient = axios.create({
  baseURL: 'https://www.alphavantage.co',
  timeout: 8000,
  params: { apikey: API_KEY },
})

/**
 * 화면에 보여줄 종목.
 *
 * 무료 플랜은 하루 25회로 매우 빡빡하다. 종목 수만큼 호출이 나가므로
 * 6개로 제한하고, 받아온 값은 스토어에서 저장해 두고 재사용한다.
 */
export const stockSymbols = [
  { symbol: 'AAPL', name: '애플' },
  { symbol: 'MSFT', name: '마이크로소프트' },
  { symbol: 'NVDA', name: '엔비디아' },
  { symbol: 'GOOGL', name: '알파벳' },
  { symbol: 'AMZN', name: '아마존' },
  { symbol: 'TSLA', name: '테슬라' },
]

/**
 * 종목 하나의 현재 시세를 가져온다.
 *
 * 응답의 키가 '01. symbol', '05. price'처럼 번호가 붙은 형태라 그대로 쓰면 화면 코드가 지저분해진다.
 * 여기서 평범한 이름으로 바꿔 넘긴다. 숫자도 문자열로 오므로 Number로 변환한다.
 */
export const fetchStockQuote = async (item) => {
  const { data } = await stockClient.get('/query', {
    params: { function: 'GLOBAL_QUOTE', symbol: item.symbol },
  })

  // 한도 초과 · 키 오류 · 안내 메시지는 모두 여기로 들어온다.
  if (data.Information || data.Note || data['Error Message']) {
    throw new Error(data.Information ?? data.Note ?? data['Error Message'])
  }

  const quote = data['Global Quote']
  if (!quote || !quote['05. price']) {
    throw new Error(`'${item.symbol}' 시세를 찾지 못했습니다.`)
  }

  // '1.6493%' 처럼 % 기호가 붙어 오므로 떼어내고 숫자로 만든다.
  const changePercent = Number(String(quote['10. change percent'] ?? '0').replace('%', ''))

  return {
    symbol: quote['01. symbol'],
    name: item.name,
    price: Number(quote['05. price']),
    change: Number(quote['09. change']),
    changePercent,
    open: Number(quote['02. open']),
    high: Number(quote['03. high']),
    low: Number(quote['04. low']),
    previousClose: Number(quote['08. previous close']),
    volume: Number(quote['06. volume']),
    tradingDay: quote['07. latest trading day'],
  }
}

export const describeStockApiError = (error) => {
  if (!API_KEY) {
    return 'Alpha Vantage API 키가 없습니다. .env.local 파일에 VITE_ALPHAVANTAGE_API_KEY를 넣어 주세요.'
  }

  // 위에서 우리가 직접 던진 오류는 response가 없다. 메시지를 그대로 살려 보여준다.
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return '시세 서버 응답이 너무 늦어 요청을 중단했습니다.'
    }
    if (error.message?.includes('rate limit') || error.message?.includes('API key')) {
      return '무료 플랜 하루 호출 한도(25회)를 초과했거나 키가 올바르지 않습니다.'
    }
    return error.message || '시세 서버에 연결하지 못했습니다.'
  }

  return `시세 서버가 오류를 반환했습니다. (HTTP ${error.response.status})`
}
