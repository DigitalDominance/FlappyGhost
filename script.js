const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameRunning) {
        drawBackground();
        drawKasper();
        drawPipes();
        drawScore();
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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
let gravity = 0.2; // Subtle gravity for smoother fall
let lift = -5;     // Subtle lift for smoother jumps
let velocity = 0;

let pipes = [];
let pipeWidth = 50;
let pipeGap = 150;  // Start with a larger gap between pipes
let pipeSpeed = 1.0;  // Start with a slower speed

let score = 0;
let gameOver = false;
let gameRunning = false;

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawKasper() {
    ctx.drawImage(kasper, kasperX, kasperY);
}

function updateKasper() {
    velocity += gravity;
    kasperY += velocity;

    // Ensure Kasper doesn't go out of bounds
    if (kasperY + kasper.height >= canvas.height || kasperY <= 0) {
        endGame();
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = '#000';
        ctx.fillRect(pipe.x, pipe.topY, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
            score++;
            document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
            // Gradually increase the speed and decrease the gap
            pipeSpeed += 0.02;
            if (pipeGap > 100) pipeGap -= 0.5;
        }

        // Check for collisions
        if (
            kasperX + kasper.width > pipe.x &&
            kasperX < pipe.x + pipeWidth &&
            (kasperY < pipe.topY + pipe.topHeight || kasperY + kasper.height > pipe.bottomY)
        ) {
            endGame();
        }
    });

    // Generate new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let topHeight = Math.random() * (canvas.height - pipeGap - 50);
        let bottomHeight = canvas.height - topHeight - pipeGap;
        pipes.push({
            x: canvas.width,
            topY: 0,
            topHeight: topHeight,
            bottomY: canvas.height - bottomHeight,
            bottomHeight: bottomHeight
        });
    }
}

function endGame() {
    gameOver = true;
    gameOverSound.play();
    bgMusic.pause();
    document.getElementById('gameOver').style.display = 'block';
    gameRunning = false;
}

function restartGame() {
    kasperY = 150;
    velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    pipeSpeed = 1.0; // Reset the speed
    pipeGap = 150;   // Reset the gap
    bgMusic.play();
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    gameRunning = true;
    gameLoop();
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Press Start 2P", cursive';
    ctx.fillText(`Score: ${score}`, 10, 25);
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        flap();
    }
});

document.addEventListener('click', flap);

function flap() {
    if (!gameOver) {
        velocity = lift;
        flapSound.play();
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawKasper();
    updateKasper();
    updatePipes();
    drawPipes();
    drawScore();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    document.getElementById('playScreen').style.display = 'none';
    bgMusic.play();
    gameRunning = true;
    gameLoop();
}

Promise.all([
    new Promise((resolve, reject) => {
        background.onload = resolve;
        background.onerror = reject;
    }),
    new Promise((resolve, reject) => {
        kasper.onload = resolve;
        kasper.onerror = reject;
    }),
    new Promise((resolve, reject) => {
        flapSound.oncanplaythrough = resolve;
        flapSound.onerror = reject;
    }),
    new Promise((resolve, reject) => {
        gameOverSound.oncanplaythrough = resolve;
        gameOverSound.onerror = reject;
    }),
    new Promise((resolve, reject) => {
        bgMusic.oncanplaythrough = resolve;
        bgMusic.onerror = reject;
    })
]).then(() => {
    document.getElementById('playScreen').style.display = 'block';
}).catch(err => console.error('Failed to load assets:', err));
