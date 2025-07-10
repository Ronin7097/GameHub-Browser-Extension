document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('reset-button');
    const statusMessage = document.getElementById('status-message');
    const xScoreSpan = document.getElementById('x-score');
    const oScoreSpan = document.getElementById('o-score');
    const drawScoreSpan = document.getElementById('draw-score');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let xScore = 0;
    let oScore = 0;
    let drawScore = 0;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        if (board[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }

        board[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer === 'X' ? 'x-mark' : 'o-mark');

        checkResult();
    }

    function checkResult() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let pos1 = board[winCondition[0]];
            let pos2 = board[winCondition[1]];
            let pos3 = board[winCondition[2]];

            if (pos1 === '' || pos2 === '' || pos3 === '') {
                continue;
            }
            if (pos1 === pos2 && pos2 === pos3) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusMessage.textContent = `Player ${currentPlayer} has won!`;
            isGameActive = false;
            if (currentPlayer === 'X') {
                xScore++;
                xScoreSpan.textContent = xScore;
            } else {
                oScore++;
                oScoreSpan.textContent = oScore;
            }
            return;
        }

        if (!board.includes('')) {
            statusMessage.textContent = "'It's a draw!'";
            isGameActive = false;
            drawScore++;
            drawScoreSpan.textContent = drawScore;
            return;
        }

        changePlayer();
    }

    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusMessage.textContent = `It's ${currentPlayer}'s turn`;
    }

    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        statusMessage.textContent = `It's ${currentPlayer}'s turn`;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x-mark', 'o-mark');
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', resetGame);

    statusMessage.textContent = `It's ${currentPlayer}'s turn`;
});