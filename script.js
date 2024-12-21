// JavaScript for Theme Toggle
document.getElementById("theme-toggle").addEventListener("click", function () {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    this.innerHTML = "🌙"; // Update button icon for light theme
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    this.innerHTML = "🌞"; // Update button icon for dark theme
  }
});

async function fetchWords() {
  const response = await fetch("words.json?" + new Date().getTime()); // Cache-busting query
  if (!response.ok) {
    console.error("Failed to load words.json");
    return [];
  }
  return await response.json();
}
let words = [];
let usedWords = []; // Track used words
let correctCount = 0;
let wrongCount = 0;
let startTime = Date.now();
let currentWord = null; // Track the current word
let challenge_completed = false;

let memeThreshold = null;
let consecutiveWrong = 0;
const memes = [
  // List of meme URLs
  "https://i.pinimg.com/564x/6f/85/97/6f85970171354719985a48e863c6128a.jpg",
  "https://i.imgflip.com/2w0u93.jpg",
  "https://i.pinimg.com/736x/cb/34/0a/cb340aea9d643e9ca18e8a9956044b28.jpg",
  "https://images7.memedroid.com/images/UPLOADED465/66b29972a1346.jpeg",
];
// Fetch the words from the JSON and initialize the game
async function initializeGame() {
  words = await fetchWords();
  if (words.length > 0) {
    shuffleWords(); // Shuffle words initially
    loadNextWord();
  }
}

// Shuffle words and reset the used words array
function shuffleWords() {
  // Randomize the words array
  words = words.sort(() => Math.random() - 0.5);
  usedWords = []; // Reset used words
}

// Load the next word randomly without repetition
function loadNextWord() {
  const randomNumber = Math.floor(Math.random() * 10000);
  const chance = Math.random(); // Random number between 0 and 1
  const probability = 0.1; // 10% probability of showing a number instead of a word
  console.log(chance, probability);
  if (chance <= probability) {
    const germanNumber = numberToGerman(randomNumber); // Get the German translation
    currentWord = { english: randomNumber, german: germanNumber };
  } else {
    // Continue with the normal vocabulary challenge

    if (words.length === 0) {
      // If all words have been used print a congratulatory message that you have finsihed all words we have
      document.getElementById("current-word-text").textContent =
        "Congratulations! You have finished all the words.";
      challenge_completed = true;
      return;
    }

    // Select a random word that hasn't been used yet
    do {
      currentWord = words.pop(); // Pop a random word
    } while (usedWords.includes(currentWord));
  }
  // Mark the word as used
  usedWords.push(currentWord);

  // Update the UI with the new word
  document.getElementById(
    "current-word-text"
  ).textContent = `Next Word: ${currentWord.english}`;

  startTime = Date.now(); // Reset start time for this word
}

// Update the previous word after checking the answer
function updatePreviousWord(isCorrect, previousWord) {
  const prevText = `${isCorrect ? "✅" : "❌"} 
        <span class="word">${previousWord.english}</span> is: 
        <span class="word">${previousWord.german}</span> 
        <button id="listen-prev-btn" class="speak-btn">🔊</button>`;

  const prevClass = isCorrect ? "correct" : "wrong";

  const prevWordElement = document.getElementById("prev-word-text");
  prevWordElement.innerHTML = prevText;
  prevWordElement.classList.remove("neutral", "correct", "wrong");
  prevWordElement.classList.add(prevClass);

  // Add event listener to the "Listen" button
  document
    .getElementById("listen-prev-btn")
    .addEventListener("click", function () {
      speakWord(previousWord.german, "de-DE");
    });
}

// Show meme popup
function showMeme() {
  const randomMeme = memes[Math.floor(Math.random() * memes.length)];
  const memePopup = document.getElementById("meme-popup");
  const memeImage = document.getElementById("meme-image");
  memeImage.src = randomMeme;
  memePopup.style.display = "block";
}

// Inside checkAnswer function, call updatePreviousWord after checking
function checkAnswer() {
  if (document.getElementById("meme-popup").style.display === "block") {
    document.getElementById("meme-popup").style.display = "none";
    return;
  }
  if (challenge_completed) {
    return;
  }

  const userInput = document.getElementById("user-input").value.trim();
  const memeCommand = /^memes (\d+)$/i;
  const memeMatch = userInput.match(memeCommand);
  if (memeMatch) {
    memeThreshold = parseInt(memeMatch[1]);
    consecutiveWrong = 0; // Reset consecutive wrong count
  }

  const isCorrect =
    userInput.toLowerCase() === currentWord.german.toLowerCase();
  // Update stats
  if (isCorrect) {
    correctCount++;
    consecutiveWrong = 0; // Reset consecutive wrong count
  } else {
    wrongCount++;
    consecutiveWrong++;

    if (memeThreshold !== null && consecutiveWrong >= memeThreshold) {
      showMeme();
      consecutiveWrong = 0; // Reset consecutive wrong count
    }
  }

  // Update previous word section immediately after checking the answer
  // updatePreviousWord(isCorrect);
  updatePreviousWord(isCorrect, currentWord);

  // Update stats display
  const elapsedTime = (Date.now() - startTime) / 1000;
  const averageTime =
    correctCount + wrongCount > 0
      ? elapsedTime / (correctCount + wrongCount)
      : 0;
  document.getElementById("correct-count").textContent = correctCount;
  document.getElementById("wrong-count").textContent = wrongCount;
  document.getElementById("average-time").textContent =
    averageTime.toFixed(2) + "s";

  // Clear the input field and load the next word
  document.getElementById("user-input").value = "";
  loadNextWord();
}

// Set up event listener for the submit button
document.getElementById("submit-btn").addEventListener("click", checkAnswer);

// Set up event listener for the Enter key
document
  .getElementById("user-input")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if inside a form
      checkAnswer(); // Trigger answer checking when Enter is pressed
    }
  });
function numberToGerman(number) {
  const units = [
    "",
    "eins",
    "zwei",
    "drei",
    "vier",
    "fünf",
    "sechs",
    "sieben",
    "acht",
    "neun",
  ];
  const teens = [
    "zehn",
    "elf",
    "zwölf",
    "dreizehn",
    "vierzehn",
    "fünfzehn",
    "sechzehn",
    "siebzehn",
    "achtzehn",
    "neunzehn",
  ];
  const tens = [
    "",
    "",
    "zwanzig",
    "dreißig",
    "vierzig",
    "fünfzig",
    "sechzig",
    "siebzig",
    "achtzig",
    "neunzig",
  ];
  const thousands = [
    "",
    "tausend",
    "zwei tausend",
    "drei tausend",
    "vier tausend",
    "fünf tausend",
    "sechs tausend",
    "sieben tausend",
    "acht tausend",
    "neun tausend",
  ];

  if (number === 0) return "null";

  let result = "";

  // Handle thousands (for numbers over 999)
  if (number >= 1000) {
    const thousandsPart = Math.floor(number / 1000);
    result += `${units[thousandsPart]}tausend`;
    number %= 1000;
  }

  // Handle hundreds (for numbers from 100-999)
  if (number >= 100) {
    const hundreds = Math.floor(number / 100);
    result += `${units[hundreds]}hundert`;
    number %= 100;
  }

  // Handle tens and ones (for numbers from 20-99 or 10-19)
  if (number >= 20) {
    const tensPart = Math.floor(number / 10);
    const unitsPart = number % 10;

    // Special case: multiples of 10 (20, 30, etc.)
    if (unitsPart === 0) {
      result += tens[tensPart];
    } else {
      if (unitsPart === 1) {
        result += "einund";
      } else {
        result += `${units[unitsPart]}und`;
      }
      result += tens[tensPart];
    }
    number = 0; // No more digits to handle
  } else if (number >= 10) {
    // Handle 10-19
    result += teens[number - 10];
    number = 0; // No more digits to handle
  } else if (number > 0) {
    // Handle 1-9
    result += units[number];
    number = 0; // No more digits to handle
  }

  return result.trim();
}

function speakWord(word, lang = "de-DE") {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  } else {
    console.error("Speech synthesis not supported in this browser.");
  }
}

document.getElementById("close-popup").onclick = function () {
  document.getElementById("meme-popup").style.display = "none";
};
// Initialize the game when the page loads
initializeGame();
