import {createPopularMovies, createMovieCard, createErrorMessage, createSkeletonCard, createBanner, createBannerSkeleton, createFooter} from "./components.js";
import {fetchPopularMovies} from "./tmdb.js";
import {toUserMessage} from "./errors.js";


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

  const $movieCardView = document.querySelector(".movie-card-view");
  const skeletonHTML = Array.from({ length: 20 }, createSkeletonCard).join("");
  $movieCardView.innerHTML += skeletonHTML;

  try {
    const { movies, isLast } = await fetchPopularMovies(currentPage + 1);
    const $skeletonItems = [...$movieCardView.querySelectorAll(".skeleton")];

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
  } catch (error) {
    renderErrorMessage(toUserMessage(error));
  }
}


async function initialRender() {
  $app.innerHTML = `
    ${createBannerSkeleton()}
    <div class="container">
      <main>
        <section>
          <h2 class="skeleton-title"></h2>
          <ul class="movie-card-view">
            ${Array.from({ length: 20 }, createSkeletonCard).join("")}
          </ul>
        </section>
      </main>
    </div>
  `;

  try {
    const { movies, isLast } = await fetchPopularMovies();
    const bannerMovie = movies[0];
    renderMainPage(bannerMovie, movies, isLast);
    setEventListeners();
  } catch (error) {
    renderErrorMessage(toUserMessage(error));
  }
}


window.addEventListener("load", initialRender);
