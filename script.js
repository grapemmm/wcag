import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { doc, getDoc, getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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
const database = getDatabase(app);  // Realtime Database
const firestore = getFirestore(app); // Firestore
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Функция получения API-ключа из Firestore
async function fetchAPIKey() {
    const chatgptConfig = await getDoc(doc(firestore, "Config", "wcag"));
    if (!chatgptConfig.exists()) {
        console.error("Error: ChatGPT API Key not found in Firestore.");
        return null;
    }
    return chatgptConfig.data().key;
}

let chatgpt_api_key;
fetchAPIKey().then((key) => {
    chatgpt_api_key = key;
});

// ✅ Авторизация через Google
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

// ✅ Проверка аутентификации пользователя
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop();
    
    if (user && currentPage === "index.html") {
        window.location.href = "dashboard.html"; // Главная страница после входа
    }
    
    if (!user && currentPage !== "index.html") {
        window.location.href = "index.html";
    }
});

// ✅ Выход из аккаунта
document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Logout error:", error.message);
        alert("Logout failed: " + error.message);
    });
});

// ✅ Сохранение рецепта в Realtime Database
document.getElementById("saveRecipe").addEventListener("click", () => {
    const title = document.getElementById("recipeTitle").value;
    const ingredients = document.getElementById("recipeIngredients").value;
    const instructions = document.getElementById("recipeInstructions").value;

    if (!title || !ingredients || !instructions) {
        alert("Please fill out all fields.");
        return;
    }

    const recipeRef = push(ref(database, "recipes"));
    set(recipeRef, { title, ingredients, instructions }).then(loadRecipes);
});

// ✅ Загрузка рецептов из Realtime Database
function loadRecipes() {
    get(ref(database, "recipes")).then((snapshot) => {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const recipe = childSnapshot.val();
            const div = document.createElement("div");
            div.classList.add("recipe-card");
            div.innerHTML = `
                <h3>${recipe.title}</h3>
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
            `;
            recipeList.appendChild(div);
        });
    });
}
loadRecipes();

// ✅ Подключение OpenAI API для генерации рецептов
document.getElementById("askAIBtn").addEventListener("click", async () => {
    if (!chatgpt_api_key) {
        chatgpt_api_key = await fetchAPIKey();
    }

    if (!chatgpt_api_key) {
        alert("OpenAI API Key is missing. Make sure to set it in your Firestore.");
        return;
    }

    const inputText = document.getElementById("chatInput").value;
    if (!inputText) {
        alert("Please enter a question!");
        return;
    }

    const url = "https://api.openai.com/v1/completions";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${chatgpt_api_key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Generate a recipe for: ${inputText}` }],
                max_tokens: 150
            })
        });

        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message.content) {
            alert("AI response error. Try again.");
            return;
        }

        const aiResponse = JSON.parse(data.choices[0].message.content);

        if (aiResponse.response === "recipe") {
            document.getElementById("recipeTitle").value = aiResponse.name;
            document.getElementById("recipeIngredients").value = aiResponse.ingredients.join("\n");
            document.getElementById("recipeInstructions").value = aiResponse.instructions.join("\n");
        } else {
            alert("AI did not return a valid recipe. Try again.");
        }
    } catch (error) {
        console.error("Error with AI request:", error);
        alert("Failed to get response from AI.");
    }
});

