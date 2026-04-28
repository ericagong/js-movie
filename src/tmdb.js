// TMDB 도메인 — endpoint URL 조립 + endpoint 별 호출 함수.
// 통신 메커니즘은 http.js, 도메인 변환은 다음 단계의 services 책임.
// UX 메시지 매핑은 호출부 (현재 main.js, Stage 4.1 에서 ui/renderError 로 이전).

import { httpRequest } from "./http.js";

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_LANG = "ko-KR";
const DEFAULT_PAGE = 1;

function buildPopularMoviesUrl(page) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: DEFAULT_LANG,
    page: String(page),
  });
  return `${BASE_URL}/movie/popular?${params}`;
}

// 실패 시 raw AppError 인스턴스를 그대로 throw — 호출부가 catch 해서 UX 매핑 책임.
async function fetchPopularMovies(page = DEFAULT_PAGE) {
  const data = await httpRequest(buildPopularMoviesUrl(page));
  return {
    movies: data.results,
    isLast: data.page === data.total_pages,
  };
}

export { fetchPopularMovies };
