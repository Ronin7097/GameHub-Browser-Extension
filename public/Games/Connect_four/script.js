// script.js
class ConnectFour {
    constructor() {
        this.board = Array(6).fill().map(() => Array(7).fill(0));
        this.currentPlayer = 1;
        this.gameActive = true;
        this.scores = { player1: 0, player2: 0 };
        
        this.initializeGame();
        this.attachEventListeners();
    }
    
    initializeGame() {
        this.loadScores(); // Load scores before creating the board
        this.createBoard();
        this.updateDisplay();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        const boardGrid = document.createElement('div');
        boardGrid.className = 'board-grid';
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.makeMove(col));
                boardGrid.appendChild(cell);
            }
        }
        
        gameBoard.appendChild(boardGrid);
        this.renderBoard(); // Render initial state of the board
    }

    renderBoard() {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.remove('player1', 'player2', 'winning', 'dropping');
                if (this.board[row][col] === 1) {
                    cell.classList.add('player1');
                } else if (this.board[row][col] === 2) {
                    cell.classList.add('player2');
                }
            }
        }
    }
    
    attachEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
    }
    
    makeMove(col) {
        if (!this.gameActive) return;
        
        // Find the lowest empty row in the column
        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                row = r;
                break;
            }
        }
        
        if (row === -1) return; // Column is full
        
        // Make the move
        this.board[row][col] = this.currentPlayer;
        this.updateCell(row, col);
        
        // Check for win
        if (this.checkWin(row, col)) {
            this.handleWin();
            return;
        }
        
        // Check for draw
        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateDisplay();
    }
    
    updateCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(`player${this.currentPlayer}`);
        cell.classList.add('dropping'); // Add dropping class for animation
        cell.addEventListener('animationend', () => {
            cell.classList.remove('dropping');
        }, { once: true });
    }
    
    checkWin(row, col) {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal / (top-left to bottom-right)
            [1, -1]   // diagonal \ (top-right to bottom-left)
        ];
        
        for (let [dr, dc] of directions) {
            if (this.checkDirection(row, col, dr, dc)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkDirection(row, col, dr, dc) {
        const player = this.board[row][col];
        let count = 1;
        const winningCells = [[row, col]];
        
        // Check positive direction
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && this.board[r][c] === player) {
            count++;
            winningCells.push([r, c]);
            r += dr;
            c += dc;
        }
        
        // Check negative direction
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && this.board[r][c] === player) {
            count++;
            winningCells.push([r, c]);
            r -= dr;
            c -= dc;
        }
        
        if (count >= 4) {
            this.highlightWinningCells(winningCells);
            return true;
        }
        
        return false;
    }
    
    highlightWinningCells(cells) {
        cells.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
        });
    }
    
    checkDraw() {
        return this.board.every(row => row.every(cell => cell !== 0));
    }
    
    handleWin() {
        this.gameActive = false;
        this.scores[`player${this.currentPlayer}`]++;
        this.updateScores();
        this.showMessage(`Player ${this.currentPlayer} wins!`, 'winner');
    }
    
    handleDraw() {
        this.gameActive = false;
        this.showMessage("It's a draw!", 'draw');
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
    
    updateDisplay() {
        document.getElementById('current-player-display').textContent = `Player ${this.currentPlayer}`;
        document.getElementById('current-player-display').style.color = 
            this.currentPlayer === 1 ? '#ef4444' : '#f59e0b';
    }
    
    updateScores() {
        document.getElementById('player1-score').textContent = this.scores.player1;
        document.getElementById('player2-score').textContent = this.scores.player2;
        this.saveScores();
    }
    
    saveScores() {
        localStorage.setItem('connectFourScores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const savedScores = localStorage.getItem('connectFourScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
    }
    
    resetGame() {
        this.board = Array(6).fill().map(() => Array(7).fill(0));
        this.currentPlayer = 1;
        this.gameActive = true;
        this.createBoard(); // Re-create board to clear all cells
        this.updateDisplay();
        this.hideMessage();
    }
    
    newGame() {
        this.resetGame();
        this.scores = { player1: 0, player2: 0 };
        this.updateScores();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ConnectFour();
});
