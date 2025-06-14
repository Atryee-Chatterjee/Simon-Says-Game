//Game sequence and user input tracking
let gameSeq = [];
let userSeq = [];

// Available button colors
let btns = ["yellow", "red", "blue","green"];

// Game state variables
let  started = false;
let level = 0;
let countdownValue = 3;

//DOM Element Referances
let h3 = document.querySelector("h3");
let scoreDisplay = document.getElementById("score");
let highScoreDisplay = document.getElementById("high-score");
let startBtn = document.getElementById("start-btn");
let levelText = document.getElementById("game-level");
let turnDisplay = document.getElementById("turn-display");
let timerDisplay = document.getElementById("timer-display");

//Sound Effects
let userSound = new Audio("click.mp3");
let gameSound = new Audio("beep.mp3");
let wrongSound = new Audio("wrong.mp3");

let timerId;       // To store the timer interval
let timeLeft = 45;  // Time allowed per round (in seconds)

// Load high score from localStorage 
let highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.innerText = `High Score: ${highScore}`;

//Set Turn Display
function setTurn(turn) {
    if (turn === "computer") {
        turnDisplay.textContent = "Computer's Turn";
    } else if (turn === "user") {
        turnDisplay.textContent = "Your Turn";
    } else {
        turnDisplay.textContent = "Waiting...";
    }
}

//Start game button on click
startBtn.addEventListener("click", function () {
    if (!started) {
        started = true;
        level = 0;
        userSeq = [];
        gameSeq = [];
        scoreDisplay.innerText = "Score: 0";
        highScoreDisplay.innerText = `High Score: ${highScore}`;
        startBtn.style.display = "none"; // Hide button
        setTurn("Waiting..."); 

        disableButtons(); //Disable buttons at the very start of game initiation
        // Start the countdown instead of directly leveling up
        startCountdown();
    }
});

//Countdown before game starts
function startCountdown() {
    countdownValue = 3; // Reset countdown for each game start
    levelText.innerText = countdownValue; // Display the initial countdown value

    const countdownInterval = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
            levelText.innerText = countdownValue;
            gameSound.currentTime = 0;
            gameSound.play();
        } else if (countdownValue === 0) {
            levelText.innerText = "GO!";
            userSound.currentTime = 0;
            userSound.play();
        } else {
            clearInterval(countdownInterval); // Stop the countdown
            setTurn("computer"); // Indicate computer's turn
            levelUp(); // Start the game sequence
        }
    }, 1000); 
}

// Level up and flash all color sequence
function levelUp(){
    userSeq = [];
    level++;
    scoreDisplay.innerText = `Score: ${level}`;
    levelText.innerText = `Level ${level}`;

    setTurn("computer");
    disableButtons(); // Ensure buttons are disabled during computer's turn
    stopTimer(); // Stop timer while computer is flashing

    // Pick a random button and add to sequence
    let randIdx = Math.floor(Math.random() * btns.length);
    let randColor = btns[randIdx];
    gameSeq.push(randColor);
    console.log("Game sequence:",gameSeq);
    
    setTimeout(() => gameFlashSequence(gameSeq), 600);
}


// Flash the game Sequence 
function gameFlashSequence(seq) {
    stopTimer(); // Ensure timer is off during computer's turn
    setTurn("computer");
    disableButtons();

    let i = 0;
    const interval = setInterval(() => {
        const color = seq[i];
        const btn = document.querySelector(`.${color}`);
        gameSound.currentTime = 0;
        gameSound.play();
        btn.classList.add("flash", "no-hover");

        setTimeout(() => {
            btn.classList.remove("flash", "no-hover");
        }, 300);

        i++;
        if (i >= seq.length) {
            clearInterval(interval);
            setTimeout(() => {
                setTurn("user");
                enableButtons();
                startTimer(); // Timer starts ONLY on user's turn
            }, 400);
        }
    }, 600);
}

// Handle user button press
function btnPress(){
    if (this.classList.contains("disabled")) {
        return; // Do nothing if button is disabled
    }
    let btn = this;
    userFlash(btn);

    let userColor = btn.getAttribute("id");
    userSeq.push(userColor);

    checkAns(userSeq.length-1);
    //Stop timer only if user has finished entire sequence
    if (userSeq.length === gameSeq.length) {
        stopTimer();
        disableButtons(); //Disable buttons immediately after user completes sequence
                          // They will be re-enabled by levelUp (after 1 sec delay)
    }
}

// Flash effect for User click
function userFlash(btn){
    userSound.currentTime = 0;
    userSound.play();
    btn.classList.add("userflash", "no-hover");
    setTimeout(() => {
        btn.classList.remove("userflash", "no-hover");
    }, 200);
}


//User answer checking
function checkAns(idx){
    if (userSeq[idx] === gameSeq[idx]){
        // If the entire sequence is correct, move to next level
        if (userSeq.length == gameSeq.length) {
            setTimeout(levelUp, 1000);
        }
    } else {
        // Update and store high score 
        if (level > highScore) {
            highScore = level;
            localStorage.setItem("highScore", highScore);
            highScoreDisplay.innerText = `High Score: ${highScore}`;

        }
        //game over sound 
        wrongSound.currentTime = 0;
        wrongSound.play();

        // Show game over message
        levelText.innerHTML = `Game over!<br><br>Your Score: ${level}<br><br> Press Restart TO Play Again`;
        
        // Flash red background briefly
        document.querySelector("body").style.backgroundColor = "red";
        setTimeout(() => {
            document.querySelector("body").style.backgroundColor ="#121212";
        }, 400);
        
        //Reset game state
        reset();
    } 
}

//Timer Functions
function startTimer() {
    clearInterval(timerId); // Clear old timer if any
    timeLeft = 45;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    timerDisplay.style.visibility = "visible";

    timerId = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerDisplay.textContent = "Time's up!";
            endGame("Time's up!");
        }
    }, 1000);
}
function stopTimer() {
    clearInterval(timerId);
    timerDisplay.textContent = "";
    timerDisplay.style.visibility = "hidden";
}

// End Game With Message 
function endGame(reason) {
    stopTimer();
    wrongSound.currentTime = 0;
    wrongSound.play();

    if (level > highScore) {
        highScore = level;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.innerText = `High Score: ${highScore}`;
    }

    levelText.innerHTML = `${reason}<br><br> Your Score: ${level}<br><br> Press Restart TO Play Again`;
    document.body.style.backgroundColor = "red";
    setTimeout(() => document.body.style.backgroundColor = "#121212", 400);
    disableButtons(); //Ensure buttons are disabled after game over
    reset();
}


// Add event listeners to all game buttons
let allBtns = document.querySelectorAll(".btn");
for(btn of allBtns){
    btn.addEventListener("click", btnPress);
}

// Button control functions(enable & disable buttons)
function disableButtons() {
    for (let btn of allBtns) {
        btn.classList.add("disabled");
    }
}
function enableButtons() {
    for (let btn of allBtns) {
        btn.classList.remove("disabled");
    }
}


// Reset the game state
function reset(){
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    scoreDisplay.innerText = "Score: 0";
    setTurn(); // set to 'Waiting...'

 // Change button text and show it again
    startBtn.innerText = "Restart Game";
    startBtn.style.display = "inline-block";
}