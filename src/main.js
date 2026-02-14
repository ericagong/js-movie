import {createPopularMovies, createMovieCard, createErrorMessage} from "./components.js";
import {fetchMovies} from "./apis.js";


const $app = document.querySelector("#app");

function renderErrorMessage(message) {
  $app.innerHTML = createErrorMessage(message);
}

function renderMainPage(movies, isLast) {
  $app.innerHTML = createPopularMovies(movies, isLast);
}

function setEventListeners() {
  const $loadMoreButton = document.querySelector("#load-more-movies");

  $loadMoreButton.addEventListener("click", renderMoreMovies);
}

async function renderMoreMovies() {
  const $loadMoreButton = document.querySelector("#load-more-movies");
  const currentPage = Number($loadMoreButton.dataset.page);
  
  const { movies, isLast, hasError, errorMessage } = await fetchMovies(currentPage + 1);
  
  if(!hasError) {
    const $movieCardLayout = document.querySelector(".movie-card-layout");
    $movieCardLayout.innerHTML += movies.map(createMovieCard).join("");
    
    $loadMoreButton.style.visibility = isLast ? "hidden" : "visible";
    $loadMoreButton.dataset.page = isLast ? null : currentPage + 1;
  }
  
  else renderErrorMessage(errorMessage);
}

async function initialRender() {
  const { movies, isLast, hasError, errorMessage } = await fetchMovies();
  if(!hasError) {
    renderMainPage(movies, isLast);
    setEventListeners();
  }
  else renderErrorMessage(errorMessage);
}


window.addEventListener("load", initialRender);