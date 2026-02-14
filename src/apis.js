const API_KEY = import.meta.env.VITE_API_KEY;

const BASE_URL = "https://api.themoviedb.org/3/movie/popular";

class HTTPResponseError extends Error {
  constructor(status) {
    let message = "";
    if (status === 400) message = "잘못된 요청입니다.";
    else if (status === 401) message = "인증되지 않은 사용자입니다.";
    else if (status === 403) message = "접근 권한이 없습니다.";
    else if (status === 404) message = "요청한 자원을 찾을 수 없습니다.";
    else if (status >= 500) message = "서버 오류가 발생했습니다.";
    
    super(message);
    
    this.name = "HTTPResponseError";
    this.status = status;
  }
}

const DEFAULT_PAGE = 1;
const DEFAULT_TIMEOUT = 3000; // 3s
async function fetchMovies(page = DEFAULT_PAGE) {
  const url = `${BASE_URL}?api_key=${API_KEY}&language=ko-KR&page=${page}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new HTTPResponseError(response.status);
    }

    const data = await response.json();

    return {
      movies: data.results,
      isLast: data.page === data.total_pages,
      hasError: false,
      errorMessage: null,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      // 1. 요청이 명시적으로 중단된 경우
      return {
        movies: [],
        isLast: null,
        hasError: true,
        errorMessage: "서버 응답이 지연되고 있습니다.",
      };
    }

    if (error.name === "TypeError") {
      // 2. 네트워크 오류 (예: CORS, 서버 연결 불가)
      return {
        movies: [],
        isLast: null,
        hasError: true,
        errorMessage: "네트워크 오류가 발생했습니다.",
      };
    }

    if (error instanceof HTTPResponseError) {
      // 3. HTTP 상태 코드에 따른 사용자 오류 메시지
      return {
        movies: [],
        isLast: null,
        hasError: true,
        errorMessage: error.message,
      };
    }

    // 4. 예상치 못한 기타 오류
    return {
      movies: [],
      isLast: null,
      hasError: true,
      errorMessage: "알 수 없는 오류가 발생했습니다.",
    };
  }
}

export {fetchMovies};