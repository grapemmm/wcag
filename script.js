import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, set, get, push, update, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
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

// ✅ Функция удаления рецепта (исправленная)
function deleteRecipe(recipeId) {
    if (!recipeId) {
        console.error("Error: recipeId is undefined");
        return;
    }

    if (confirm("Are you sure you want to delete this recipe?")) {
        const recipeRef = ref(database, `recipes/${recipeId}`); // ✅ Создаём ссылку на рецепт

        remove(recipeRef) // ✅ Используем `remove(ref(database, ...))`
            .then(() => {
                const recipeElement = document.getElementById(`recipe-${recipeId}`);
                if (recipeElement) {
                    recipeElement.remove(); // ✅ Удаляем из UI
                }
                alert("Recipe deleted successfully!");
            })
            .catch((error) => {
                console.error("Delete error:", error);
                alert("Failed to delete the recipe.");
            });
    }
}

// ✅ Функция загрузки рецептов (без кнопки Save)
function loadRecipes() {
    get(ref(database, "recipes")).then((snapshot) => {
        const recipeList = document.getElementById("recipeList");
        recipeList.innerHTML = ""; // Очищаем перед загрузкой

        snapshot.forEach((childSnapshot) => {
            const recipe = childSnapshot.val();
            const recipeId = childSnapshot.key; // Уникальный ID рецепта

            const div = document.createElement("div");
            div.classList.add("recipe-card");
            div.id = `recipe-${recipeId}`; // Добавляем ID для удаления без перезагрузки

            div.innerHTML = `
                <h3 id="title-${recipeId}">${recipe.title}</h3>
                <p><strong>Ingredients:</strong> <span id="ingredients-${recipeId}">${recipe.ingredients}</span></p>
                <p><strong>Instructions:</strong> <span id="instructions-${recipeId}">${recipe.instructions}</span></p>
                <button class="delete-btn" data-id="${recipeId}">Delete</button>
            `;
            recipeList.appendChild(div);
        });

        // ✅ Добавляем обработчики кликов на кнопки "Delete"
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const recipeId = event.target.getAttribute("data-id");
                deleteRecipe(recipeId);
            });
        });

    }).catch((error) => {
        console.error("Error loading recipes:", error);
    });
}

// ✅ Загружаем рецепты при загрузке страницы
document.addEventListener("DOMContentLoaded", loadRecipes);

// ✅ Функция сохранения нового рецепта
function saveNewRecipe() {
    const title = document.getElementById("recipeTitle").value.trim();
    const ingredients = document.getElementById("recipeIngredients").value.trim();
    const instructions = document.getElementById("recipeInstructions").value.trim();

    if (!title || !ingredients || !instructions) {
        alert("Please fill out all fields.");
        return;
    }

    // ✅ Создаём ссылку на новую запись в Firebase
    const newRecipeRef = push(ref(database, "recipes"));

    set(newRecipeRef, {
        title,
        ingredients,
        instructions
    }).then(() => {
        alert("Recipe saved successfully!");
        document.getElementById("recipeTitle").value = "";
        document.getElementById("recipeIngredients").value = "";
        document.getElementById("recipeInstructions").value = "";
        loadRecipes(); // ✅ Перезагружаем список рецептов
    }).catch((error) => {
        console.error("Error saving recipe:", error);
        alert("Failed to save the recipe.");
    });
}

// ✅ Привязываем кнопку "Save Recipe" к обработчику
document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveRecipe");
    if (saveButton) {
        saveButton.addEventListener("click", saveNewRecipe);
    } else {
        console.error("Error: 'Save Recipe' button not found!");
    }
});


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

