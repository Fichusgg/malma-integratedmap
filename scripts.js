(function() {
    "use strict";

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function() {
        const currentYearSpan = document.getElementById('currentYear');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        handleHeader();
        handleHeroCarousel();
        handleListings();
        handleScrollAnimations();
    });

    function handleHeader() {
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.getElementById('navList');

        if (navToggle && navList) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navList.classList.toggle('active');
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navList.classList.contains('active')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    navToggle.focus();
                }
            });

            document.addEventListener('click', (e) => {
                if (navList.classList.contains('active') && !navList.contains(e.target) && !navToggle.contains(e.target)) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                }
            });
        }
    }

    function handleHeroCarousel() {
        const track = document.querySelector('.hero-image-carousel .carousel-track');
        if (!track) return;

        const slides = Array.from(track.children);
        if (slides.length <= 1) return;

        // --- Seamless Loop Setup ---
        // 1. Clone first and last slides
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slides.length - 1].cloneNode(true);
        
        // 2. Add clones to the track
        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);

        // 3. Initial setup
        const allSlides = Array.from(track.children);
        let currentIndex = 1; // Start on the real first slide
        let isTransitioning = false;
        const slideInterval = 5000;
        const transitionStyle = `transform 0.8s cubic-bezier(0.35, 0, 0.25, 1)`;

        const setSlidePosition = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        };

        track.style.transition = 'none'; // Go to initial slide without animation
        setSlidePosition();

        // --- Event Listener for seamless jump ---
        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIndex === 0) { // Jumped to the last clone
                track.style.transition = 'none';
                currentIndex = allSlides.length - 2;
                setSlidePosition();
            }
            if (currentIndex === allSlides.length - 1) { // Jumped to the first clone
                track.style.transition = 'none';
                currentIndex = 1;
                setSlidePosition();
            }
        });

        const slide = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            track.style.transition = transitionStyle;
            setSlidePosition();
        };

        if (!prefersReducedMotion) {
            setInterval(slide, slideInterval);
        }
    }

    function handleListings() {
        const panels = document.querySelectorAll('.listings-container .listing-panel');
        if (panels.length === 0 || window.innerWidth < 768) return;

        panels.forEach(panel => {
            panel.addEventListener('click', () => {
                if (panel.classList.contains('active')) return;
                panels.forEach(p => p.classList.remove('active'));
                panel.classList.add('active');
            });
        });
    }

    function handleScrollAnimations() {
        const animatedItems = document.querySelectorAll('#hero .animated-text');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            animatedItems.forEach(item => item.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedItems.forEach(item => observer.observe(item));
    }

    

})();

// --- AI Travel Guide JavaScript ---

// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables provided by the Canvas environment
// IMPORTANT: These variables are typically injected by the Canvas platform.
// If you are running this outside of a Canvas environment, you will need to
// define firebaseConfig and ensure you have an API key securely managed.
/*const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};*/
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const firebaseConfig = {
    apiKey: "AIzaSyDPXpLVMrWXur1hc9DbYCCB2-uBnfGH1Qc",
    authDomain: "malmaintegrated.firebaseapp.com",
    projectId: "malmaintegrated",
    storageBucket: "malmaintegrated.firebasestorage.app",
    messagingSenderId: "194009445433",
    appId: "1:194009445433:web:7a5a8c77ed81e2170509e8",
    measurementId: "G-Y63HV2K8X7"
  };

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore is initialized but not used in this specific AI guide feature.

// References to DOM elements for the AI guide
const userInputField = document.getElementById('user-preference');
const getSuggestionsBtn = document.getElementById('get-suggestions-btn');
const aiResultsContainer = document.getElementById('ai-results');

// Event listener for the "Get Suggestions" button
getSuggestionsBtn.addEventListener('click', getAISuggestions);

// Authenticate with Firebase when the app loads
// This ensures you have a valid user session for making API calls that might require it.
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // If no user is signed in, try to sign in with the custom token or anonymously
        try {
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
                console.log("Signed in with custom token.");
            } else {
                await signInAnonymously(auth);
                console.log("Signed in anonymously.");
            }
        } catch (error) {
            console.error("Firebase authentication error:", error);
            displayError("Falha na autenticação. Por favor, atualize a página."); // Portuguese error message
        }
    } else {
        console.log("User already signed in:", user.uid);
    }
});

/**
 * Fetches AI-generated travel suggestions for Florianópolis based on user input.
 */
async function getAISuggestions() {
    const userPreference = userInputField.value.trim();

    // Validate user input
    if (!userPreference) {
        displayError("Por favor, diga-me que tipo de atividades você está interessado!"); // Portuguese prompt
        return;
    }

    // Display a loading message while waiting for AI response
    aiResultsContainer.innerHTML = '<h3>Pensando...</h3><p>Por favor, aguarde enquanto a IA gera seu guia personalizado...</p>'; // Portuguese loading
    aiResultsContainer.classList.remove('error-message'); // Clear any previous error messages

    try {
        // Prepare the payload for the Gemini API call
        let chatHistory = [];
        chatHistory.push({
            role: "user",
            parts: [
                {
                    // Updated prompt to request Portuguese and no emojis
                    text: `Sugira de 2 a 4 lugares para visitar, comer ou explorar em Florianópolis, Brasil, com base nestas preferências: "${userPreference}". Inclua uma breve descrição e evite emojis. Mantenha as respostas com menos de 200 palavras. Formate cada sugestão em uma nova linha, começando com o nome do local, seguido por dois pontos, e depois a descrição. Inclua um link do Google Maps no final da descrição. Certifique-se de que o idioma seja português. Os links do Google Maps devem ser completos e funcionais.`
                }
            ]
        });

        const payload = {
            contents: chatHistory,
            generationConfig: {
                maxOutputTokens: 300,
                temperature: 0.7,
                topK: 40,
                topP: 0.95
            }
        };

        const apiKey = "AIzaSyBBVk6MNUHPLthbQGt960nlCnZX0f6m224";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Make the API call to Gemini
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Check if the API response was successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.error.message || response.statusText}`);
        }

        const result = await response.json();

        // Extract the AI-generated text from the response
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const aiMessage = result.candidates[0].content.parts[0].text;
            displaySuggestions(aiMessage);
        } else {
            // Handle cases where the response structure is unexpected or content is missing
            throw new Error("Formato de resposta da IA inesperado ou vazio."); // Portuguese error
        }

    } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        displayError(`Falha ao obter sugestões. Por favor, tente novamente mais tarde. (Erro: ${error.message})`); // Portuguese error
    }
}

/**
 * Displays the AI-generated suggestions in the results container.
 * @param {string} text - The raw text response from the AI.
 */
function displaySuggestions(text) {
    aiResultsContainer.innerHTML = '<h3>Suas Sugestões Personalizadas:</h3>'; // Portuguese heading

    // Split the AI response into individual suggestions, assuming each is on a new line
    const suggestions = text.split('\n').filter(line => line.trim() !== '');

    // If no suggestions are found after parsing
    if (suggestions.length === 0) {
        aiResultsContainer.innerHTML = '<h3>Nenhuma sugestão encontrada. Por favor, tente refinar sua solicitação.</h3>'; // Portuguese message
        return;
    }

    // Iterate over each suggestion and create a place card for it
    suggestions.forEach(suggestion => {
        const placeCard = document.createElement('div');
        placeCard.classList.add('place-card');

        let name = 'Local Sugerido'; // Default Portuguese name
        let description = suggestion.trim();
        let googleMapsLink = null;

        // Regex to extract possible Google Maps link
        // This regex is made more robust to capture various Google Maps URL formats.
        const googleMapsLinkMatch = description.match(/(https?:\/\/(?:www\.)?(?:google\.com\/maps\/search\/\?.*query=|google\.com\/maps\/dir\/.*\/|google\.com\/maps\/place\/|goo\.gl\/maps\/|maps\.app\.goo\.gl\/)[^\s]+)/i);
        if (googleMapsLinkMatch) {
            googleMapsLink = googleMapsLinkMatch[1];
            // Remove the link from the description to display cleaner text
            description = description.replace(googleMapsLinkMatch[0], '').trim();
        }

        // Removed emoji extraction and removal logic

        // Attempt to parse name and description.
        // Assuming format: "Place Name: Description" or "Place Name - Description"
        const nameDescriptionSplit = description.split(/:\s*|(?<!\w)-\s*/, 2); // Split by ':' or ' - '
        if (nameDescriptionSplit.length > 1) {
            name = nameDescriptionSplit[0].trim();
            description = nameDescriptionSplit[1].trim();
        } else {
            // If no clear separator, assume the whole line is the description and try to guess a name
            name = description.split('.')[0].trim(); // Take first sentence as name
        }

        // Create and append the place name (no emojis)
        const nameElement = document.createElement('h4');
        nameElement.textContent = name;
        placeCard.appendChild(nameElement);

        // Create and append the description
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = description;
        placeCard.appendChild(descriptionElement);

        // If a Google Maps link was found, create and append it
        if (googleMapsLink) {
            const linkElement = document.createElement('a');
            linkElement.href = googleMapsLink;
            linkElement.target = '_blank'; // Open link in a new tab
            linkElement.textContent = 'Ver no Google Maps'; // Portuguese link text
            placeCard.appendChild(linkElement);
        }

        aiResultsContainer.appendChild(placeCard);
    });
}

/**
 * Displays an error message in the results container.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    aiResultsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

/*
 * Production Note: Protecting your API Key
 *
 * Directly exposing your API key in client-side JavaScript (as done here with `const apiKey = "";`)
 * is NOT secure for a production environment. Although Canvas provides the key at runtime for Gemini API,
 * for other APIs or if you were to deploy this outside Canvas, malicious users can easily inspect your
 * client-side code and potentially steal your key, leading to unauthorized usage and potential charges.
 *
 * To protect your API key in production, you should implement a backend server:
 *
 * 1.  Move the API key to your backend server: Store the API key as an environment variable or in a secure
 * configuration file on your server.
 *
 * 2.  Create an API endpoint on your backend: Your client-side JavaScript will send the user's preferences
 * to this backend endpoint.
 *
 * 3.  The backend makes the API call: The backend server will then use its securely stored API key to make the
 * request to the Gemini API (or any other external API).
 *
 * 4.  The backend sends the response back to the client: The backend processes the AI's response and
 * sends only the necessary data back to your client-side JavaScript.
 *
 * Example (conceptual) of how this flow would change:
 *
 * On the client (JavaScript):
 * fetch('/api/get-floripa-suggestions', { // Your backend endpoint, e.g., /api/get-floripa-suggestions
 * method: 'POST',
 * headers: { 'Content-Type': 'application/json' },
 * body: JSON.stringify({ preference: userPreference })
 * });
 *
 * On the backend (e.g., Node.js with Express, Python with Flask/Django, etc.):
 * // Example for Node.js (Express)
 * app.post('/api/get-floripa-suggestions', async (req, res) => {
 * const userPreference = req.body.preference;
 * const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Stored securely as an environment variable
 *
 * // ... construct payload and make fetch call to Gemini API using GEMINI_API_KEY ...
 *
 * res.json(aiResponseData); // Send back the AI response to the client
 * });
 *
 * This way, your API key is never exposed in the client's browser, significantly enhancing security.
 */

// --- End of AI Travel Guide JavaScript ---