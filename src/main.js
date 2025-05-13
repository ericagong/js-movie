import { API_KEY } from "./env.js";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w200";
const BASE_URL = "https://api.themoviedb.org/3/movie/popular";

const createMovieItem = ({ id, poster_path, title, vote_average }) => `
  <li class="movie-item">
    <img class="movie-poster" src="${BASE_IMAGE_URL}${poster_path}" alt="${title}" />
    <div class="movie-title">${title}</div>
    <div class="movie-rate">${vote_average}</div>
  </li>
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

function createMovieList(movies) {
  return `
    <ul class="movie-list">
      ${movies.map(createMovieItem).join("")}
    </ul>
  `;
}

function createMovieListContainer(movies) {
  return `
    <div class="movie-list-container">
      <div class="movie-list-title">지금 인기 있는 영화</div>
      ${createMovieList(movies)}
      <button class="load-more" data-page="1">더보기</button>
    </div>
  `;
}

addEventListener("load", async () => {
  const $app = document.querySelector("#app");
  const initialMovies = await getMovies();
  $app.innerHTML = createMovieListContainer(initialMovies);

  const $loadMoreButton = document.querySelector(".load-more");

  $loadMoreButton.addEventListener("click", async () => {
    const nextPage = Number($loadMoreButton.dataset.page) + 1;
    const movies = await getMovies(nextPage);

    const $movieList = document.querySelector(".movie-list");
    $movieList.innerHTML += movies.map(createMovieItem).join("");

    $loadMoreButton.dataset.page = nextPage;
  });
});
