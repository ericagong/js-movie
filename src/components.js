const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w200";
const BACKDROP_IMAGE_URL = "https://image.tmdb.org/t/p/w1280";

function createMovieCard({ id, poster_path, title, vote_average }) {
  return `
  <li>
    <div class="item" data-movie-id="${id}">
      <img
        class="poster"
        src="${BASE_IMAGE_URL}${poster_path}"
        alt="${title}"
      />
      <div class="item-desc">
        <p class="rate">
          <img src="./images/star_empty.png" class="star" /><span>${vote_average}</span>
        </p>
        <strong class="title">${title}</strong>
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
          <h2 id="popular-movies-title">지금 인기 있는 영화</h2>
          <ul class="movie-card-view">
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
      <div class="poster"></div>
      <div class="item-desc">
        <p class="rate"></p>
        <strong></strong>
      </div>
    </div>
  </li>
  `;
}

function createBanner({ backdrop_path, title, vote_average }) {
  const backgroundStyle = backdrop_path
    ? `background-image: url(${BACKDROP_IMAGE_URL}${backdrop_path})`
    : "background-color: var(--color-bluegray-100)";

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

export {createPopularMovies, createMovieCard, createErrorMessage, createSkeletonCard, createBanner, createBannerSkeleton, createFooter};
