function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function loadRecipe() {
    const mealId = getQueryParam('id');
    const recipeDiv = document.getElementById('recipe-details');
    
    if (!mealId) {
        recipeDiv.innerHTML = "<p>No recipe specified.</p>";
        return;
    }
    
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        
        if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            const pageHeader = document.querySelector('h1');
            if (pageHeader) {
                pageHeader.textContent = meal.strMeal;
            }
            let ingredientsHTML = "<ul>";
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                    ingredientsHTML += `<li>${ingredient} - <strong>${measure}</strong></li>`;
                }
            }
            ingredientsHTML += "</ul>";
            const instructionsHTML = `
                <ul>
                    ${meal.strInstructions
                        .split(/\r?\n/)
                        .filter(line => line.trim() !== "")
                        .map(step => `<li style="margin-bottom: 10px;">${step}</li>`)
                        .join("")}
                </ul>
            `;
            
            recipeDiv.innerHTML = `
                <div class="recipe-layout">
                    <div class="recipe-image">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    </div>
                    <div class="recipe-ingredients">
                        <h3>Ingredients</h3>
                        ${ingredientsHTML}
                    </div>
                </div>
                <div class="recipe-instructions">
                    <h3>Instructions</h3>
                    ${instructionsHTML}
                </div>
            `;
        } else {
            recipeDiv.innerHTML = "<p>Recipe not found.</p>";
        }
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        recipeDiv.innerHTML = "<p>Error loading recipe details.</p>";
    }
}

loadRecipe();
let timerInterval;
let countdownSeconds = 300;
let alarmAudio = null;
const timerDisplay = document.querySelector('.timer-display');
const toggleButton = document.getElementById('toggle-timer');
const resetButton = document.getElementById('reset-timer');

function updateTimerDisplay() {
    const minutes = String(Math.floor(countdownSeconds / 60)).padStart(2, '0');
    const seconds = String(countdownSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

updateTimerDisplay();

toggleButton.addEventListener('click', () => {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio = null;
        toggleButton.innerHTML = '<i class="fas fa-play"></i>';
        return;
    }

    if (!timerInterval && countdownSeconds > 0) {
        timerInterval = setInterval(() => {
            if (countdownSeconds > 0) {
                countdownSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                const songs = ["audio/1.mp3", "audio/2.mp3", "audio/3.mp3", "audio/4.mp3"];
                const randomSong = songs[Math.floor(Math.random() * songs.length)];
                alarmAudio = new Audio(randomSong);
                alarmAudio.loop = true;
                alarmAudio.play();
                toggleButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        }, 1000);
        toggleButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        clearInterval(timerInterval);
        timerInterval = null;
        toggleButton.innerHTML = '<i class="fas fa-play"></i>';
    }
});

resetButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    countdownSeconds = 300;
    updateTimerDisplay();
    toggleButton.innerHTML = '<i class="fas fa-play"></i>';
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio = null;
    }
});

document.getElementById('plus-time').addEventListener('click', () => {
    countdownSeconds += 300;
    updateTimerDisplay();
});

document.getElementById('minus-time').addEventListener('click', () => {
    countdownSeconds = Math.max(0, countdownSeconds - 300);
    updateTimerDisplay();
});

document.getElementById('convert-btn').addEventListener('click', function() {
  const value = parseFloat(document.getElementById('convert-input').value);
  const convertFrom = document.getElementById('convert-from').value;
  const convertTo = document.getElementById('convert-to').value;
  
  if (isNaN(value)) {
    document.getElementById('convert-result').textContent = "Please enter a valid number";
    return;
  }
  
  const massUnits = {
    grams: 1,
    ounces: 28.3495
  };
  
  const volumeUnits = {
    ml: 1,
    l: 1000,
    cups: 240,
    teaspoons: 4.92892
  };
  
  let result = 0;
  
  if (massUnits[convertFrom] !== undefined && massUnits[convertTo] !== undefined) {
    result = value * massUnits[convertFrom] / massUnits[convertTo];
  }
  else if (volumeUnits[convertFrom] !== undefined && volumeUnits[convertTo] !== undefined) {
    result = value * volumeUnits[convertFrom] / volumeUnits[convertTo];
  }
  else {
    document.getElementById('convert-result').textContent = "Incompatible unit types";
    return;
  }
  
  document.getElementById('convert-result').textContent = `${value} ${convertFrom} = ${result.toFixed(2)} ${convertTo}`;
});
