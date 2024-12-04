import { fetchMovieDetails, fetchMovies, fetchMoviesByCategory, Movie, MovieDetails, searchMovies } from "./api/apiFetch";
import "./scss/styles.scss";
import 'bootstrap';

function getMovieIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('movieId');
}


let currentPage: number = 1;
let total_pages: number = 500;
let currentCategory: string = 'popular'; // category by default

const moviesContainer: HTMLElement | null = document.getElementById('movies-container');
const currentPageSpan: HTMLElement | null = document.getElementById('currentPage');
const nextPageButton: HTMLElement | null = document.getElementById('nextPage');
const prevPageButton: HTMLElement | null = document.getElementById('prevPage');
const layoutButtonsContainer: HTMLElement | null = document.querySelector('.mb-3');
const paginationContainer: HTMLElement | null = document.querySelector('.pagination-container');
const searchForm = document.querySelector('.d-flex') as HTMLFormElement;
const searchInput = document.querySelector('.form-control') as HTMLInputElement;

const categoryDropdownItems = document.querySelectorAll('.dropdown-item');

function displayMovies(movies: Movie[]): void {
    if (!moviesContainer) return;

    moviesContainer.innerHTML = '';

    movies.forEach((movie: Movie) => {
        const { id, title, poster_path, overview, release_date } = movie;
        const posterUrl: string = `https://image.tmdb.org/t/p/w500/${poster_path}`;

        const movieHTML: string = `
           <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-4">
                <div class="card h-100 movie-card" data-id="${id}">
                    <img src="${posterUrl}" class="card-img-top" alt="${title}">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${overview.substring(0, 100)}...</p>
                    </div>
                    <div class="card-footer">
                        <small class="text-body-secondary">Out in: ${release_date}</small>
                    </div>
                </div>
            </div>
        `;
        moviesContainer.innerHTML += movieHTML;
    });

    document.querySelectorAll('.movie-card').forEach((card) => {
        card.addEventListener('click', () => {
            const movieId = card.getAttribute('data-id');
            if (movieId) {
                window.location.href = `?movieId=${movieId}`;
            }
        });
    });
}
async function getMoviesByCategory(category: string, page: number): Promise<void> {
    const movies = await fetchMoviesByCategory(category, page);
    displayMovies(movies);
    if (currentPageSpan) currentPageSpan.textContent = String(currentPage);
    updateBtn(total_pages);

}
function displayMovieDetails(movie: MovieDetails): void {
    if (!moviesContainer) return;

    const { title, poster_path, overview, release_date, runtime, genres } = movie;
    const posterUrl = `https://image.tmdb.org/t/p/w500/${poster_path}`;

    moviesContainer.innerHTML = `
       <div class="col-12 col-md-8 mx-auto">
      <div class="card h-100">
        <img src="${posterUrl}" class="card-img-top" alt="${title}">
        <div class="card-body">
          <h2 class="card-title">${title}</h2>
          <p><strong>Out in:</strong> ${release_date}</p>
          <p><strong>Runtime:</strong> ${runtime} minutes</p>
          <p><strong>Genres:</strong> ${genres.map(genre => genre.name).join(', ')}</p>
          <p class="card-text">${overview}</p>
          <button id="back-button" class="btn btn-secondary">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width: 20px; margin-right: 5px;">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
    </svg>
</button>
        </div>
      </div>
    </div>
    `;

    const backButton = document.getElementById('back-button');
    backButton?.addEventListener('click', () => {
        window.history.back();
    });

}


async function getPage(page: number): Promise<void> {
    const movies = await fetchMovies(page);
    displayMovies(movies);
    if (currentPageSpan) currentPageSpan.textContent = String(currentPage);
    updateBtn(total_pages);
}

async function loadMovieDetails(movieId: string): Promise<void> {
    const movie = await fetchMovieDetails(movieId);
    displayMovieDetails(movie);
}

function updateBtn(total_pages: number): void {
    if (currentPage === 1) {
        prevPageButton?.setAttribute('disabled', 'true');
    } else {
        prevPageButton?.removeAttribute('disabled');
    }

    if (currentPage === total_pages) {
        nextPageButton?.setAttribute('disabled', 'true');
    } else {
        nextPageButton?.removeAttribute('disabled');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const movieId = getMovieIdFromUrl();

    if (movieId) {
        loadMovieDetails(movieId);

        if (layoutButtonsContainer) {
            layoutButtonsContainer.style.display = 'none';
        }
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        nextPageButton?.setAttribute('style', 'display:none');
        prevPageButton?.setAttribute('style', 'display:none');
        currentPageSpan?.setAttribute('style', 'display:none');

    } else {
        // Cargar la lista de películas si no hay `movieId`
        // getPage(1);
        getMoviesByCategory(currentCategory, currentPage);
        if (layoutButtonsContainer) {
            layoutButtonsContainer.style.display = 'block';
        }
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }
        nextPageButton?.setAttribute('style', 'display:block');
        prevPageButton?.setAttribute('style', 'display:block');
        currentPageSpan?.setAttribute('style', 'display:block');

    }
});

categoryDropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedCategory = (e.target as HTMLElement).getAttribute('data-category');
        const selectedCategoryText = (e.target as HTMLElement).textContent;
        if (selectedCategory && selectedCategoryText) {
            currentCategory = selectedCategory;
            currentPage = 1;
            const dropdownButton = document.getElementById('categoryDropdown');
            if (dropdownButton) {
                dropdownButton.textContent = selectedCategoryText;
            }
            getMoviesByCategory(currentCategory, currentPage);
        }
    });
});

nextPageButton?.addEventListener('click', () => {
    if (currentPage < total_pages) {
        currentPage++;
        getMoviesByCategory(currentCategory, currentPage);
        // getPage(currentPage);
    }
});

prevPageButton?.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        getMoviesByCategory(currentCategory, currentPage);
        // getPage(currentPage);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.getElementById('categoryDropdown');
    if (dropdownButton) {
        dropdownButton.textContent = 'Popular';
    }
    getMoviesByCategory(currentCategory, currentPage);
});

if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const query = searchInput.value.trim();

        if (query === '') {
            getMoviesByCategory(currentCategory, 1);
        } else {
            searchforMovies(query, 1);

        }
    });
}
async function searchforMovies(query: string, page: number): Promise<void> {
    const movies = await searchMovies(query, page);
    displayMovies(movies);
    if (currentPageSpan) currentPageSpan.textContent = String(page);
    updateBtn(total_pages);
}

