class MazeRunner {
    constructor() {
        this.canvas = document.getElementById('maze-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set initial canvas size, will be adjusted for responsiveness
        this.canvas.width = 600;
        this.canvas.height = 600;
        
        this.difficulties = {
            easy: { size: 15, name: 'Easy' },
            medium: { size: 21, name: 'Medium' },
            hard: { size: 31, name: 'Hard' }
        };
        
        this.currentDifficulty = 'easy';
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.goal = { x: 0, y: 0 };
        this.cellSize = 0;
        this.level = 1;
        this.startTime = 0;
        this.gameTimer = null;
        this.bestTimes = {}; // Stores best times for each difficulty and level
        
        this.initializeGame();
        this.attachEventListeners();
    }
    
    initializeGame() {
        this.loadBestTimes();
        this.generateMaze();
        this.startTimer();
        this.draw();
        this.updateBestTimeDisplay();
    }
    
    attachEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('new-maze-btn').addEventListener('click', () => this.newMaze());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetPosition());
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.newMaze();
        });
        
        // Make canvas focusable for keyboard events
        this.canvas.tabIndex = 0;
        this.canvas.focus();

        // Handle canvas resizing
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas(); // Initial resize
    }

    resizeCanvas() {
        const gameBoardContainer = this.canvas.parentElement;
        const size = Math.min(gameBoardContainer.clientWidth, gameBoardContainer.clientHeight, 600); // Max 600px
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = Math.floor(this.canvas.width / this.difficulties[this.currentDifficulty].size);
        this.draw();
    }
    
    generateMaze() {
        const size = this.difficulties[this.currentDifficulty].size;
        this.cellSize = Math.floor(this.canvas.width / size);
        
        this.maze = Array(size).fill().map(() => Array(size).fill(1));
        
        this.carvePath(1, 1);
        
        this.player = { x: 1, y: 1 };
        this.goal = { x: size - 2, y: size - 2 };
        
        this.maze[1][1] = 0;
        this.maze[size - 2][size - 2] = 0;
    }
    
    carvePath(x, y) {
        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0] 
        ];
        
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        this.maze[y][x] = 0; 
        
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx > 0 && nx < this.maze[0].length - 1 && 
                ny > 0 && ny < this.maze.length - 1 && 
                this.maze[ny][nx] === 1) {
                
                this.maze[y + dy / 2][x + dx / 2] = 0;
                this.carvePath(nx, ny);
            }
        }
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        let newX = this.player.x;
        let newY = this.player.y;
        
        if (key === 'w' || key === 'arrowup') {
            newY--;
        } else if (key === 's' || key === 'arrowdown') {
            newY++;
        } else if (key === 'a' || key === 'arrowleft') {
            newX--;
        } else if (key === 'd' || key === 'arrowright') {
            newX++;
        }
        
        if (this.isValidMove(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.draw();
            
            if (this.player.x === this.goal.x && this.player.y === this.goal.y) {
                this.handleLevelComplete();
            }
        }
        
        e.preventDefault();
    }
    
    isValidMove(x, y) {
        return x >= 0 && x < this.maze[0].length && 
               y >= 0 && y < this.maze.length && 
               this.maze[y][x] === 0;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                this.ctx.fillStyle = this.maze[y][x] === 1 ? '#34495e' : '#ecf0f1';
                this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
        
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.maze.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw goal
        this.drawCircle(this.goal.x, this.goal.y, '#e74c3c', '#c0392b', 'goal-animated');
        
        // Draw player
        this.drawCircle(this.player.x, this.player.y, '#3498db', '#5dade2', 'player-animated');
    }

    drawCircle(x, y, color1, color2, animationClass) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 3;

        // Apply animation class to canvas for visual effect (CSS handles animation)
        this.canvas.classList.remove('player-animated', 'goal-animated'); // Clear previous animations
        this.canvas.classList.add(animationClass);

        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(centerX + 2, centerY + 2, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw body
        this.ctx.fillStyle = color1;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw highlight
        this.ctx.fillStyle = color2;
        this.ctx.beginPath();
        this.ctx.arc(centerX - 3, centerY - 3, radius * 0.4, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    handleLevelComplete() {
        clearInterval(this.gameTimer);
        const completionTime = Date.now() - this.startTime;
        const timeString = this.formatTime(completionTime);
        
        const difficultyKey = `${this.currentDifficulty}_${this.level}`;
        if (!this.bestTimes[difficultyKey] || completionTime < this.bestTimes[difficultyKey]) {
            this.bestTimes[difficultyKey] = completionTime;
            this.saveBestTimes();
            this.updateBestTimeDisplay();
            this.showMessage(`New Best Time! Level ${this.level} completed in ${timeString}!`, 'success');
        } else {
            this.showMessage(`Level ${this.level} completed in ${timeString}!`, 'success');
        }
        
        setTimeout(() => {
            this.level++;
            this.updateLevelDisplay();
            this.generateMaze();
            this.startTimer();
            this.draw();
            this.hideMessage();
        }, 2000);
    }
    
    startTimer() {
        this.startTime = Date.now();
        clearInterval(this.gameTimer); // Clear any existing timer
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            document.getElementById('time-display').textContent = this.formatTime(elapsed);
        }, 100);
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10); // Get centiseconds
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
    
    updateLevelDisplay() {
        document.getElementById('level-display').textContent = this.level;
    }
    
    updateBestTimeDisplay() {
        const difficultyKey = `${this.currentDifficulty}_${this.level}`;
        const bestTime = this.bestTimes[difficultyKey];
        document.getElementById('best-time-display').textContent = 
            bestTime ? this.formatTime(bestTime) : '--:--.--';
    }
    
    saveBestTimes() {
        localStorage.setItem('mazeBestTimes', JSON.stringify(this.bestTimes));
    }
    
    loadBestTimes() {
        const savedTimes = localStorage.getItem('mazeBestTimes');
        if (savedTimes) {
            this.bestTimes = JSON.parse(savedTimes);
        }
    }
    
    showMessage(text, type) {
        const messageEl = document.getElementById('game-message');
        messageEl.textContent = text;
        messageEl.className = `game-message ${type}`;
        messageEl.classList.remove('hidden');
    }
    
    hideMessage() {
        const messageEl = document.getElementById('game-message');
        messageEl.classList.add('hidden');
    }
    
    newMaze() {
        clearInterval(this.gameTimer);
        this.level = 1;
        this.updateLevelDisplay();
        this.generateMaze();
        this.startTimer();
        this.updateBestTimeDisplay();
        this.draw();
        this.hideMessage();
    }
    
    resetPosition() {
        this.player = { x: 1, y: 1 };
        this.draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MazeRunner();
});
