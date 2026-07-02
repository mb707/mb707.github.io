// Event Listeners
document.querySelector("#guessBtn").addEventListener("click", checkGuess);
document.querySelector("#resetBtn").addEventListener("click", initializeGame);

// Global variables
let randomNumber;
let attempts = 0;
let wins = 0;
let losses = 0;
const maxAttempts = 7;

initializeGame();

function initializeGame() {
    randomNumber = Math.floor(Math.random() * 99) + 1;
    console.log("Random number: " + randomNumber);

    attempts = 0;

    document.querySelector("#resetBtn").style.display = "none";
    document.querySelector("#guessBtn").style.display = "inline";

    let playerGuess = document.querySelector("#playerGuess");
    playerGuess.focus();
    playerGuess.value = "";

    let feedback = document.querySelector("#feedback");
    feedback.textContent = "";

    document.querySelector("#guesses").textContent = "";
    document.querySelector("#attemptsRemaining").textContent = maxAttempts;
}

function checkGuess() {
    let guess = document.querySelector("#playerGuess").value;
    let feedback = document.querySelector("#feedback");

    guess = Number(guess);

    feedback.textContent = "";

    if (guess < 1 || guess > 99 || isNaN(guess)) {
        feedback.textContent = "Enter a number between 1 and 99";
        feedback.style.color = "red";
        return;
    }

    attempts++;

    let attemptsLeft = maxAttempts - attempts;
    document.querySelector("#attemptsRemaining").textContent = attemptsLeft;

    console.log("Attempts: " + attempts);

    if (guess == randomNumber) {
        feedback.textContent = "You guessed it! You won! The number was " + randomNumber + ".";
        feedback.style.color = "darkgreen";

        wins++;
        document.querySelector("#wins").textContent = wins;

        gameOver();
    } else {
        document.querySelector("#guesses").textContent += guess + " ";

        if (attempts == maxAttempts) {
            feedback.textContent = "Sorry, you lost! The number was " + randomNumber + ".";
            feedback.style.color = "red";

            losses++;
            document.querySelector("#losses").textContent = losses;

            gameOver();
        } else if (guess > randomNumber) {
            feedback.textContent = "Guess was high. Try a lower number.";
            feedback.style.color = "orange";
        } else {
            feedback.textContent = "Guess was low. Try a higher number.";
            feedback.style.color = "orange";
        }
    }

    document.querySelector("#playerGuess").value = "";
    document.querySelector("#playerGuess").focus();
}

function gameOver() {
    document.querySelector("#guessBtn").style.display = "none";
    document.querySelector("#resetBtn").style.display = "inline";
}