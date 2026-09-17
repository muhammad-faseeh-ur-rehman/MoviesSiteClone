const API_KEY = "PUT_YOUR_TMDB_API_KEY_HERE";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
let movies = [];
let currentPage = 1;
const genres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    10752: "War",
    37: "Western"
};
function formatMovie(movie) {
    return {
        id: movie.id,
        title:
            movie.title || "Unknown",
        year:
            movie.release_date
                ? movie.release_date.split("-")[0]
                : "N/A",
        genre:
            movie.genre_ids?.length
                ? genres[movie.genre_ids[0]] || "Other"
                : "Other",
        rating:
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A",
        image:
            movie.poster_path
                ? IMAGE_URL + movie.poster_path
                : "https://via.placeholder.com/500x750?text=No+Poster",
        description:
            movie.overview ||
            "No description available."
    };
}
function createMovieCard(movie) {
    return `
        <div class="col-6 col-md-4 col-lg-3">
            <div
                class="movie-card"
                onclick="showMovie(${movie.id})"
            >
                <img
                    src="${movie.image}"
                    alt="${movie.title}"
                    loading="lazy"
                >
                <div class="movie-play">
                    <i class="bi bi-play-fill"></i>
                </div>
                <div class="movie-overlay">
                    <div class="movie-title">
                        ${movie.title}
                    </div>
                    <div class="movie-meta">
                        ${movie.year}
                        &nbsp; • &nbsp;
                        ${movie.genre}
                        <span class="movie-rating">
                            &nbsp; ⭐ ${movie.rating}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
function displayMovies(list, elementId) {
    const container =
        document.getElementById(elementId);
    container.innerHTML =
        list.map(createMovieCard).join("");
}
async function loadPopularMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        const popular =
            data.results.map(formatMovie);
        movies = popular;
        displayMovies(
            popular.slice(0, 8),
            "popularMovies"
        );
    } catch (error) {
        console.error(
            "Popular movies error:",
            error
        );
    }
}
async function loadTrendingMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
        );
        const data =
            await response.json();
        const trending =
            data.results.map(formatMovie);
        displayMovies(
            trending.slice(0, 8),
            "trendingMovies"
        );
    } catch (error) {
        console.error(
            "Trending movies error:",
            error
        );
    }
}
async function loadMovies(page = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}`
        );
        const data =
            await response.json();
        const newMovies =
            data.results.map(formatMovie);
        if (page === 1) {
            movies = newMovies;
        } else {
            movies = [
                ...movies,
                ...newMovies
            ];
        }
        displayMovies(
            movies,
            "allMovies"
        );
    } catch (error) {
        console.error(
            "Movies loading error:",
            error
        );
    }
}
async function filterMovies(category, button) {
    document
        .querySelectorAll(".category-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });
    button.classList.add("active");
    if (category === "all") {
        currentPage = 1;
        await loadMovies(1);
        return;
    }
    const genreIDs = {
        Action: 28,
        Drama: 18,
        Comedy: 35,
        "Sci-Fi": 878
    };
    try {
        const genreID =
            genreIDs[category];
        const response =
            await fetch(
                `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreID}&sort_by=popularity.desc&page=1`
            );
        const data =
            await response.json();
        movies =
            data.results.map(formatMovie);
        displayMovies(
            movies,
            "allMovies"
        );
    } catch (error) {
        console.error(
            "Filter error:",
            error
        );
    }
}
async function showMovie(id) {
    try {
        const response =
            await fetch(

                `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`

            );
        const movie =
            await response.json();
        document.getElementById(
            "modalTitle"
        ).textContent =
            movie.title;


        document.getElementById(
            "modalMovieTitle"
        ).textContent =
            movie.title;


        document.getElementById(
            "modalImage"
        ).src =
            movie.poster_path
                ? IMAGE_URL + movie.poster_path
                : "";


        document.getElementById(
            "modalYear"
        ).textContent =
            movie.release_date
                ? movie.release_date.split("-")[0]
                : "N/A";


        document.getElementById(
            "modalGenre"
        ).textContent =
            movie.genres
                ?.map(g => g.name)
                .join(", ") ||
            "Unknown";


        document.getElementById(
            "modalRating"
        ).textContent =
            movie.vote_average
                ?.toFixed(1) ||
            "N/A";


        document.getElementById(
            "modalDescription"
        ).textContent =
            movie.overview ||
            "No description available.";


        const modal =
            new bootstrap.Modal(

                document.getElementById(
                    "movieModal"
                )

            );

        modal.show();

    } catch (error) {

        console.error(
            "Movie details error:",
            error
        );

    }

}

const searchButton =
    document.getElementById(
        "searchButton"
    );
const searchContainer =
    document.getElementById(
        "searchContainer"
    );
const closeSearch =
    document.getElementById(
        "closeSearch"
    );
const searchInput =
    document.getElementById(
        "searchInput"
    );
const searchResults =
    document.getElementById(
        "searchResults"
    );

searchButton.addEventListener(
    "click",
    () => {
        searchContainer
            .classList.add("show");
        searchInput.focus();
    }
);
closeSearch.addEventListener(
    "click",
    () => {
        searchContainer
            .classList.remove("show");
        searchInput.value = "";
        searchResults.innerHTML = "";
        searchResults.style.display =
            "none";
    }
);

let searchTimer;
searchInput.addEventListener(
    "input",
    () => {
        clearTimeout(searchTimer);
        const searchValue =
            searchInput.value.trim();

        if (!searchValue) {
            searchResults.innerHTML = "";
            searchResults.style.display =
                "none";
            return;
        }
        searchTimer =
            setTimeout(
                () =>
                    searchMovies(
                        searchValue
                    ),
                400
            );
    }
);
async function searchMovies(query) {
    try {
        const response =
            await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`

            );
        const data =
            await response.json();
        if (
            !data.results ||
            data.results.length === 0
        ) {
            searchResults.innerHTML =
                `
                <div class="no-results">
                    No movies found 😔
                </div>
                `;
            searchResults.style.display =
                "block";
            return;
        }
        searchResults.innerHTML =
            data.results
                .slice(0, 8)
                .map(movie => {
                    const formatted =
                        formatMovie(movie);
                    return `
                        <div
                            class="search-result-item"
                            onclick="showMovie(${formatted.id})"
                        >
                            <img
                                src="${formatted.image}"
                                alt="${formatted.title}"
                            >
                            <div
                                class="search-result-info"
                            >
                                <h6>
                                    ${formatted.title}
                                </h6>
                                <p>
                                    ${formatted.year}
                                    •
                                    ${formatted.genre}
                                </p>
                                <p
                                    class="search-result-rating"
                                >
                                    ⭐
                                    ${formatted.rating}
                                </p>
                            </div>
                        </div>
                    `;

                })
                .join("");
        searchResults.style.display =
            "block";
    } catch (error) {
        console.error(
            "Search error:",
            error
        );
    }
}
window.addEventListener(
    "scroll",
    () => {
        const navbar =
            document.querySelector(
                ".navbar"
            );

        if (window.scrollY > 50) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    }
);


// ===============================
// LOAD WEBSITE
// ===============================

loadTrendingMovies();

loadPopularMovies();

loadMovies();