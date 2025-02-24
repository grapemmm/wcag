import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
    getDatabase, ref, set, get, push, remove
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import {
    getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
    signInWithCredential
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import {
    doc, getDoc, getFirestore
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// ✅ Firebase Configuration
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
const database = getDatabase(app);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let youtube_api_key = "";

let storedCredential = localStorage["credential"];
let user;
try {
    let credential = GoogleAuthProvider.credential(
      JSON.parse(storedCredential).idToken,
    );
    let result = await signInWithCredential(auth, credential);
    user = result.user;
  } catch (error) {
    if (error.message.includes("JSON.parse")) {
      console.warn(
        "unable to parse credential. Most probably not exists or broken",
      );
    } else {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error(errorCode, errorMessage, email, credential);
    }
  }
console.log(user);

// Fetch YouTube API Key
async function fetchYouTubeAPIKey() {
    const youtubeConfig = await getDoc(doc(firestore, "Youtube", "wcag"));
    if (youtubeConfig.exists()) {
        youtube_api_key = youtubeConfig.data().key;
    } else {
        console.error("YouTube API Key not found in Firestore.");
    }
}
fetchYouTubeAPIKey();

// Fetch YouTube Video
async function fetchYouTubeVideo(query) {
    if (!youtube_api_key) {
        console.error("YouTube API Key is missing.");
        return;
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+recipe&type=video&key=${youtube_api_key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            displayYouTubeVideo(videoId);
        } else {
            console.error("No video found.");
        }
    } catch (error) {
        console.error("Error fetching YouTube video:", error);
    }
}

// Display YouTube Video
function displayYouTubeVideo(videoId) {
    const videoContainer = document.getElementById("youtubeVideo");
    videoContainer.innerHTML = `
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        <button id="deleteVideoBtn">Delete Video</button>
    `;
    document.getElementById("deleteVideoBtn").addEventListener("click", deleteVideo);
}

// Delete YouTube Video
function deleteVideo() {
    document.getElementById("youtubeVideo").innerHTML = "";
}

// Google Authentication
document.getElementById("loginBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then(result => {
            console.log("User signed in:", result.user);
            alert(`Welcome, ${result.user.displayName}!`);
        })
        .catch(error => {
            console.error("Login error:", error.message);
            alert("Login failed: " + error.message);
        });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => window.location.href = "index.html")
        .catch(error => {
            console.error("Logout error:", error.message);
            alert("Logout failed: " + error.message);
        });
});

// Fetch OpenAI API Key
async function fetchAPIKey() {
    const chatgptConfig = await getDoc(doc(firestore, "Config", "wcag"));
    return chatgptConfig.exists() ? chatgptConfig.data().key : null;
}

let chatgpt_api_key = "";
fetchAPIKey().then(key => chatgpt_api_key = key);

// Request Recipe from AI
document.getElementById("askAIBtn").addEventListener("click", async () => {
    if (!chatgpt_api_key) {
        alert("OpenAI API Key is missing.");
        return;
    }

    const inputText = document.getElementById("chatInput").value.trim();
    if (!inputText) {
        alert("Please enter a recipe name!");
        return;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${chatgpt_api_key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are an AI assistant that provides recipes." },
                    { role: "user", content: `Give me a detailed recipe for: ${inputText}` }
                ],
                max_tokens: 200
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        document.getElementById("recipeTitle").value = inputText;
        document.getElementById("recipeIngredients").value = aiResponse.split("\n").slice(1, 5).join("\n");
        document.getElementById("recipeInstructions").value = aiResponse.split("\n").slice(5).join("\n");

        fetchYouTubeVideo(inputText);
    } catch (error) {
        console.error("Error with AI request:", error);
        alert("Failed to get response from AI.");
    }
});

// Load User Recipes
function loadRecipes() {
    const user = auth.currentUser;
    if (!user) return;

    get(ref(database, `users/${user.uid}/recipes`))
        .then(snapshot => {
            const recipeList = document.getElementById("recipeList");
            recipeList.innerHTML = snapshot.exists() ? "" : "<p>No recipes found.</p>";

            snapshot.forEach(childSnapshot => {
                const recipe = childSnapshot.val();
                const recipeId = childSnapshot.key;

                const div = document.createElement("div");
                div.classList.add("recipe-card");
                div.id = `recipe-${recipeId}`;

                div.innerHTML = `
                    <h3>${recipe.title}</h3>
                    <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                    <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                    <button class="delete-btn" data-id="${recipeId}">Delete</button>
                `;

                recipeList.appendChild(div);
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", event => deleteRecipe(event.target.getAttribute("data-id")));
            });
        })
        .catch(error => console.error("Error loading recipes:", error));
}

// Save New Recipe
function saveNewRecipe() {
    const user = auth.currentUser;
    if (!user) return;

    const title = document.getElementById("recipeTitle").value.trim();
    const ingredients = document.getElementById("recipeIngredients").value.trim();
    const instructions = document.getElementById("recipeInstructions").value.trim();

    if (!title || !ingredients || !instructions) {
        alert("Please fill out all fields.");
        return;
    }

    const newRecipeRef = push(ref(database, `users/${user.uid}/recipes`));
    set(newRecipeRef, { title, ingredients, instructions })
        .then(() => {
            alert("Recipe saved successfully!");
            loadRecipes();
        })
        .catch(error => console.error("Error saving recipe:", error));
}

document.getElementById("saveRecipe").addEventListener("click", saveNewRecipe);

// onAuthStateChanged(auth, user => user && loadRecipes());
loadRecipes();
console.log('ran load recipies');