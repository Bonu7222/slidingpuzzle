const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const winOverlay = document.getElementById('win-overlay');
const finalTimeEl = document.getElementById('final-time');
const finalMovesEl = document.getElementById('final-moves');

const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const size = 3;
let boardState = [];
let emptyIndex = 8; 
let moves = 0;
let time = 0;
let timerInterval;
let isPlaying = false;
let confettiParticles = [];

function initBoard() {
    boardState = [];
    for (let i = 1; i < size * size; i++) {
        boardState.push(i);
    }
    boardState.push(0);
    emptyIndex = boardState.indexOf(0);
}

function shuffleBoard() {
    let currentIndex = boardState.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [boardState[currentIndex], boardState[randomIndex]] = [boardState[randomIndex], boardState[currentIndex]];
    }
    
    let inversions = 0;
    for (let i = 0; i < boardState.length; i++) {
        for (let j = i + 1; j < boardState.length; j++) {
            if (boardState[i] !== 0 && boardState[j] !== 0 && boardState[i] > boardState[j]) {
                inversions++;
            }
        }
    }
    
    if (inversions % 2 !== 0) {
        if (boardState[0] !== 0 && boardState[1] !== 0) {
            [boardState[0], boardState[1]] = [boardState[1], boardState[0]];
        } else {
            [boardState[2], boardState[3]] = [boardState[3], boardState[2]];
        }
    }
    
    emptyIndex = boardState.indexOf(0);
}

function renderBoard() {
    board.innerHTML = '';
    boardState.forEach((val, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        
        if (val === 0) {
            tile.classList.add('empty');
        } else {
            const row = Math.floor((val - 1) / size);
            const col = (val - 1) % size;
            const xPos = col * (100 / (size - 1));
            const yPos = row * (100 / (size - 1));
            
            tile.style.backgroundPosition = `${xPos}% ${yPos}%`;
            tile.addEventListener('click', () => moveTile(index));
        }
        
        board.appendChild(tile);
    });
}

function moveTile(index) {
    if (!isPlaying) return;

    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;
    
    const isAdjacent = 
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
        boardState[emptyIndex] = boardState[index];
        boardState[index] = 0;
        emptyIndex = index;
        moves++;
        movesEl.textContent = moves;
        renderBoard();
        checkWin();
    }
}

function checkWin() {
    for (let i = 0; i < boardState.length - 1; i++) {
        if (boardState[i] !== i + 1) return false;
    }
    
    isPlaying = false;
    clearInterval(timerInterval);
    
    finalTimeEl.textContent = timerEl.textContent;
    finalMovesEl.textContent = moves;
    winOverlay.classList.remove('hidden');
    
    startConfetti();
    return true;
}

function startTimer() {
    time = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time++;
        const mins = Math.floor(time / 60).toString().padStart(2, '0');
        const secs = (time % 60).toString().padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
}

function startGame() {
    initBoard();
    shuffleBoard();
    renderBoard();
    moves = 0;
    movesEl.textContent = moves;
    winOverlay.classList.add('hidden');
    isPlaying = true;
    confettiParticles = [];
    clearInterval(timerInterval);
    startTimer();
}

document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('play-again-btn').addEventListener('click', startGame);

function createConfetti() {
    const colors = ['#ff0055', '#00ffff', '#ffcc00', '#00ff55', '#aa00ff'];
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            dx: Math.random() * 4 - 2,
            dy: Math.random() * 5 + 2,
            rot: Math.random() * 360,
            rotSpeed: Math.random() * 10 - 5
        });
    }
}

function startConfetti() {
    createConfetti();
    requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (confettiParticles.length === 0) return;

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.y > canvas.height) {
            confettiParticles.splice(i, 1);
        }
    }

    if (confettiParticles.length > 0) {
        requestAnimationFrame(drawConfetti);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

startGame();