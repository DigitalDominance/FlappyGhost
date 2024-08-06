const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 480;

let kasper = new Image();
kasper.src = 'assets/kasperghostflappy.png';

let flapSound = new Audio('assets/flap.wav');
let gameOverSound = new Audio('assets/gameover.wav');
let bgMusic = new Audio('assets/background.mp3');
bgMusic.loop = true;
bgMusic.play();

let kasperX = 50;
let kasperY = 150;
let gravity = 1.5;
let lift = -15;
let velocity = 0;

let pipes = [];
let pipeWidth = 50;
let pipeGap = 120;
let pipeSpeed = 2;

let score = 0;
let gameOver = false;

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
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
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

    drawKasper();
    updateKasper();

    drawPipes();
    updatePipes();

    drawScore();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();
