
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;

let background = new Image();
background.src = 'https://digitaldominance.github.io/FlappyGhost/assets/background.png';

let kasper = new Image();
kasper.src = 'https://digitaldominance.github.io/FlappyGhost/assets/kasperghostflappy.png';

let flapSound = new Audio('https://digitaldominance.github.io/FlappyGhost/assets/flap.wav');
let gameOverSound = new Audio('https://digitaldominance.github.io/FlappyGhost/assets/gameover.wav');
let bgMusic = new Audio('https://digitaldominance.github.io/FlappyGhost/assets/background.mp3');
bgMusic.loop = true;

let kasperX = 50;
let kasperY = 150;
let gravity = 0.08;  // Slightly weaker gravity for smoother fall
let lift = -4;       // Weaker lift for smoother jumps
let velocity = 0;

let pipes = [];
let pipeWidth = 50;
let pipeGap = 200;  // Larger gap between pipes
let pipeSpeed = 1.0;  // Slower initial speed

let score = 0;
let gameOver = false;

// Mobile touch support
canvas.addEventListener('touchstart', function(e) {
  if (!gameRunning) {
    startGame();
  } else {
    velocity = lift;
    flapSound.play();
  }
  e.preventDefault();
});

// Desktop click support
canvas.addEventListener('click', function() {
  if (!gameRunning) {
    startGame();
  } else {
    velocity = lift;
    flapSound.play();
  }
});

function startGame() {
  kasperY = 150;
  pipes = [];
  score = 0;
  gameRunning = true;
  bgMusic.play();
  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Update and draw Kasper
  velocity += gravity;
  kasperY += velocity;
  ctx.drawImage(kasper, kasperX, kasperY);

  // Game logic for pipes, score, etc. continues here...
  // The rest of the game loop remains as is...

  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameOver = false;
  gameRunning = false;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  startGame();
}

// Function to submit score to the leaderboard
document.getElementById('submitScoreForm').addEventListener('submit', function(event) {
  event.preventDefault();
  let walletAddress = document.getElementById('walletAddress').value;
  submitScore(walletAddress, score);
});

// Submit score API call
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

// Fetch leaderboard and update UI
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
