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

async function getMovies(page = 1) {
  const url = `${BASE_URL}?api_key=${API_KEY}&language=ko-KR&page=${page}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("API 요청 실패");
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("🚨 영화 불러오기 실패:", error);
    return [];
  }
}

function createMovieCardView(movies) {
  return `
    <div class="movie-card-view">
      ${movies.map(createMovieCard).join("")}
    </div>
  `;
}

function createPopularMoviesSection(movies) {
  return `
    <div class="popular-movies-section">
        <div id="popular-movies-title">지금 인기 있는 영화</div>
        ${createMovieCardView(movies)}
        <button id="load-more-movies" data-page="1">더보기</button>
    </div>
  `;
}

addEventListener("load", async () => {
  const $app = document.querySelector("#app");

  const initialMovies = await getMovies();
  $app.innerHTML = createPopularMoviesSection(initialMovies);

  const $loadMoreButton = document.querySelector("#load-more-movies");

  $loadMoreButton.addEventListener("click", async () => {
    const nextPage = Number($loadMoreButton.dataset.page) + 1;
    const movies = await getMovies(nextPage);

    const $movieCardView = document.querySelector(".movie-card-view");
    $movieCardView.innerHTML += movies.map(createMovieCard).join("");

    $loadMoreButton.dataset.page = nextPage;
  });
});