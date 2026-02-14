(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w200";
const BACKDROP_IMAGE_URL = "https://image.tmdb.org/t/p/w1280";
function createMovieCard({ id, poster_path, title, vote_average }) {
  return `
  <li>
    <div class="item" data-movie-id="${id}">
      <img
        class="thumbnail"
        src="${BASE_IMAGE_URL}${poster_path}"
        alt="${title}"
      />
      <div class="item-desc">
        <p class="rate">
          <img src="./images/star_empty.png" class="star" /><span>${vote_average}</span>
        </p>
        <strong>${title}</strong>
      </div>
    </div>
  </li>
  `;
}
function createLoadMoreButton(isLast) {
  return `
    <button id="load-more-movies" data-page="1" style="visibility: ${isLast ? "hidden" : "visible"}">더보기</button>
  `;
}
function createPopularMovies(movies, isLast) {
  return `
    <div class="container">
      <main>
        <section>
          <h2>지금 인기 있는 영화</h2>
          <ul class="thumbnail-list">
            ${movies.map(createMovieCard).join("")}
          </ul>
          ${createLoadMoreButton(isLast)}
        </section>
      </main>
    </div>
  `;
}
function createErrorMessage(errorMessage) {
  return `
    <div class="error-message">${errorMessage}</div>
  `;
}
function createSkeletonCard() {
  return `
  <li>
    <div class="item skeleton">
      <div class="thumbnail"></div>
      <div class="item-desc">
        <p class="rate"></p>
        <strong></strong>
      </div>
    </div>
  </li>
  `;
}
function createBanner({ backdrop_path, title, vote_average }) {
  const backgroundStyle = backdrop_path ? `background-image: url(${BACKDROP_IMAGE_URL}${backdrop_path})` : "background-color: var(--color-bluegray-100)";
  return `
  <header>
    <div class="background-container" style="${backgroundStyle}">
      <div class="overlay" aria-hidden="true"></div>
      <div class="top-rated-container">
        <h1 class="logo">
          <img src="./images/logo.png" alt="MovieList" />
        </h1>
        <div class="top-rated-movie">
          <div class="rate">
            <img src="./images/star_empty.png" class="star" alt="star" />
            <span class="rate-value">${vote_average}</span>
          </div>
          <div class="title">${title}</div>
          <button class="primary detail">자세히 보기</button>
        </div>
      </div>
    </div>
  </header>
  `;
}
function createBannerSkeleton() {
  return `
  <header>
    <div class="skeleton-banner">
      <div class="skeleton-logo"></div>
      <div class="skeleton-content">
        <div class="skeleton-rate"></div>
        <div class="skeleton-banner-title"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>
  </header>
  `;
}
function createFooter() {
  return `
  <footer class="footer">
    <p>&copy; Erica Gong All Rights Reserved.</p>
  </footer>
  `;
}
const API_KEY = "56b44d72b18c9bd87028282281ca901b";
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
const DEFAULT_TIMEOUT = 3e3;
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
      errorMessage: null
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        movies: [],
        isLast: null,
        hasError: true,
        errorMessage: "서버 응답이 지연되고 있습니다."
      };
    }
    if (error.name === "TypeError") {
      return {
        movies: [],
        isLast: null,
        hasError: true,
        errorMessage: "네트워크 오류가 발생했습니다."
      };
    }
    if (error instanceof HTTPResponseError) {
      return {
        movies: [],
        isLast: null,
        hasError: true,
        errorMessage: error.message
      };
    }
    return {
      movies: [],
      isLast: null,
      hasError: true,
      errorMessage: "알 수 없는 오류가 발생했습니다."
    };
  }
}
const $app = document.querySelector("#app");
function renderErrorMessage(message) {
  $app.innerHTML = createErrorMessage(message);
}
function renderMainPage(bannerMovie, movies, isLast) {
  $app.innerHTML = createBanner(bannerMovie) + createPopularMovies(movies, isLast) + createFooter();
}
function setEventListeners() {
  const $loadMoreButton = document.querySelector("#load-more-movies");
  $loadMoreButton.addEventListener("click", renderMoreMovies);
}
async function renderMoreMovies() {
  const $loadMoreButton = document.querySelector("#load-more-movies");
  const currentPage = Number($loadMoreButton.dataset.page);
  const $thumbnailList = document.querySelector(".thumbnail-list");
  const skeletonHTML = Array.from({ length: 20 }, createSkeletonCard).join("");
  $thumbnailList.innerHTML += skeletonHTML;
  const { movies, isLast, hasError, errorMessage } = await fetchMovies(currentPage + 1);
  const $skeletonItems = [...$thumbnailList.querySelectorAll(".skeleton")];
  if (!hasError) {
    $skeletonItems.forEach((el, index) => {
      const $li = el.closest("li");
      if (movies[index]) {
        $li.outerHTML = createMovieCard(movies[index]);
      } else {
        $li.remove();
      }
    });
    $loadMoreButton.style.visibility = isLast ? "hidden" : "visible";
    $loadMoreButton.dataset.page = isLast ? null : currentPage + 1;
  } else renderErrorMessage(errorMessage);
}
async function initialRender() {
  $app.innerHTML = `
    ${createBannerSkeleton()}
    <div class="container">
      <main>
        <section>
          <h2 class="skeleton-title"></h2>
          <ul class="thumbnail-list">
            ${Array.from({ length: 20 }, createSkeletonCard).join("")}
          </ul>
        </section>
      </main>
    </div>
  `;
  const { movies, isLast, hasError, errorMessage } = await fetchMovies();
  if (!hasError) {
    const bannerMovie = movies[0];
    renderMainPage(bannerMovie, movies, isLast);
    setEventListeners();
  } else renderErrorMessage(errorMessage);
}
window.addEventListener("load", initialRender);
