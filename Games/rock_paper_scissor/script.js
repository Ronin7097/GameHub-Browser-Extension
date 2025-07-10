document.addEventListener('DOMContentLoaded', () => {
    const userScoreEl = document.getElementById('user-score');
    const cpuScoreEl = document.getElementById('cpu-score');
    const statusMessageEl = document.getElementById('status-message');
    const playerChoicesEl = document.getElementById('player-choices');
    const cpuChoiceDisplayEl = document.getElementById('cpu-choice-display');

    let userScore = 0;
    let cpuScore = 0;

    const choices = [
        { name: 'rock', icon: 'gem-solid.svg' },
        { name: 'paper', icon: 'sheet-plastic-solid.svg' },
        { name: 'scissors', icon: 'scissors-solid.svg' }
    ];

    playerChoicesEl.addEventListener('click', (e) => {
        const playerChoiceBtn = e.target.closest('.choice-btn');
        if (!playerChoiceBtn) return;

        const playerChoice = parseInt(playerChoiceBtn.dataset.choice);
        const cpuChoice = Math.floor(Math.random() * 3);

        updateCpuChoiceIcon(cpuChoice);
        determineWinner(playerChoice, cpuChoice);
    });

    function determineWinner(player, cpu) {
        if (player === cpu) {
            statusMessageEl.textContent = "It's a draw!";
            statusMessageEl.style.color = '#4a4a4a';
        } else if ((player === 0 && cpu === 2) || (player === 1 && cpu === 0) || (player === 2 && cpu === 1)) {
            userScore++;
            userScoreEl.textContent = userScore;
            statusMessageEl.textContent = 'You win!';
            statusMessageEl.style.color = '#28a745';
            confetti.start(2000, 50, 100);
        } else {
            cpuScore++;
            cpuScoreEl.textContent = cpuScore;
            statusMessageEl.textContent = 'You lose!';
            statusMessageEl.style.color = '#dc3545';
        }
    }

    function updateCpuChoiceIcon(choice) {
        cpuChoiceDisplayEl.innerHTML = `<img src="${choices[choice].icon}" alt="${choices[choice].name}">`;
        cpuChoiceDisplayEl.style.color = '#4a4a4a';
    }
});
