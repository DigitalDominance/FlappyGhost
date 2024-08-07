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
let gravity = 0.1;  // Weaker gravity for smoother fall
let lift = -5;      // Weaker lift for smoother jumps
let velocity = 0;

let pipes = [];
let pipeWidth = 50;
let pipeGap = 200;  // Larger gap between pipes
let pipeSpeed = 1.0;  // Slower initial speed

let score = 0;
let gameOver = false;

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

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawKasper() {
    ctx.drawImage(kasper, kasperX, kasperY);
}

function updateKasper() {
    velocity += gravity;
    kasperY += velocity;

    if (kasperY + kasper.height >= canvas.height || kasperY <= 0) {
        endGame();
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        let gradient = ctx.createLinearGradient(pipe.x, pipe.topY, pipe.x + pipeWidth, pipe.topY + pipe.topHeight);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'lightblue');

        ctx.fillStyle = gradient;
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
            pipeSpeed += 0.01;  // Gradually increase the speed
            if (pipeGap > 150) pipeGap -= 0.5;  // Gradually decrease the gap
        }

        if (
            kasperX + kasper.width > pipe.x &&
            kasperX < pipe.x + pipeWidth &&
            (kasperY < pipe.topY + pipe.topHeight || kasperY + kasper.height > pipe.bottomY)
        ) {
            endGame();
        }
    });

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
    document.getElementById('scoreDisplay').classList.add('hidden');
    gameRunning = false;
}

function restartGame() {
    kasperY = 150;
    velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    pipeSpeed = 1.0;  // Reset the speed
    pipeGap = 200;   // Reset the gap
    bgMusic.play();
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    document.getElementById('scoreDisplay').classList.remove('hidden');
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
    document.getElementById('scoreDisplay').classList.remove('hidden');
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
