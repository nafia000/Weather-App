

        // API KEY

        const API_KEY = "9dcbd236228498977f055e986e666755";


        // DOM ELEMENTS

        const cityInput = document.getElementById("cityInput");

        const searchBtn = document.getElementById("searchBtn");

        const weatherCard = document.getElementById("weatherCard");

        const errorMsg = document.getElementById("errorMsg");

        const spinner = document.getElementById("spinner");

        const forecast = document.getElementById("forecast");

        const forecastTitle = document.getElementById("forecastTitle");

        const favoritesList = document.getElementById("favoritesList");

        const themeBtn = document.getElementById("themeBtn");


        // 1. GET WEATHER USING FETCH API AND ASYNC/AWAIT

        async function getWeather(city) {

            const url =
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

            const response = await fetch(url);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to get weather");
            }

            return data;
        }


        // GET 5 DAY FORECAST

        async function getForecast(city) {

            const url =
                `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

            const response = await fetch(url);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to get forecast");
            }

            return data;
        }


        // DISPLAY WEATHER

        function displayWeather(data) {

            const city = data.name;

            const temperature = data.main.temp;

            const description = data.weather[0].description;

            const icon = data.weather[0].icon;

            const humidity = data.main.humidity;

            const wind = data.wind.speed;

            const feels = data.main.feels_like;

            weatherCard.innerHTML = `

                <h2>${city}, ${data.sys.country}</h2>

                <img
                    class="weather-icon"
                    src="https://openweathermap.org/img/wn/${icon}@2x.png"
                    alt="${description}"
                >

                <div class="temp">${temperature.toFixed(1)}°C</div>

                <div class="desc">${description}</div>

                <div class="stats">

                    <div class="stat">
                        <p>💧 Humidity</p>
                        <h3>${humidity}%</h3>
                    </div>

                    <div class="stat">
                        <p>🌬 Wind Speed</p>
                        <h3>${wind} m/s</h3>
                    </div>

                    <div class="stat">
                        <p>🌡 Feels Like</p>
                        <h3>${feels.toFixed(1)}°C</h3>
                    </div>

                </div>

                <button id="favoriteBtn">
                    ⭐ Add to Favorites
                </button>

            `;

            weatherCard.style.display = "block";

            document.getElementById("favoriteBtn")
                .addEventListener("click", () => addFavorite(city));

        }


        // DISPLAY FORECAST

        function displayForecast(data) {

            forecast.innerHTML = "";

            // Select one forecast per day (around noon)

            const dailyData = data.list.filter(item =>
                item.dt_txt.includes("12:00:00")
            ).slice(0, 5);

            dailyData.forEach(item => {

                const date = new Date(item.dt_txt);

                const day = date.toLocaleDateString("en-US", {
                    weekday: "short"
                });

                const icon = item.weather[0].icon;

                const temp = item.main.temp;

                const desc = item.weather[0].description;

                const dayCard = document.createElement("div");

                dayCard.className = "day";

                const dayName = document.createElement("h4");
                dayName.textContent = day;

                const image = document.createElement("img");
                image.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                image.alt = desc;

                const temperature = document.createElement("h3");
                temperature.textContent = `${temp.toFixed(1)}°C`;

                const description = document.createElement("small");
                description.textContent = desc;

                dayCard.append(
                    dayName,
                    image,
                    temperature,
                    description
                );

                forecast.appendChild(dayCard);

            });

            forecastTitle.style.display = "block";

        }


        // 2. ADD FAVORITE CITY

        function addFavorite(city) {

            let favorites = JSON.parse(
                localStorage.getItem("favorites")
            ) || [];

            if (favorites.some(item =>
                item.toLowerCase() === city.toLowerCase()
            )) {

                alert("City already added to favorites!");

                return;
            }

            favorites.push(city);

            localStorage.setItem(
                "favorites",
                JSON.stringify(favorites)
            );

            loadFavorites();

            alert("City added to favorites!");

        }


        // REMOVE FAVORITE

        function removeFavorite(city) {

            let favorites = JSON.parse(
                localStorage.getItem("favorites")
            ) || [];

            favorites = favorites.filter(item =>
                item.toLowerCase() !== city.toLowerCase()
            );

            localStorage.setItem(
                "favorites",
                JSON.stringify(favorites)
            );

            loadFavorites();

        }


        // 3. LOAD FAVORITES

        function loadFavorites() {

            let favorites = JSON.parse(
                localStorage.getItem("favorites")
            ) || [];

            favoritesList.innerHTML = "";

            favorites.forEach(city => {

                const chip = document.createElement("div");

                chip.className = "chip";

                const cityButton = document.createElement("button");

                cityButton.textContent = city;

                cityButton.addEventListener("click", () => {
                    searchWeather(city);
                });

                const removeButton = document.createElement("button");

                removeButton.textContent = "✕";

                removeButton.className = "rm";

                removeButton.addEventListener("click", () => {
                    removeFavorite(city);
                });

                chip.append(cityButton, removeButton);

                favoritesList.appendChild(chip);

            });

        }


        // 4. SEARCH WEATHER

        async function searchWeather(city) {

            city = city.trim();

            if (!city) {

                showError("Please enter a city name.");

                return;
            }

            if (API_KEY === "YOUR_API_KEY_HERE") {

                showError("Please add your OpenWeatherMap API key first.");

                return;
            }

            spinner.style.display = "block";

            errorMsg.style.display = "none";

            weatherCard.style.display = "none";

            forecast.innerHTML = "";

            forecastTitle.style.display = "none";

            searchBtn.disabled = true;

            try {

                const weatherData = await getWeather(city);

                displayWeather(weatherData);

                const forecastData = await getForecast(city);

                displayForecast(forecastData);

            }

            catch (error) {

                showError(error.message);

            }

            finally {

                spinner.style.display = "none";

                searchBtn.disabled = false;

            }

        }


        // ERROR MESSAGE

        function showError(message) {

            errorMsg.textContent = message;

            errorMsg.style.display = "block";

        }


        // 5. DEBOUNCE SEARCH - 500ms

        let timer;

        function debounceSearch() {

            clearTimeout(timer);

            const city = cityInput.value.trim();

            if (!city) {
                return;
            }

            timer = setTimeout(() => {

                searchWeather(city);

            }, 500);

        }


        // 6. DARK / LIGHT THEME

        themeBtn.addEventListener("click", function() {

            const isDark =
                document.documentElement.getAttribute("data-theme") === "dark";

            if (isDark) {

                document.documentElement.removeAttribute("data-theme");

                themeBtn.textContent = "🌙 Dark";

                localStorage.setItem("theme", "light");

            }

            else {

                document.documentElement.setAttribute("data-theme", "dark");

                themeBtn.textContent = "☀ Light";

                localStorage.setItem("theme", "dark");

            }

        });


        // LOAD SAVED THEME

        function loadTheme() {

            const savedTheme = localStorage.getItem("theme");

            if (savedTheme === "dark") {

                document.documentElement.setAttribute("data-theme", "dark");

                themeBtn.textContent = "☀ Light";

            }

        }


        // 7. EVENT LISTENERS

        document.addEventListener("DOMContentLoaded", function() {

            loadFavorites();

            loadTheme();

        });


        // Search button click

        searchBtn.addEventListener("click", function() {

            clearTimeout(timer);

            searchWeather(cityInput.value);

        });


        // Enter key

        cityInput.addEventListener("keydown", function(event) {

            if (event.key === "Enter") {

                clearTimeout(timer);

                searchWeather(cityInput.value);

            }

        });


        // Automatic debounce search

        cityInput.addEventListener("input", debounceSearch);


    