export {}; // Делаем файл модулем, чтобы избежать ошибок

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "wcag-a4bb1.firebaseapp.com",
    databaseURL: "https://wcag-a4bb1-default-rtdb.firebaseio.com",
    projectId: "wcag-a4bb1",
    storageBucket: "wcag-a4bb1.appspot.com",
    messagingSenderId: "657788035140",
    appId: "1:657788035140:web:06da8a50860747c05f5c11",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// Проверка аутентификации
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    }
});

// Выход из аккаунта
document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    loadRecipes(); // Теперь вызываем после загрузки DOM

    // Сохранение рецепта
    document.getElementById("saveRecipe").addEventListener("click", () => {
        const title = document.getElementById("recipeTitle").value;
        const ingredients = document.getElementById("recipeIngredients").value;
        const instructions = document.getElementById("recipeInstructions").value;

        if (!title || !ingredients || !instructions) {
            alert("Please fill out all fields.");
            return;
        }

        const recipeRef = push(ref(db, "recipes"));
        set(recipeRef, { title, ingredients, instructions }).then(loadRecipes);
    });

    // Подключение OpenAI API для генерации рецептов
    document.getElementById("askAIBtn").addEventListener("click", async () => {
        const inputText = document.getElementById("chatInput").value;
        if (!inputText) {
            alert("Please enter a question!");
            return;
        }

        const apiKey = "YOUR_OPENAI_API_KEY";
        const url = "https://api.openai.com/v1/completions";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "text-davinci-003",
                    prompt: `Generate a recipe for: ${inputText}\n\nFormat:\nRecipe Name: \nIngredients: \nInstructions: `,
                    max_tokens: 150
                })
            });

            const data = await response.json();
            if (!data.choices || !data.choices[0] || !data.choices[0].text) {
                alert("AI response error. Try again.");
                return;
            }

            const aiResponse = data.choices[0].text.split("\n").filter(line => line.trim() !== "");

            // Проверяем, есть ли все нужные элементы в ответе
            if (aiResponse.length >= 3) {
                document.getElementById("recipeTitle").value = aiResponse[0].replace("Recipe Name: ", "");
                document.getElementById("recipeIngredients").value = aiResponse[1].replace("Ingredients: ", "");
                document.getElementById("recipeInstructions").value = aiResponse[2].replace("Instructions: ", "");
            } else {
                alert("AI did not return a valid recipe. Try again.");
            }
        } catch (error) {
            console.error("Error with AI request:", error);
            alert("Failed to get response from AI.");
        }
    });
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
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
            `;
            recipeList.appendChild(div);
        });
    });
}
