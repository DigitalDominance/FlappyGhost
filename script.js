const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 480;

let background = new Image();
background.src = 'assets/background.png';

let kasper = new Image();
kasper.src = 'assets/kasperghostflappy.png';

let flapSound = new Audio('assets/flap.wav');
let gameOverSound = new Audio('assets/gameover.wav');
let bgMusic = new Audio('assets/background.mp3');
bgMusic.loop = true;

let kasperX = 50;
let kasperY = 150;
let gravity = 0.6;
let lift = -15;
let velocity = 0;

let pipes = [];
let pipeWidth = 50;
let pipeGap = 120;
let pipeSpeed = 2;

let score = 0;
let gameOver = false;

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
    document.getElementById('gameOver').classList.remove('hidden');
}

function restartGame() {
    kasperY = 150;
    velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    bgMusic.play();
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
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

Promise.all([
    new Promise((resolve, reject) => {
        background.onload = resolve;
        background.onerror = reject;
    }),
    new Promise((resolve, reject) => {
        kasper.onload = resolve;
        kasper.onerror = reject;
    })
]).then(() => {
    bgMusic.play();
    gameLoop();
}).catch(err => console.error('Failed to load images:', err));
