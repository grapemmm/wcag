import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBFSftvspdDdcO8FM5U95BoCvstf0bDk4Y",
    authDomain: "wcag-a4bb1.firebaseapp.com",
    projectId: "wcag-a4bb1",
    storageBucket: "wcag-a4bb1.firebasestorage.app",
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

    // Открытие модального окна
    addRecipeBtn.addEventListener("click", () => {
        recipeModal.style.display = "flex";
        recipeModal.setAttribute("aria-hidden", "false");
    });

    // Закрытие модального окна
    closeModal.addEventListener("click", () => {
        recipeModal.style.display = "none";
        recipeModal.setAttribute("aria-hidden", "true");
    });

    // Закрытие при клике вне модального окна
    window.addEventListener("click", (e) => {
        if (e.target === recipeModal) {
            recipeModal.style.display = "none";
            recipeModal.setAttribute("aria-hidden", "true");
        }
    });
});
