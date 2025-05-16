import "../styles/main.css";
import { API_KEY } from "./env.js";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w200";
const BASE_URL = "https://api.themoviedb.org/3/movie/popular";

const createMovieCard = ({ id, poster_path, title, vote_average }) => `
  <div class="movie-card" key="${id}">
    <div class="poster" style="background-image: url(${BASE_IMAGE_URL}${poster_path})"></div>
    <div class="rate">${vote_average}</div>
    <div class="title">${title}</div>
  </div>
`;

class HTTPResponseError extends Error {
  constructor(status) {
    let message = "알 수 없는 오류가 발생했습니다.";
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

async function getMovies(page = 1) {
  const url = `${BASE_URL}?api_key=${API_KEY}&language=ko-KR&page=${page}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

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

function createMovieCardView(movies) {
  return `
    <div class="movie-card-view">
      ${movies.map(createMovieCard).join("")}
    </div>
  `;
}

function createPopularMoviesSection(movies, isLast) {
  return `
    <div class="popular-movies-section">
        <div id="popular-movies-title">지금 인기 있는 영화</div>
        ${createMovieCardView(movies)}
        <button id="load-more-movies" data-page="1" style="visibility: ${
          isLast ? "hidden" : "visible"
        }">더보기</button>
    </div>
  `;
}

function createErrorMessage(errorMessage) {
  return `
    <div class="error-message">${errorMessage}</div>
  `;
}

addEventListener("load", async () => {
  // 초기 렌더링
  const $app = document.querySelector("#app");
  const { movies, isLast, hasError, errorMessage } = await getMovies();

  if (!!hasError) {
    $app.innerHTML = createErrorMessage(errorMessage);
    return;
  }

  $app.innerHTML = createPopularMoviesSection(movies, isLast);

  // 더보기 버튼 클릭 시 영화 목록 추가 조회
  const $loadMoreButton = document.querySelector("#load-more-movies");
  $loadMoreButton.addEventListener("click", async () => {
    const nextPage = Number($loadMoreButton.dataset.page) + 1;
    const { movies, isLast, hasError, errorMessage } = await getMovies(
      nextPage
    );

    if (!!hasError) {
      $app.innerHTML = createErrorMessage(errorMessage);
      return;
    }

    $loadMoreButton.style.visibility = isLast ? "hidden" : "visible";
    $loadMoreButton.dataset.page = isLast ? null : nextPage;

    const $movieCardView = document.querySelector(".movie-card-view");
    $movieCardView.innerHTML += movies.map(createMovieCard).join("");
  });
});
