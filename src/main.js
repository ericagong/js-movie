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
    return {movies: data.results, isLast: data.page === data.total_pages};
  } catch (error) {
    console.error("🚨 영화 불러오기 실패:", error);
    return {movies: [], isLast: false};
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
        <button id="load-more-movies" data-page="1" style="visibility: ${isLast ? "hidden": "visible"}">더보기</button>
    </div>
  `;
}

addEventListener("load", async () => {
  // 초기 렌더링
  const $app = document.querySelector("#app");
  const {movies, isLast} = await getMovies();
  $app.innerHTML = createPopularMoviesSection(movies, isLast);

  // 더보기 버튼 클릭 시 영화 목록 추가 조회
  const $loadMoreButton = document.querySelector("#load-more-movies");
  $loadMoreButton.addEventListener("click", async () => {
    const nextPage = Number($loadMoreButton.dataset.page) + 1;
    const {movies, isLast} = await getMovies(nextPage);
    
    $loadMoreButton.style.visibility = isLast ? "hidden" : "visible";
    $loadMoreButton.dataset.page = isLast ? null : nextPage;
    
    const $movieCardView = document.querySelector(".movie-card-view");
    $movieCardView.innerHTML += movies.map(createMovieCard).join("");
  });
});