const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const RANDOM_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const CATEGORY_URL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";

//search
// Function to search for recipes
async function searchRecipes() {
    const query = document.getElementById("search").value.trim();
    if (!query) {
        alert("Please enter a recipe name to search.");
        return;
    }

    const container = document.getElementById("random-recipes");
    container.innerHTML = "<p>Searching for recipes...</p>";

    try {
        const response = await fetch(API_URL + query);
        const data = await response.json();
        
        if (data.meals) {
            displayRecipes(data.meals, container);
        } else {
            container.innerHTML = "<p>No recipes found. Try another search!</p>";
        }
    } catch (error) {
        container.innerHTML = "<p>Error fetching recipes. Please try again later.</p>";
        console.error("Search error:", error);
    }
}

// Toggle mobile menu
function toggleMenu() {
    document.querySelector(".nav-links").classList.toggle("nav-active");
}

// Function to load random recipes for "Recipes of the Day"
async function loadRandomRecipes() {
    const container = document.getElementById("random-recipes");
    container.innerHTML = "<p>Loading recipes...</p>";

    let recipes = [];
    for (let i = 0; i < 6; i++) {
        const response = await fetch(RANDOM_URL);
        const data = await response.json();
        if (data.meals) recipes.push(...data.meals);
    }

    displayRecipes(recipes, container);
}

// Function to filter Veg / Non-Veg recipes
async function loadVegNonVeg(type) {
    const container = document.getElementById("veg-nonveg-recipes");
    container.innerHTML = "<p>Loading recipes...</p>";
  
    let filteredRecipes = [];
    let allMeals = [];
  
    for (let i = 0; i < 5; i++) {
     const response = await fetch(RANDOM_URL);
     const data = await response.json();
     if (data.meals) allMeals.push(...data.meals);
    }
  
    if (type === "Veg") {
     filteredRecipes = allMeals.filter(meal => !["Beef", "Chicken", "Pork", "Lamb"].includes(meal.strCategory));
    } else {
     filteredRecipes = allMeals.filter(meal => ["Beef", "Chicken", "Pork", "Lamb"].includes(meal.strCategory));
    }
  
    displayRecipes(filteredRecipes, container);
   }

// Function to display recipes in a given container
function displayRecipes(recipes, container) {
    container.innerHTML = "";

    if (!recipes || recipes.length === 0) {
        container.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <h3>${recipe.strMeal}</h3>
            <button onclick="viewRecipe('${recipe.idMeal}')">View Recipe</button>
            <button onclick="addToFavorites('${recipe.idMeal}', '${recipe.strMeal}', '${recipe.strMealThumb}')">Add to Favorites</button>
        `;

        container.appendChild(recipeCard);
    });
}

// Function to view recipe details
async function viewRecipe(id) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();
    if (data.meals) {
        const meal = data.meals[0];
        showRecipeModal(meal); // Use showRecipeModal instead of alert
    }
}

// Function to add recipes to favorites
function addToFavorites(id, name, image) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.some(recipe => recipe.id === id)) {
        favorites.push({ id, name, image });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Added to Favorites!");
    } else {
        alert("Already in Favorites!");
    }
}

// Function to load favorites
function loadFavorites() {
    const container = document.getElementById("favorites-container");
    if(!container) return; //if favorites container is not found, exit the function.
    container.innerHTML = "";

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.length === 0) {
        container.innerHTML = "<p>No favorite recipes yet.</p>";
        return;
    }

    favorites.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <h3>${recipe.name}</h3>
            <button onclick="removeFromFavorites('${recipe.id}')">Remove</button>
        `;

        container.appendChild(recipeCard);
    });
}

// Function to remove from favorites
function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}

// Function to show recipe details in a modal
function showRecipeModal(meal) {
    const modal = document.getElementById("recipe-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalImage = document.getElementById("modal-image");
    const modalCategory = document.getElementById("modal-category");
    const modalInstructions = document.getElementById("modal-instructions");
    const closeBtn = document.querySelector(".close-btn");

    modalTitle.textContent = meal.strMeal;
    modalImage.src = meal.strMealThumb;
    modalCategory.textContent = meal.strCategory;

    // Format instructions with numbered list
    const instructionsArray = meal.strInstructions.split('\r\n');
    let formattedInstructions = '';
    instructionsArray.forEach((instruction, index) => {
        if (instruction.trim() !== '') {
            formattedInstructions += `${index + 1}. ${instruction}<br>`;
        }
    });
    modalInstructions.innerHTML = formattedInstructions;

    modal.style.display = "block";
    modal.classList.add("modal-open"); // Add a class for the fade-in effect

    closeBtn.onclick = function() {
        modal.style.display = "none";
        modal.classList.remove("modal-open");
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            modal.classList.remove("modal-open");
        }
    };
}

// Load recipes on page load
window.onload = function() {
    loadRandomRecipes();
    if (document.getElementById("favorites-container")) {
        loadFavorites();
    }
};

document.getElementById("search").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchRecipes();
    }
});
