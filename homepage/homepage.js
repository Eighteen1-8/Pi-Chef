const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '../settings/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

const WEATHER_API_KEY = settings.WEATHER_API_KEY;
const NEWS_API_KEY = settings.NEWS_API_KEY;
const WEATHER_LOCATION = settings.WEATHER_LOCATION;
const NEWS_LOCALE = settings.NEWS_LOCALE;

const CLOCK_FACE_COLOR = settings.CLOCK_FACE_COLOR;
const CLOCK_BORDER_COLOR = settings.CLOCK_BORDER_COLOR;
const CLOCK_CENTER_COLOR = settings.CLOCK_CENTER_COLOR;
const CLOCK_HAND_COLOR = settings.CLOCK_HAND_COLOR;

const canvas = document.getElementById('analogClock');
canvas.width = canvas.offsetWidth * 2;
canvas.height = canvas.offsetHeight * 2;
canvas.style.width = `${canvas.offsetWidth}px`;
canvas.style.height = `${canvas.offsetHeight}px`;

const ctx = canvas.getContext('2d');
ctx.scale(2, 2);
const radius = canvas.offsetHeight / 2;
ctx.translate(radius, radius);
const clockRadius = radius * 0.90;

function drawClock() {
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
    drawFace(ctx, clockRadius);
    drawNumbers(ctx, clockRadius);
    drawTime(ctx, clockRadius);
}

function drawFace(ctx, radius) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = CLOCK_FACE_COLOR;
    ctx.fill();
    ctx.strokeStyle = CLOCK_BORDER_COLOR;
    ctx.lineWidth = radius * 0.04; 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.06, 0, 2 * Math.PI);
    ctx.fillStyle = CLOCK_CENTER_COLOR;
    ctx.fill();
}

function drawNumbers(ctx, radius) {
    ctx.fillStyle = CLOCK_HAND_COLOR;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    
    for (let num = 1; num <= 12; num++) {
        const ang = (num * Math.PI / 6) - Math.PI / 2;
        const x = radius * 0.75 * Math.cos(ang);
        const y = radius * 0.75 * Math.sin(ang);
        
        if (num % 3 === 0) {
            ctx.font = `bold ${radius * 0.15}px 'Roboto', sans-serif`;
        } else {
            ctx.font = `${radius * 0.13}px 'Roboto', sans-serif`;
        }
        ctx.fillText(num.toString(), x, y);
    }
}

function drawTime(ctx, radius) {
    const now = new Date();
    const digitalTime = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    document.getElementById('digitalClock').innerText = digitalTime;
    
    let hour = now.getHours() % 12;
    let minute = now.getMinutes();
    let second = now.getSeconds();
    let millisecond = now.getMilliseconds();

    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    second = (second * Math.PI / 30) + (millisecond * Math.PI / (30 * 1000));

    drawHand(ctx, hour, radius * 0.5, radius * 0.07, CLOCK_HAND_COLOR);
    drawHand(ctx, minute, radius * 0.7, radius * 0.04, CLOCK_HAND_COLOR);
    drawHand(ctx, second, radius * 0.85, radius * 0.02, CLOCK_CENTER_COLOR);
}

function drawHand(ctx, pos, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}

function animate() {
    drawClock();
    requestAnimationFrame(animate);
}
animate();

async function fetchWeather() {
    const weatherContent = document.getElementById('weather-content');
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_LOCATION}&units=metric&appid=${WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            const temp = data.main.temp;
            const description = data.weather[0].description;
            const icon = data.weather[0].icon;
            const city = data.name;
            const country = data.sys.country;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
            weatherContent.innerHTML = `
                <img src="${iconUrl}" alt="${description}" style="width: 250px; height: 250px; margin-bottom: -45px; margin-top: -65px; filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.3));">
                <p style="font-size: 2em; margin: 0;"><strong>${temp}°C</strong></p>
                <p style="margin-top: 5px;">${description.charAt(0).toUpperCase() + description.slice(1)}</p>
                <p style="margin-top: 5px; font-size: 0.9em;">${city}, ${country}</p>
            `;
        } else {
            weatherContent.innerHTML = `<p>Unable to load weather data.</p>`;
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherContent.innerHTML = `<p>Error fetching weather data.</p>`;
    }
}
fetchWeather();

async function fetchNews() {
    const newsContent = document.getElementById('news-content');
    try {
        const url = `https://api.thenewsapi.com/v1/news/top?api_token=${NEWS_API_KEY}&locale=${NEWS_LOCALE}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            const topArticle = data.data[0];
            newsContent.innerHTML = `
                <div class="top-news">
                    <img src="${topArticle.image_url}" alt="${topArticle.title}">
                    <h3><a href="${topArticle.url}" target="_blank">${topArticle.title}</a></h3>
                </div>
            `;
        } else {
            newsContent.innerHTML = `<p>API Usage Limit Reached.</p>`;
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContent.innerHTML = `<p>Error fetching news data.</p>`;
    }
}
fetchNews();

async function searchRecipes() {
    const query = document.getElementById('recipe-search-input').value.trim();
    if (!query) return;
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    try {
        // First, search by name using search.php
        let response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        let data = await response.json();
        let meals = data.meals;
        // If no results, try filtering by ingredient using filter.php
        if (!meals) {
            response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`);
            data = await response.json();
            meals = data.meals;
        }
        if (meals) {
            let resultsHTML = '';
            meals.forEach(meal => {
                resultsHTML += `
                    <div class="recipe-item">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                    </div>
                `;
            });
            resultsContainer.innerHTML = resultsHTML;
        } else {
            resultsContainer.innerHTML = '<p>No recipes found.</p>';
        }
    } catch (error) {
        console.error('Error searching recipes:', error);
        resultsContainer.innerHTML = '<p>Error fetching recipes.</p>';
    }
}

window.addEventListener('scroll', function() {
    const scrollArrow = document.getElementById('scroll-down');
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        scrollArrow.style.opacity = '0';
    } else {
        scrollArrow.style.opacity = '1';
    }
});

async function fetchRecommendedRecipes() {
    const recipesContainer = document.getElementById('recommendedRecipes');
    recipesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data = await response.json();
            const meal = data.meals[0];
            recipesContainer.innerHTML += `
                <a href="../recipe/recipe.html?id=${meal.idMeal}" class="recipe-link" style="text-decoration: none; color: inherit;">
                    <div class="recipe-item">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                    </div>
                </a>
            `;
        } catch (error) {
            console.error('Error fetching recipe:', error);
        }
    }
}
fetchRecommendedRecipes();
