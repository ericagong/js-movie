// 진입점 — 단일 status 머신 + 비동기 발사 + render 트리거 한 곳.
//
// 도메인 규모 (단일 화면 + 단일 비동기) 가 작아 service / store 같은 별도 모듈 없이
// view 의 호출자 위치에서 직접 상태와 흐름을 다룬다.
// PR.md 원칙은 모두 보존:
// - 1챕터 에러 어휘: tmdb.js 가 throw, 여기서 catch → toUserMessage 매핑
// - 2-2 입력 게이트: loading 중 새 발사 차단 (코드 흐름의 if)
// - 3챕터 단일 status: 상태 폭발 방지 (boolean 조합 X)
// - 4번 원칙: 버튼 disabled 는 status==='loading' 에서 파생 (별도 boolean X)

import { fetchPopularMovies } from "./api/tmdb.js";
import { toUserMessage } from "./ui/messages.js";
import {
  renderInitialSkeleton,
  renderMain,
  renderError,
  appendSkeletonsToMovieList,
  replaceSkeletonsWithMovies,
  updateLoadMoreButton,
  setLoadMoreDisabled,
  bindLoadMoreClick,
} from "./ui/render.js";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// TODO: 호출부의 state 직접 변경이 반복 늘어나면 action + reducer 로 응축 (선언형 전환)
let state = {
  status: STATUS.IDLE,
  movies: [], // 누적
  page: 0, // 마지막 성공 페이지 (단일 진실원천 — DOM dataset 은 표시일 뿐)
  isLast: false,
  error: null,
};

// 비동기 시간 순서 = 코드 위→아래 순서.
// 발사 직전 / 성공 / 실패 화면이 흐름순으로 등장하고,
// "첫 로드냐 추가 페이지냐" 는 발사 직전에 캡처한 isFirstLoad 한 플래그로 분기.
async function loadNextPage() {
  if (state.status === STATUS.LOADING) return; // 입력 게이트 — 연타 race 방어

  const isFirstLoad = state.page === 0;

  // 발사 직전 화면
  state = { ...state, status: STATUS.LOADING, error: null };
  if (isFirstLoad) renderInitialSkeleton();
  else {
    appendSkeletonsToMovieList();
    setLoadMoreDisabled(true);
  }

  try {
    const { movies, isLast } = await fetchPopularMovies(state.page + 1);
    state = {
      ...state,
      status: STATUS.SUCCESS,
      movies: [...state.movies, ...movies],
      page: state.page + 1,
      isLast,
    };

    // 성공 화면
    if (isFirstLoad) {
      renderMain({ bannerMovie: movies[0], movies, isLast });
      bindLoadMoreClick(loadNextPage);
    } else {
      replaceSkeletonsWithMovies(movies);
      updateLoadMoreButton({ isLast, page: state.page });
      setLoadMoreDisabled(false);
    }
  } catch (error) {
    state = { ...state, status: STATUS.ERROR, error };
    renderError(toUserMessage(error));
  }
}

window.addEventListener("load", loadNextPage);
