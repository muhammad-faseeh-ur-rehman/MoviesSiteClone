// ===============================
// TVMAZE API
// ===============================

const BASE_URL = "https://api.tvmaze.com";

let shows = [];


// ===============================
// CONVERT TVMAZE SHOW
// ===============================

function formatShow(show) {

    return {
        id: show.id,

        title: show.name || "Unknown",

        year:
            show.premiered
                ? show.premiered.split("-")[0]
                : "N/A",

        genre:
            show.genres && show.genres.length > 0
                ? show.genres[0]
                : "Other",

        rating:
            show.rating && show.rating.average
                ? show.rating.average.toFixed(1)
                : "N/A",

        image:
            show.image && show.image.medium
                ? show.image.medium
                : "https://via.placeholder.com/500x750?text=No+Poster",

        description:
            show.summary
                ? show.summary.replace(/<[^>]*>/g, "")
                : "No description available."
    };
}


// ===============================
// CREATE MOVIE CARD
// ===============================

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
                            &nbsp;
                            <i class="bi bi-star-fill"></i>
                            ${movie.rating}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    `;
}


// ===============================
// DISPLAY SHOWS
// ===============================

function displayMovies(list, elementId) {

    const container =
        document.getElementById(elementId);

    if (!container) return;

    container.innerHTML =
        list.map(createMovieCard).join("");
}


// ===============================
// LOAD ALL SHOWS
// ===============================

async function loadShows() {

    try {

        const response =
            await fetch(`${BASE_URL}/shows`);

        const data =
            await response.json();

        shows =
            data.map(formatShow);


        // First 8 for trending
        displayMovies(
            shows.slice(0, 8),
            "trendingMovies"
        );


        // Next 8 for popular
        displayMovies(
            shows.slice(8, 16),
            "popularMovies"
        );


        // All shows
        displayMovies(
            shows,
            "allMovies"
        );


    } catch (error) {

        console.error(
            "Error loading shows:",
            error
        );

        document.getElementById(
            "allMovies"
        ).innerHTML = `
            <p class="text-danger">
                Failed to load shows.
            </p>
        `;
    }
}


// ===============================
// FILTER SHOWS BY GENRE
// ===============================

function filterMovies(category, button) {

    document
        .querySelectorAll(".category-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    button.classList.add("active");


    if (category === "all") {

        displayMovies(
            shows,
            "allMovies"
        );

        return;
    }


    const filteredShows =
        shows.filter(show => {

            return show.genre === category;

        });


    displayMovies(
        filteredShows,
        "allMovies"
    );
}


// ===============================
// SHOW DETAILS
// ===============================

async function showMovie(id) {

    try {

        const response =
            await fetch(
                `${BASE_URL}/shows/${id}`
            );

        const show =
            await response.json();


        document.getElementById(
            "modalTitle"
        ).textContent =
            show.name;


        document.getElementById(
            "modalMovieTitle"
        ).textContent =
            show.name;


        document.getElementById(
            "modalImage"
        ).src =
            show.image && show.image.original
                ? show.image.original
                : "https://via.placeholder.com/600x900?text=No+Poster";


        document.getElementById(
            "modalYear"
        ).textContent =
            show.premiered
                ? show.premiered.split("-")[0]
                : "N/A";


        document.getElementById(
            "modalGenre"
        ).textContent =
            show.genres &&
            show.genres.length > 0
                ? show.genres.join(", ")
                : "Unknown";


        document.getElementById(
            "modalRating"
        ).textContent =
            show.rating &&
            show.rating.average
                ? show.rating.average
                : "N/A";


        document.getElementById(
            "modalDescription"
        ).innerHTML =
            show.summary ||
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
            "Details error:",
            error
        );

    }
}


// ===============================
// SEARCH
// ===============================

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


// Open search

searchButton.addEventListener(
    "click",
    () => {

        searchContainer
            .classList.add("show");

        searchInput.focus();

    }
);


// Close search

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


// ===============================
// SEARCH TVMAZE
// ===============================

let searchTimer;


searchInput.addEventListener(
    "input",
    () => {

        clearTimeout(searchTimer);


        const value =
            searchInput.value.trim();


        if (!value) {

            searchResults.innerHTML = "";

            searchResults.style.display =
                "none";

            return;
        }


        searchTimer =
            setTimeout(
                () => searchShows(value),
                400
            );

    }
);


async function searchShows(query) {

    try {

        const response =
            await fetch(
                `${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`
            );


        const data =
            await response.json();


        if (
            !data ||
            data.length === 0
        ) {

            searchResults.innerHTML = `
                <div class="no-results">
                    No shows found 😔
                </div>
            `;

            searchResults.style.display =
                "block";

            return;
        }


        searchResults.innerHTML =
            data
                .slice(0, 8)
                .map(result => {

                    const show =
                        formatShow(
                            result.show
                        );


                    return `

                        <div
                            class="search-result-item"
                            onclick="showMovie(${show.id})"
                        >

                            <img
                                src="${show.image}"
                                alt="${show.title}"
                            >

                            <div
                                class="search-result-info"
                            >

                                <h6>
                                    ${show.title}
                                </h6>

                                <p>
                                    ${show.year}
                                    •
                                    ${show.genre}
                                </p>

                                <p
                                    class="search-result-rating"
                                >
                                    ⭐ ${show.rating}
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


// ===============================
// NAVBAR SCROLL
// ===============================

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

loadShows();