// TMDB 도메인 — endpoint URL 조립 + endpoint 별 호출 함수.
// HTTP 통신 (Transport / HTTP 단계) 은 http.js 가 책임.
// Data 단계 (JSON 파싱 / 스키마 검증 / DTO 변환) 는 이 파일이 책임 — 도메인이 자기 응답 형식을 안다.

import { request } from "./http.js";
import { ParseError, ValidationError } from "./errors.js";

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_LANG = "ko-KR";
const DEFAULT_PAGE = 1;
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w200";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

function buildTmdbUrl(path, params = {}) {
  const query = new URLSearchParams({
    api_key: API_KEY,
    language: DEFAULT_LANG,
    ...params,
  });
  return `${BASE_URL}${path}?${query}`;
}

// TMDB 인기 영화 응답 스키마 검증 — UI 가 사용하는 핵심 필드만 검사
// (poster_path / backdrop_path 는 TMDB 가 자원 부재 시 null 반환)
// TODO: 향후 필요시 zod로 교체
const isValidMovie = (d) =>
  d &&
  typeof d === "object" &&
  typeof d.id === "number" &&
  typeof d.title === "string" &&
  (d.poster_path == null || typeof d.poster_path === "string") &&
  (d.backdrop_path == null || typeof d.backdrop_path === "string") &&
  typeof d.vote_average === "number";

const isValidPopularMovies = (d) =>
  d &&
  typeof d === "object" &&
  typeof d.page === "number" &&
  typeof d.total_pages === "number" &&
  Array.isArray(d.results) &&
  d.results.every(isValidMovie);

// TMDB 응답 → 클라이언트 필요 데이터 형태로 변환
function toMovieDTO(d) {
  return {
    id: d.id,
    title: d.title,
    posterUrl: d.poster_path ? `${POSTER_BASE_URL}${d.poster_path}` : "",
    backdropUrl: d.backdrop_path
      ? `${BACKDROP_BASE_URL}${d.backdrop_path}`
      : null,
    formattedRating: d.vote_average.toFixed(1),
  };
}

// 실패 시 raw APIError 인스턴스를 그대로 throw — 호출부가 catch 해서 UX 매핑 책임.
// signal: 호출자가 생명주기 abort 주입할 때 사용. wrapper 로 그대로 pass-through.
async function fetchPopularMovies(page = DEFAULT_PAGE, { signal } = {}) {
  const response = await request(
    buildTmdbUrl("/movie/popular", { page: String(page) }),
    { signal },
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ParseError();
  }
  if (!isValidPopularMovies(data)) throw new ValidationError();
  return {
    movies: data.results.map(toMovieDTO),
    isLast: data.page === data.total_pages,
  };
}

export { fetchPopularMovies };
