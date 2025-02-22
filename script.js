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

// Сохранение рецепта
document.getElementById("saveRecipe").addEventListener("click", () => {
    const title = document.getElementById("recipeTitle").value;
    const ingredients = document.getElementById("recipeIngredients").value;
    const instructions = document.getElementById("recipeInstructions").value;

    const recipeRef = push(ref(db, "recipes"));
    set(recipeRef, { title, ingredients, instructions }).then(loadRecipes);
});

// Загрузка рецептов
function loadRecipes() {
    get(ref(db, "recipes")).then((snapshot) => {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const recipe = childSnapshot.val();
            const div = document.createElement("div");
            div.classList.add("recipe-card");
            div.innerHTML = `
                <h3>${recipe.title}</h3>
                <p>${recipe.ingredients}</p>
                <p>${recipe.instructions}</p>
            `;
            recipeList.appendChild(div);
        });
    });
}
loadRecipes();