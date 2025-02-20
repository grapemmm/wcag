import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getDatabase, ref, set, get, push, update, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

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
