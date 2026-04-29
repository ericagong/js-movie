import { fetchPopularMovies } from "./api/tmdb.js";
import { toUserMessage } from "./ui/messages.js";
import {
  renderInitialSkeleton,
  renderMain,
  renderError,
  appendSkeletonsToMovieList,
  replaceSkeletonsWithMovies,
  getCurrentPage,
  updateLoadMoreButton,
  bindLoadMoreClick,
} from "./ui/render.js";

async function start() {
  renderInitialSkeleton();
  try {
    const { movies, isLast } = await fetchPopularMovies();
    const [bannerMovie] = movies;
    renderMain({ bannerMovie, movies, isLast });
    bindLoadMoreClick(handleLoadMore);
  } catch (error) {
    // TODO:  에러 처리 고도화 여부 결정
    //   - Transport (NetworkError / AbortError) / 5xx → 재시도 버튼 (retryable 분기)
    //   - 429 / 503 → Retry-After 존중 자동 재시도 (withBackoff)
    //   - DataError (ParseError / ValidationError) → 모니터링 보고 (console.error / Sentry)
    //   - AbortError 의도 취소 시나리오 (더보기 연타 race 방어 등) → catcher 가 toUserMessage 호출 건너뛰기
    renderError(toUserMessage(error));
  }
}

async function handleLoadMore() {
  const nextPage = getCurrentPage() + 1;
  appendSkeletonsToMovieList();

  try {
    const { movies, isLast } = await fetchPopularMovies(nextPage);
    replaceSkeletonsWithMovies(movies);
    updateLoadMoreButton({ isLast, page: nextPage });
  } catch (error) {
    // TODO:  에러 처리 고도화 여부 결정
    renderError(toUserMessage(error));
  }
}

window.addEventListener("load", start);
