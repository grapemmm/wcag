import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getDatabase, ref, set, get, push, update, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBFSftvspdDdcO8FM5U95BoCvstf0bDk4Y",
    authDomain: "wcag-a4bb1.firebaseapp.com",
    databaseURL: "https://wcag-a4bb1-default-rtdb.firebaseio.com",
    projectId: "wcag-a4bb1",
    storageBucket: "wcag-a4bb1.appspot.com",
    messagingSenderId: "657788035140",
    appId: "1:657788035140:web:06da8a50860747c05f5c11",
    measurementId: "G-9RNRJ8C837"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Авторизация через Google
document.getElementById("loginBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            alert(`Welcome, ${result.user.displayName}!`);
        })
        .catch((error) => {
            console.error("Login error:", error);
        });
});

// Выход из аккаунта
document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logged out!");
    });
});

// Проверка аутентификации пользователя
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("logoutBtn").style.display = "block";
    } else {
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("logoutBtn").style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const addRecipeBtn = document.getElementById("addRecipeBtn");
    const recipeModal = document.getElementById("recipeModal");
    const closeModal = document.querySelector(".close");

    addRecipeBtn.addEventListener("click", () => {
        recipeModal.style.display = "flex";
        recipeModal.setAttribute("aria-hidden", "false");
    });

    closeModal.addEventListener("click", () => {
        recipeModal.style.display = "none";
        recipeModal.setAttribute("aria-hidden", "true");
    });

    window.addEventListener("click", (e) => {
        if (e.target === recipeModal) {
            recipeModal.style.display = "none";
            recipeModal.setAttribute("aria-hidden", "true");
        }
    });

    loadRecipes();
});

document.getElementById("saveRecipe").addEventListener("click", () => {
    const title = document.getElementById("recipeTitle").value;
    const ingredients = document.getElementById("recipeIngredients").value;
    const instructions = document.getElementById("recipeInstructions").value;

    if (title && ingredients && instructions) {
        const newRecipeRef = push(ref(db, "recipes"));
        set(newRecipeRef, {
            id: newRecipeRef.key,
            title,
            ingredients,
            instructions
        }).then(() => {
            alert("Recipe added successfully!");
            closeModal();
            loadRecipes();
        });
    } else {
        alert("Please fill out all fields.");
    }
});

function loadRecipes() {
    get(ref(db, "recipes")).then((snapshot) => {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "";

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const recipe = childSnapshot.val();
                const recipeDiv = document.createElement("div");
                recipeDiv.classList.add("recipe-item");
                recipeDiv.innerHTML = `
                    <h3>${recipe.title}</h3>
                    <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                    <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                    <button onclick="editRecipe('${recipe.id}')">Edit</button>
                    <button onclick="deleteRecipe('${recipe.id}')">Delete</button>
                `;
                recipeList.appendChild(recipeDiv);
            });
        } else {
            recipeList.innerHTML = "<p>No recipes found.</p>";
        }
    });
}

function editRecipe(id) {
    get(ref(db, "recipes/" + id)).then((snapshot) => {
        if (snapshot.exists()) {
            const recipe = snapshot.val();
            document.getElementById("recipeTitle").value = recipe.title;
            document.getElementById("recipeIngredients").value = recipe.ingredients;
            document.getElementById("recipeInstructions").value = recipe.instructions;

            document.getElementById("saveRecipe").onclick = function () {
                update(ref(db, "recipes/" + id), {
                    title: document.getElementById("recipeTitle").value,
                    ingredients: document.getElementById("recipeIngredients").value,
                    instructions: document.getElementById("recipeInstructions").value
                }).then(() => {
                    alert("Recipe updated successfully!");
                    closeModal();
                    loadRecipes();
                });
            };

            document.getElementById("recipeModal").style.display = "flex";
        }
    });
}

function deleteRecipe(id) {
    if (confirm("Are you sure you want to delete this recipe?")) {
        remove(ref(db, "recipes/" + id)).then(() => {
            alert("Recipe deleted successfully!");
            loadRecipes();
        });
    }
}

function searchRecipes() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const recipeItems = document.querySelectorAll(".recipe-item");

    recipeItems.forEach(recipe => {
        const title = recipe.querySelector("h3").innerText.toLowerCase();
        const ingredients = recipe.querySelector("p").innerText.toLowerCase();

        if (title.includes(searchValue) || ingredients.includes(searchValue)) {
            recipe.style.display = "block";
        } else {
            recipe.style.display = "none";
        }
    });
}

function filterRecipes() {
    const selectedCategory = document.getElementById("filterCategory").value;
    const recipeItems = document.querySelectorAll(".recipe-item");

    recipeItems.forEach(recipe => {
        const category = recipe.getAttribute("data-category");

        if (selectedCategory === "all" || category === selectedCategory) {
            recipe.style.display = "block";
        } else {
            recipe.style.display = "none";
        }
    });
}

function toggleFavorite(id) {
    const recipeRef = ref(db, "recipes/" + id);
    get(recipeRef).then((snapshot) => {
        if (snapshot.exists()) {
            const recipe = snapshot.val();
            const updatedFavoriteStatus = !recipe.favorite;

            update(recipeRef, { favorite: updatedFavoriteStatus }).then(() => {
                alert(updatedFavoriteStatus ? "Added to favorites!" : "Removed from favorites!");
                loadRecipes();
            });
        }
    });
}

function showFavorites() {
    get(ref(db, "recipes")).then((snapshot) => {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "";

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const recipe = childSnapshot.val();
                if (recipe.favorite) {
                    const recipeDiv = document.createElement("div");
                    recipeDiv.classList.add("recipe-item");
                    recipeDiv.innerHTML = `
                        <h3>${recipe.title}</h3>
                        <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                        <button onclick="editRecipe('${recipe.id}')">Edit</button>
                        <button onclick="deleteRecipe('${recipe.id}')">Delete</button>
                        <button onclick="toggleFavorite('${recipe.id}')">${recipe.favorite ? "⭐ Remove" : "☆ Add to favorites"}</button>
                    `;
                    recipeList.appendChild(recipeDiv);
                }
            });
        }
    });
}

function saveRecipe(id = null) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add recipes!");
        return;
    }

    const title = document.getElementById("recipeTitle").value;
    const ingredients = document.getElementById("recipeIngredients").value;
    const instructions = document.getElementById("recipeInstructions").value;

    if (!title || !ingredients || !instructions) {
        alert("Please fill out all fields.");
        return;
    }

    const recipeRef = id ? ref(db, "users/" + user.uid + "/recipes/" + id) : push(ref(db, "users/" + user.uid + "/recipes"));
    
    set(recipeRef, {
        id: id || recipeRef.key,
        title,
        ingredients,
        instructions,
        owner: user.uid
    }).then(() => {
        alert(id ? "Recipe updated successfully!" : "Recipe added successfully!");
        closeModal();
        loadRecipes();
    });
}

async function askAI() {
    const inputText = document.getElementById("chatInput").value;
    if (!inputText) {
        alert("Please enter a question!");
        return;
    }

    const apiKey = "YOUR_OPENAI_API_KEY";
    const url = "https://api.openai.com/v1/completions";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: `Suggest a recipe using these ingredients: ${inputText}`,
            max_tokens: 100
        })
    });

    const data = await response.json();
    document.getElementById("chatResponse").innerText = data.choices[0].text;
}
