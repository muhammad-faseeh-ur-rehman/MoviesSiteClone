const TMDB_API_KEY = "8aca6d41987b60c86b7ef91c61477dbd";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "original";

let allMovies = [];
let trendingMovies = [];
let popularMovies = [];
let currentMovieId = null;
let searchTimeout = null;

function checkApiKey() {
    if (
        !TMDB_API_KEY ||
        TMDB_API_KEY === "YOUR_TMDB_API_KEY"
    ) {
        console.error(
            "TMDB API key is missing. Add your API key to script.js."
        );
        showApiKeyMessage();
        return false;
    }
    return true;
}
function showApiKeyMessage() {
    const containers = [
        "trendingMovies",
        "popularMovies",
        "allMovies"
    ];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = `
            <div class="loading">
                <div style="text-align:center;">
                    <i
                        class="bi bi-key"
                        style="font-size:40px;color:#e50914;"
                    ></i>
                    <p style="color:#aaa;margin-top:15px;">
                        Add your TMDB API key in script.js
                    </p>
                </div>
            </div>
        `;
    });
}
async function tmdbFetch(endpoint) {
    if (!checkApiKey()) {
        throw new Error("TMDB API key missing.");
    }
    const separator = endpoint.includes("?")
        ? "&"
        : "?";
    const url =
        `${TMDB_BASE_URL}${endpoint}` +
        `${separator}api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `TMDB request failed: ${response.status}`
        );
    }
    return await response.json();
}
function getPoster(path) {
    if (!path) {
        return "https://via.placeholder.com/500x750/151515/ffffff?text=No+Poster";
    }
    return `${TMDB_IMAGE_URL}${POSTER_SIZE}${path}`;
}
function getBackdrop(path) {
    if (!path) {
        return "";
    }
    return `${TMDB_IMAGE_URL}${BACKDROP_SIZE}${path}`;
}
function formatMovie(movie) {
    return {
        id: movie.id,
        title:
            movie.title ||
            movie.name ||
            "Unknown Movie",
        year:
            movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A",
        rating:
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A",
        poster: getPoster(movie.poster_path),
        backdrop: getBackdrop(movie.backdrop_path),
        description:
            movie.overview ||
            "No description available.",
        genreIds:
            movie.genre_ids || [],
        originalTitle:
            movie.original_title || movie.title || ""
    };

}
const genreNames = {
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
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};
function getGenres(movie) {
    if (!movie.genreIds || movie.genreIds.length === 0) {
        return "Movie";
    }
    return movie.genreIds
        .slice(0, 2)
        .map(id => genreNames[id] || "")
        .filter(Boolean)
        .join(" • ");
}

function createMovieCard(movie) {
    return `
        <div
            class="movie-card"
            onclick="showMovie(${movie.id})"
        >
            <img
                class="movie-poster"
                src="${movie.poster}"
                alt="${escapeHTML(movie.title)}"
                loading="lazy"
            >
            <button
                class="movie-play"
                onclick="event.stopPropagation(); playMovie(${movie.id})"
                title="Play Trailer"
            >
                <i class="bi bi-play-fill"></i>
            </button>
            <div class="movie-details">

                <div class="movie-title">
                    ${escapeHTML(movie.title)}
                </div>
                <div class="movie-meta">
                    ${movie.year}
                    <span class="movie-rating">
                        <i class="bi bi-star-fill"></i>
                        ${movie.rating}
                    </span>
                </div>
            </div>
        </div>
    `;
}
function displayMovies(movies, containerId) {
    const container =
        document.getElementById(containerId);
    if (!container) return;
    if (!movies || movies.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <p style="color:#777;">
                    No movies found.
                </p>
            </div>
        `;
        return;
    }
    container.innerHTML =
        movies
            .map(movie => createMovieCard(movie))
            .join("");
}
async function loadTrendingMovies() {
    try {
        const data =
            await tmdbFetch(
                "/trending/movie/week"
            );
        trendingMovies =
            data.results
                .map(formatMovie)
                .filter(movie => movie.poster);
        displayMovies(
            trendingMovies.slice(0, 10),
            "trendingMovies"
        );
        if (trendingMovies.length > 0) {
            setupHero(trendingMovies[0]);
        }
    } catch (error) {
        console.error(error);
        showError(
            "trendingMovies",
            "Unable to load trending movies."
        );
    }

}
async function loadPopularMovies() {
    try {
        const data =
            await tmdbFetch(
                "/movie/popular?language=en-US&page=1"
            );
        popularMovies =
            data.results
                .map(formatMovie)
                .filter(movie => movie.poster);
        displayMovies(
            popularMovies.slice(0, 10),
            "popularMovies"
        );
    } catch (error) {
        console.error(error);
        showError(
            "popularMovies",
            "Unable to load popular movies."
        );
    }
}

async function loadAllMovies() {
    try {
        const data =
            await tmdbFetch(
                "/discover/movie?language=en-US&sort_by=popularity.desc&page=1"
            );
        allMovies =
            data.results
                .map(formatMovie)
                .filter(movie => movie.poster);
        displayMovies(
            allMovies,
            "allMovies"
        );
    } catch (error) {
        console.error(error);
        showError(
            "allMovies",
            "Unable to load movies."
        );
    }

}

function setupHero(movie) {
    if (!movie) return;
    const hero = document.querySelector(".hero");
    if (movie.backdrop) {
        hero.style.backgroundImage = `
            linear-gradient(
                90deg,
                #080808 0%,
                rgba(8,8,8,0.88) 35%,
                rgba(8,8,8,0.35) 70%,
                rgba(8,8,8,0.1) 100%
            ),
            url("${movie.backdrop}")
        `;
    }
    document.getElementById("heroTitle").textContent =
        movie.title;
    document.getElementById("heroYear").textContent =
        movie.year;
    document.getElementById("heroRating").innerHTML =
        `<i class="bi bi-star-fill"></i> ${movie.rating}`;
    document.getElementById("heroGenre").textContent =
        getGenres(movie);
    document.getElementById("heroDescription").textContent =
        movie.description;
    document.getElementById("heroPlay").onclick =
        () => playMovie(movie.id);
    document.getElementById("heroInfo").onclick =
        () => showMovie(movie.id);
}

async function showMovie(movieId) {
    currentMovieId = movieId;
    try {
        const movie =
            await tmdbFetch(
                `/movie/${movieId}?language=en-US`
            );
        document.getElementById("modalImage").src =
            getPoster(movie.poster_path);
        document.getElementById("modalMovieTitle").textContent =
            movie.title || "Unknown Movie";
        document.getElementById("modalYear").textContent =
            movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A";
        document.getElementById("modalGenre").textContent =
            movie.genres
                ?.slice(0, 2)
                .map(genre => genre.name)
                .join(" • ") ||
            "Movie";
        document.getElementById("modalRating").textContent =
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A";
        document.getElementById("modalDescription").textContent =
            movie.overview ||
            "No description available.";
        const modal =
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById("movieModal")
            );
        modal.show();
    } catch (error) {
        console.error(error);
        alert("Unable to load movie information.");
    }
}

async function playMovie(movieId) {
    currentMovieId = movieId;
    const trailerFrame =
        document.getElementById("trailerFrame");
    const videoLoading =
        document.getElementById("videoLoading");
    const noTrailer =
        document.getElementById("noTrailer");
    trailerFrame.src = "";
    trailerFrame.style.display = "none";
    noTrailer.style.display = "none";
    videoLoading.style.display = "flex";

    const movieModalElement =
        document.getElementById("movieModal");
    const movieModal =
        bootstrap.Modal.getInstance(
            movieModalElement
        );
    if (movieModal) {
        movieModal.hide();
    }
    const playerModal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("playerModal")
        );
    playerModal.show();
    try {
        /*
         * TMDB provides videos such as:
         * - YouTube trailers
         * - YouTube teasers
         * - featurettes
         */

        const data =
            await tmdbFetch(
                `/movie/${movieId}/videos?language=en-US`
            );
        const videos =
            data.results || [];

        let trailer =
            videos.find(video =>
                video.site === "YouTube" &&
                video.type === "Trailer" &&
                video.official === true
            );

        if (!trailer) {
            trailer =
                videos.find(video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer"
                );
        }
        if (!trailer) {
            trailer =
                videos.find(video =>
                    video.site === "YouTube" &&
                    video.type === "Teaser"
                );
        }
        if (!trailer || !trailer.key) {
            videoLoading.style.display = "none";
            noTrailer.style.display = "flex";
            return;
        }
        /*
         * YouTube embed
         *
         * This plays the official trailer
         * inside your website.
         */

        const youtubeUrl =
            `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;


        trailerFrame.src = youtubeUrl;
        trailerFrame.style.display = "block";
        videoLoading.style.display = "none";

    } catch (error) {
        console.error(error);
        videoLoading.style.display = "none";
        noTrailer.style.display = "flex";
    }

}
document
    .getElementById("playerModal")
    .addEventListener(
        "hidden.bs.modal",
        function () {

            const frame =
                document.getElementById("trailerFrame");

            frame.src = "";

            frame.style.display = "none";

            document.getElementById(
                "videoLoading"
            ).style.display = "flex";

            document.getElementById(
                "noTrailer"
            ).style.display = "none";

        }
    );


document
    .getElementById("modalPlay")
    .addEventListener(
        "click",
        function () {

            if (currentMovieId) {

                playMovie(currentMovieId);

            }

        }
    );

const searchContainer =
    document.getElementById("searchContainer");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");


document
    .getElementById("openSearch")
    .addEventListener(
        "click",
        function () {

            searchContainer.classList.add("active");

            setTimeout(() => {

                searchInput.focus();

            }, 100);

        }
    );


document
    .getElementById("closeSearch")
    .addEventListener(
        "click",
        closeSearch
    );


function closeSearch() {

    searchContainer.classList.remove("active");

    searchInput.value = "";

    searchResults.innerHTML = "";

}

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            searchContainer.classList.contains("active")
        ) {

            closeSearch();

        }

    }
);

searchInput.addEventListener(
    "input",
    function () {

        const query =
            searchInput.value.trim();

        clearTimeout(searchTimeout);

        if (!query) {

            searchResults.innerHTML = "";

            return;
        }


        searchResults.innerHTML = `
            <div style="text-align:center;color:#777;padding:30px;">
                Searching...
            </div>
        `;


        searchTimeout =
            setTimeout(
                () => searchMovies(query),
                400
            );

    }
);

async function searchMovies(query) {

    try {

        const data =
            await tmdbFetch(
                `/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
            );


        const results =
            data.results
                .map(formatMovie)
                .filter(movie => movie.poster)
                .slice(0, 10);


        if (results.length === 0) {

            searchResults.innerHTML = `
                <div style="text-align:center;color:#777;padding:30px;">
                    No movies found.
                </div>
            `;

            return;
        }


        searchResults.innerHTML =
            results
                .map(movie => `

                    <div
                        class="search-result"
                        onclick="openSearchMovie(${movie.id})"
                    >

                        <img
                            src="${movie.poster}"
                            alt="${escapeHTML(movie.title)}"
                        >

                        <div>

                            <h5>
                                ${escapeHTML(movie.title)}
                            </h5>

                            <p>
                                ${movie.year}
                                •
                                ⭐ ${movie.rating}
                            </p>

                        </div>

                    </div>

                `)
                .join("");


    } catch (error) {

        console.error(error);

        searchResults.innerHTML = `
            <div style="text-align:center;color:#e50914;padding:30px;">
                Search failed. Check your API key.
            </div>
        `;

    }

}

function openSearchMovie(movieId) {

    closeSearch();

    showMovie(movieId);

}


function filterMovies(category, button) {
    document
        .querySelectorAll(".genre-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if (button) {
        button.classList.add("active");
    }

    if (category === "all") {

        displayMovies(
            allMovies,
            "allMovies"
        );

        return;
    }

    const genreMap = {

        action: 28,

        drama: 18,

        comedy: 35,

        "sci-fi": 878,

        horror: 27,

        thriller: 53

    };

    const genreId =
        genreMap[category];


    if (!genreId) {

        displayMovies(
            allMovies,
            "allMovies"
        );

        return;
    }


    const filtered =
        allMovies.filter(movie =>
            movie.genreIds.includes(genreId)
        );


    displayMovies(
        filtered,
        "allMovies"
    );

}

function scrollToMovies() {

    const section =
        document.getElementById("movies");

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth"
    });

}

window.addEventListener(
    "scroll",
    function () {

        const navbar =
            document.querySelector(".navbar");

        if (window.scrollY > 50) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }
);

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(".nav-link");


window.addEventListener(
    "scroll",
    function () {

        let current = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;

            if (
                window.scrollY >= sectionTop
            ) {

                current =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");

            if (
                link.getAttribute("href") ===
                `#${current}`
            ) {

                link.classList.add("active");

            }

        });

    }
);

function showError(containerId, message) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = `
        <div class="loading">

            <div style="text-align:center;">

                <i
                    class="bi bi-exclamation-circle"
                    style="font-size:40px;color:#e50914;"
                ></i>

                <p
                    style="color:#777;margin-top:15px;"
                >
                    ${message}
                </p>

            </div>

        </div>
    `;

}

function escapeHTML(text) {

    if (!text) return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

async function initializeWebsite() {

    if (!checkApiKey()) {
        return;
    }


    await Promise.all([
        loadTrendingMovies(),
        loadPopularMovies(),
        loadAllMovies()
    ]);

}

document.addEventListener(
    "DOMContentLoaded",
    initializeWebsite
);