const movies = [
    {
        id: 1,
        title: "The Last Adventure",
        year: 2026,
        genre: "Action",
        rating: 8.9,
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
        description:
            "A fearless explorer travels beyond the known world to uncover an ancient secret that could change humanity forever."
    },

    {
        id: 2,
        title: "Dark Horizon",
        year: 2025,
        genre: "Sci-Fi",
        rating: 8.7,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        description:
            "A mysterious signal from deep space leads a team of astronauts toward an unknown civilization."
    },

    {
        id: 3,
        title: "Midnight City",
        year: 2025,
        genre: "Drama",
        rating: 8.3,
        image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=600&q=80",
        description:
            "A young photographer discovers a hidden story behind the people living in a mysterious city."
    },

    {
        id: 4,
        title: "The Chase",
        year: 2026,
        genre: "Action",
        rating: 8.5,
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80",
        description:
            "A former detective finds himself caught in a dangerous chase across the city."
    },

    {
        id: 5,
        title: "Lost Planet",
        year: 2025,
        genre: "Sci-Fi",
        rating: 8.8,
        image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=600&q=80",
        description:
            "A crew lands on a distant planet where nothing is quite what it seems."
    },

    {
        id: 6,
        title: "Crazy Weekend",
        year: 2024,
        genre: "Comedy",
        rating: 7.9,
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
        description:
            "Four friends plan the perfect weekend but everything goes completely wrong."
    },

    {
        id: 7,
        title: "Broken Dreams",
        year: 2024,
        genre: "Drama",
        rating: 8.2,
        image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80",
        description:
            "A musician struggles to rebuild his life after losing everything."
    },

    {
        id: 8,
        title: "Shadow Warrior",
        year: 2026,
        genre: "Action",
        rating: 8.6,
        image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=600&q=80",
        description:
            "A mysterious warrior returns to his homeland to protect it from an ancient enemy."
    }

];

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
                            &nbsp; <i class="fa-regular fa-star"></i> ${movie.rating}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayMovies(list, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";
    list.forEach(movie => {
        container.innerHTML += createMovieCard(movie);
    });
}

displayMovies(
    movies.slice(0, 4),
    "trendingMovies"
);

displayMovies(
    movies.slice(4, 8),
    "popularMovies"
);
displayMovies(
    movies,
    "allMovies"
);

function filterMovies(category, button) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");

    });
    button.classList.add("active");
    if (category === "all") {
        displayMovies(
            movies,
            "allMovies"
        );
    } else {
        const filteredMovies = movies.filter(movie => {
            return movie.genre === category;
        });
        displayMovies(
            filteredMovies,
            "allMovies"
        );
    }
}
function showMovie(id) {
    const movie = movies.find(movie => movie.id === id);
    if (!movie) return;
    document.getElementById("modalTitle").textContent =
        movie.title;
    document.getElementById("modalMovieTitle").textContent =
        movie.title;
    document.getElementById("modalImage").src =
        movie.image;
    document.getElementById("modalYear").textContent =
        movie.year;
    document.getElementById("modalGenre").textContent =
        movie.genre;
    document.getElementById("modalRating").textContent =
        movie.rating;
    document.getElementById("modalDescription").textContent =
        movie.description;
    const modal = new bootstrap.Modal(
        document.getElementById("movieModal")
    );
    modal.show();
}
const searchButton =
    document.getElementById("searchButton");
const searchContainer =
    document.getElementById("searchContainer");
const closeSearch =
    document.getElementById("closeSearch");
const searchInput =
    document.getElementById("searchInput");
searchButton.addEventListener("click", () => {
    searchContainer.classList.add("show");
    searchInput.focus();
});
closeSearch.addEventListener("click", () => {
    searchContainer.classList.remove("show");
    searchInput.value = "";
    const searchResults =
        document.getElementById("searchResults");
    searchResults.innerHTML = "";
    searchResults.style.display = "none";
});
searchInput.addEventListener("input", () => {

    const searchValue =
        searchInput.value.toLowerCase().trim();

    const searchResults =
        document.getElementById("searchResults");
    if (searchValue === "") {
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
        return;
    }
    const filteredMovies = movies.filter(movie => {
        return (
            movie.title
                .toLowerCase()
                .includes(searchValue)

            ||
            movie.genre
                .toLowerCase()
                .includes(searchValue)
        );

    });

    if (filteredMovies.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                No movies found 😔
            </div>
        `;
        searchResults.style.display = "block";
        return;
    }
    searchResults.innerHTML = filteredMovies
        .map(movie => {
            return `
                <div
                    class="search-result-item"
                    onclick="showMovie(${movie.id})"
                >
                    <img
                        src="${movie.image}"
                        alt="${movie.title}"
                    >
                    <div class="search-result-info">
                        <h6>
                            ${movie.title}
                        </h6>
                        <p>
                            ${movie.year}
                            •
                            ${movie.genre}
                        </p>
                        <p class="search-result-rating">
                            ⭐ ${movie.rating}
                        </p>
                    </div>
                </div>
            `;
        })
        .join("");
    searchResults.style.display = "block";
});
window.addEventListener("scroll", () => {
    const navbar =
        document.querySelector(".navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});