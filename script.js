
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set up a function to adjust the canvas size dynamically
function resizeCanvas() {
  const aspectRatio = 16 / 9;
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width / height > aspectRatio) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameRunning = false;

// Load assets
const background = new Image();
background.src = 'assets/background.png';

const kasper = new Image();
kasper.src = 'assets/kasperghostflappy.png';

const flapSound = new Audio('assets/flap.wav');
const gameOverSound = new Audio('assets/gameover.wav');
const bgMusic = new Audio('assets/background.mp3');
bgMusic.loop = true;

// Game variables
let kasperX = canvas.width / 10;
let kasperY = canvas.height / 2;
let gravity = 0.08; 
let lift = -4;     
let velocity = 0;

let pipes = [];
let pipeWidth = canvas.width / 10;
let pipeGap = canvas.height / 3; 
let pipeSpeed = 1.0;

let score = 0;
let gameOver = false;

// Mobile and Desktop support
canvas.addEventListener('touchstart', function(e) {
  if (!gameRunning) {
    startGame();
  } else {
    velocity = lift;
    flapSound.play();
  }
  e.preventDefault();
});

canvas.addEventListener('click', function() {
  if (!gameRunning) {
    startGame();
  } else {
    velocity = lift;
    flapSound.play();
  }
});

function startGame() {
  kasperY = canvas.height / 2;
  pipes = [];
  score = 0;
  gameRunning = true;
  bgMusic.play();
  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Update Kasper's position and draw him
  velocity += gravity;
  kasperY += velocity;
  ctx.drawImage(kasper, kasperX, kasperY, canvas.width / 10, canvas.height / 10);  // Proportional Kasper size

  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameOver = false;
  gameRunning = false;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  startGame();
}

// Submitting score functionality remains unchanged

// Function to submit score to the leaderboard
document.getElementById('submitScoreForm').addEventListener('submit', function(event) {
  event.preventDefault();
  let walletAddress = document.getElementById('walletAddress').value;
  submitScore(walletAddress, score);
});

function submitScore(walletAddress, score) {
  fetch('http://your-server.com/submit_score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallet_address: walletAddress,
      score: score
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Score submitted successfully!');
      fetchLeaderboard();
    } else {
      alert('Error submitting score!');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Fetch leaderboard
function fetchLeaderboard() {
  fetch('http://your-server.com/get_leaderboard')
    .then(response => response.json())
    .then(leaderboard => {
      const leaderboardList = document.getElementById('leaderboardList');
      leaderboardList.innerHTML = '';
      leaderboard.forEach(entry => {
        let listItem = document.createElement('li');
        listItem.textContent = `Wallet: ${entry.wallet_address} - Score: ${entry.score}`;
        leaderboardList.appendChild(listItem);
      });
      document.getElementById('leaderboard').classList.remove('hidden');
    });
}
