import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Update authentication buttons
function updateAuthButtons(user) {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        console.log("🔹 User signed in:", user.displayName);

        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "block";

        if (window.location.pathname.includes("index.html")) {
            window.location.href = "dashboard.html"; // Redirect to dashboard
        }
    } else {
        console.log("🔹 User is NOT signed in");

        if (loginBtn) loginBtn.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "none";

        if (!window.location.pathname.includes("index.html")) {
            window.location.href = "index.html"; // Redirect to login page
        }
    }
}

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    updateAuthButtons(user);
});

// Handle login with Google
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("🔹 Login successful:", result.user);
                    updateAuthButtons(result.user);
                    window.location.href = "dashboard.html"; // Redirect to dashboard
                })
                .catch((error) => {
                    console.error("Login error:", error.message);
                    alert("Login failed: " + error.message);
                });
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth)
                .then(() => {
                    console.log("🔹 User signed out");
                    updateAuthButtons(null);
                    window.location.href = "index.html"; // Redirect to login page
                })
                .catch((error) => {
                    console.error("Logout error:", error.message);
                    alert("Logout failed: " + error.message);
                });
        });
    }
});

