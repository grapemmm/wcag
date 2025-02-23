import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// ✅ Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyBFSftvspdDdcO8FM5U95BoCvstf0bDk4Y",
    authDomain: "wcag-a4bb1.firebaseapp.com",
    databaseURL: "https://wcag-a4bb1-default-rtdb.firebaseio.com",
    projectId: "wcag-a4bb1",
    storageBucket: "wcag-a4bb1.firebasestorage.app",
    messagingSenderId: "657788035140",
    appId: "1:657788035140:web:06da8a50860747c05f5c11",
    measurementId: "G-9RNRJ8C837",
};

// ✅ Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Проверка аутентификации при загрузке страницы
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        console.log("🔹 Пользователь вошёл:", user.displayName);

        // ✅ Показываем кнопку "Sign Out", скрываем "Sign in"
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "block";

        // ✅ Перенаправляем на dashboard, если ещё на странице входа
        if (window.location.pathname.includes("index.html")) {
            window.location.href = "dashboard.html";
        }
    } else {
        console.log("🔹 Пользователь НЕ авторизован");

        // ✅ Показываем "Sign in", скрываем "Sign Out"
        if (loginBtn) loginBtn.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "none";

        // ✅ Перенаправляем на `index.html`, если пользователь НЕ авторизован
        if (!window.location.pathname.includes("index.html")) {
            window.location.href = "index.html";
        }
    }
});

// ✅ Обработчик входа через Google
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("🔹 Вход выполнен:", result.user);
                    window.location.href = "dashboard.html"; // ✅ Перенаправляем после входа
                })
                .catch((error) => {
                    console.error("❌ Ошибка входа:", error.message);
                    alert("Login failed: " + error.message);
                });
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                console.log("🔹 Пользователь вышел");
                window.location.href = "index.html"; // ✅ Перенаправляем после выхода
            }).catch((error) => {
                console.error("❌ Ошибка выхода:", error.message);
                alert("Logout failed: " + error.message);
            });
        });
    }
});

