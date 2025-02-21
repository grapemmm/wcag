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
        loadRecipes();
    } else {
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("recipeList").innerHTML = "<p>Please log in to see recipes.</p>";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addRecipeBtn").addEventListener("click", () => {
        document.getElementById("recipeModal").style.display = "flex";
    });

    document.querySelector(".close").addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === document.getElementById("recipeModal")) {
            closeModal();
        }
    });
});

function closeModal() {
    document.getElementById("recipeModal").style.display = "none";
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

    const recipeRef = id ? ref(db, `users/${user.uid}/recipes/${id}`) : push(ref(db, `users/${user.uid}/recipes`));
    
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

function loadRecipes() {
    const user = auth.currentUser;
    if (!user) return;

    get(ref(db, `users/${user.uid}/recipes`)).then((snapshot) => {
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
                    <button onclick="toggleFavorite('${recipe.id}')">${recipe.favorite ? "⭐ Remove" : "☆ Add to favorites"}</button>
                `;
                recipeList.appendChild(recipeDiv);
            });
        } else {
            recipeList.innerHTML = "<p>No recipes found.</p>";
        }
    });
}

function toggleFavorite(id) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add favorites!");
        return;
    }

    const recipeRef = ref(db, `users/${user.uid}/recipes/${id}`);
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

