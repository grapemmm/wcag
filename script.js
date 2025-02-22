export {}; // Делаем файл модулем, чтобы избежать ошибок

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
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

// Проверка аутентификации пользователя
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("mainPage").style.display = "block";
        loadRecipes();
    } else {
        document.getElementById("loginPage").style.display = "block";
        document.getElementById("mainPage").style.display = "none";
    }
});

// Авторизация через Google
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").addEventListener("click", () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("User signed in:", result.user);
                alert(`Welcome, ${result.user.displayName}!`);
            })
            .catch((error) => {
                console.error("Login error:", error.message);
                alert("Login failed: " + error.message);
            });
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Logged out!");
        }).catch((error) => {
            console.error("Logout error:", error.message);
            alert("Logout failed: " + error.message);
        });
    });
});

// Подключаем обработчики кнопок после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("showFavoritesBtn").addEventListener("click", showFavorites);
    document.getElementById("askAIBtn").addEventListener("click", askAI);
});

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
