const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w200";
function createMovieCard({ id, poster_path, title, vote_average }) {
  return `
  <div class="movie-card" key="${id}">
    <div class="poster" style="background-image: url(${BASE_IMAGE_URL}${poster_path})"></div>
    <div class="rate">${vote_average}</div>
    <div class="title">${title}</div>
  </div>
  `;
}

function createLoadMoreButton(isLast) {
  return `
    <button id="load-more-movies" data-page="1" style="visibility: ${isLast ? "hidden" : "visible"}">더보기</button>
  `;
}

function createPopularMovies(movies, isLast) {
  return `
    <div class="popular-movies-layout">
        <div id="popular-movies-title">지금 인기 있는 영화</div>
          <div class="movie-card-layout">
            ${movies.map(createMovieCard).join("")}
          </div>
          ${createLoadMoreButton(isLast)}
    </div>
  `;
}

function createErrorMessage(errorMessage) {
  return `
    <div class="error-message">${errorMessage}</div>
  `;
}

export {createPopularMovies, createMovieCard, createErrorMessage};