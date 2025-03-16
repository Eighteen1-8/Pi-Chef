document.getElementById("searchForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const query = document.getElementById("searchInput").value.trim();
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    let url = "";
    if (searchType === "name") {
      url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
    } else if (searchType === "ingredient") {
      url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;
    }
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = "<p>Loading...</p>";
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.meals) {
        let html = "<div class='results-container'>";
        data.meals.forEach(meal => {
          html += `
            <a class="result-item" href="../recipe/recipe.html?id=${meal.idMeal}">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
              <h3>${meal.strMeal}</h3>
            </a>
          `;
        });
        html += "</div>";
        searchResultsDiv.innerHTML = html;
      } else {
        searchResultsDiv.innerHTML = "<p>No recipes found.</p>";
      }
    } catch(error) {
      console.error("Error fetching search results:", error);
      searchResultsDiv.innerHTML = "<p>Error fetching search results.</p>";
    }
});

const alarmFiles = [
  "../alarms/alarm1.mp3",
  "../alarms/alarm2.mp3",
  "../alarms/alarm3.mp3"
];

let alarmAudio = null;

function startAlarm() {
  const randomIndex = Math.floor(Math.random() * alarmFiles.length);
  const selectedAlarm = alarmFiles[randomIndex];
  alarmAudio = new Audio(selectedAlarm);
  alarmAudio.loop = true;
  alarmAudio.play().catch(error => {
    console.error("Error playing alarm audio:", error);
  });
}

function stopAlarm() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    alarmAudio = null;
  }
}

function onTimerEnd() {
  startAlarm();
}

document.getElementById("stopAlarm").addEventListener("click", stopAlarm);
