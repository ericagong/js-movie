// DOM 부수효과 영역 — templates.js 의 string 을 실제 DOM 으로 반영.
// main.js (이벤트 + 흐름) 와 templates.js (순수 string 생성) 사이의 경계.

import {
  createBanner,
  createPopularMovies,
  createFooter,
  createErrorMessage,
  createMovieCard,
  createSkeletonCards,
  createInitialSkeletonPage,
} from "./templates.js";

const $app = () => document.querySelector("#app");
const $movieCardView = () => document.querySelector(".movie-card-view");
const $loadMoreButton = () => document.querySelector("#load-more-movies");

function renderInitialSkeleton() {
  $app().innerHTML = createInitialSkeletonPage();
}

function renderMain({ bannerMovie, movies, isLast }) {
  $app().innerHTML =
    createBanner(bannerMovie) +
    createPopularMovies(movies, isLast) +
    createFooter();
}

function renderError(message) {
  $app().innerHTML = createErrorMessage(message);
}

function appendSkeletonsToMovieList() {
  $movieCardView().innerHTML += createSkeletonCards();
}

function replaceSkeletonsWithMovies(movies) {
  const $skeletonItems = [...$movieCardView().querySelectorAll(".skeleton")];
  $skeletonItems.forEach((el, index) => {
    const $li = el.closest("li");
    if (movies[index]) {
      $li.outerHTML = createMovieCard(movies[index]);
    } else {
      $li.remove();
    }
  });
}

function updateLoadMoreButton({ isLast, page }) {
  const $btn = $loadMoreButton();
  $btn.style.visibility = isLast ? "hidden" : "visible";
  $btn.dataset.page = isLast ? null : page;
}

function setLoadMoreDisabled(disabled) {
  $loadMoreButton().disabled = disabled;
}

function bindLoadMoreClick(handler) {
  $loadMoreButton().addEventListener("click", handler);
}

export {
  renderInitialSkeleton,
  renderMain,
  renderError,
  appendSkeletonsToMovieList,
  replaceSkeletonsWithMovies,
  updateLoadMoreButton,
  setLoadMoreDisabled,
  bindLoadMoreClick,
};
