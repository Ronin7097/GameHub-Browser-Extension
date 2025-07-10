class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;

        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.lastTime = 0;
        this.gameRunning = true;
        this.isPaused = false;
        this.highScore = 0;

        this.pieces = [
            { shape: [[1, 1, 1, 1]], color: '#00f0f0' }, // I piece
            { shape: [[1, 1], [1, 1]], color: '#f0f000' }, // O piece
            { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' }, // T piece
            { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' }, // S piece
            { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' }, // Z piece
            { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' }, // J piece
            { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }  // L piece
        ];

        this.init();
        this.attachEventListeners();
    }

    init() {
        this.loadHighScore();
        this.board = Array(this.BOARD_HEIGHT).fill(0).map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.lastTime = 0;
        this.gameRunning = true;
        this.isPaused = false;

        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseOverlay').style.display = 'none';

        this.nextPiece = this.createPiece();
        this.spawnPiece();
        this.updateUI();
        this.gameLoop();
    }

    createPiece() {
        const pieceType = Math.floor(Math.random() * this.pieces.length);
        const piece = JSON.parse(JSON.stringify(this.pieces[pieceType]));
        piece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2);
        piece.y = 0;
        return piece;
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        this.drawNextPiece();

        if (this.isCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }

    isCollision(piece, dx, dy) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT || 
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    rotatePiece(piece) {
        const rotated = [];
        const N = piece.shape.length;
        const M = piece.shape[0].length;
        
        for (let i = 0; i < M; i++) {
            rotated[i] = [];
            for (let j = 0; j < N; j++) {
                rotated[i][j] = piece.shape[N - 1 - j][i];
            }
        }
        
        return { ...piece, shape: rotated };
    }

    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = this.currentPiece.color;
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; 
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateUI();
        }
    }

    movePiece(dx, dy) {
        if (!this.isCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    dropPiece() {
        if (!this.movePiece(0, 1)) {
            this.placePiece();
        }
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {}
        this.placePiece();
    }

    drawBoard() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
        
        this.ctx.strokeStyle = '#333';
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.BOARD_WIDTH * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    drawPiece(piece) {
        this.ctx.fillStyle = piece.color;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.ctx.fillRect(
                        (piece.x + x) * this.BLOCK_SIZE,
                        (piece.y + y) * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.strokeRect(
                        (piece.x + x) * this.BLOCK_SIZE,
                        (piece.y + y) * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                }
            }
        }
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const blockSize = 15;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
            
            this.nextCtx.fillStyle = this.nextPiece.color;
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                        this.nextCtx.strokeStyle = '#fff';
                        this.nextCtx.strokeRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                    }
                }
            }
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        // Update high score display if you add it to HTML
    }

    gameLoop(time = 0) {
        if (!this.gameRunning) {
            return;
        }

        if (this.isPaused) {
            requestAnimationFrame((t) => this.gameLoop(t)); // Continue loop when unpaused
            return;
        }

        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += deltaTime;

        const dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);

        if (this.dropTime > dropInterval) {
            this.dropPiece();
            this.dropTime = 0;
        }

        this.drawBoard();
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    gameOver() {
        this.gameRunning = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    restartGame() {
        this.init();
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) {
                return;
            }

            if (e.key === 'p' || e.key === 'P') {
                this.isPaused = !this.isPaused;
                document.getElementById('pauseOverlay').style.display = this.isPaused ? 'flex' : 'none';
                if (!this.isPaused) {
                    this.gameLoop(this.lastTime); // Resume game loop with last known time
                }
                return;
            }

            if (this.isPaused) return; // Prevent controls when paused

            switch (e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.dropPiece();
                    break;
                case 'ArrowUp':
                    const rotated = this.rotatePiece(this.currentPiece);
                    if (!this.isCollision(rotated, 0, 0)) {
                        this.currentPiece = rotated;
                    }
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }
        });

        // Expose restartGame to global scope for onclick in HTML
        window.restartGame = () => this.restartGame();
    }

    saveHighScore() {
        localStorage.setItem('tetrisHighScore', this.highScore);
    }

    loadHighScore() {
        const savedHighScore = localStorage.getItem('tetrisHighScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore, 10);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
