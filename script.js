// Game state
let noClickCount = 0;
let rpsPlayed = false;
let tictactoePlayed = false;
let currentPlayerName = '';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

// RPS Game State
let playerScore = 0;
let computerScore = 0;
const WINNING_SCORE = 3;

// DOM elements
const loginScreen = document.getElementById('login-screen');
const initialScreen = document.getElementById('initial-screen');
const puzzleScreen = document.getElementById('puzzle-screen');
const rpsScreen = document.getElementById('rps-screen');
const tictactoeScreen = document.getElementById('tictactoe-screen');
const finalScreen = document.getElementById('final-screen');
const endScreen = document.getElementById('end-screen');
const playerNameInput = document.getElementById('player-name');
const startGameBtn = document.getElementById('start-game');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const checkAnswersBtn = document.getElementById('check-answers');
const showHintBtn = document.getElementById('show-hint');
const resultMessage = document.getElementById('result-message');
const rpsButtons = document.querySelectorAll('.rps-btn');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const rpsRoundMessage = document.getElementById('rps-round-message');
const rpsMessage = document.getElementById('rps-message');
const rpsFinalMessage = document.getElementById('rps-final-message');
const tictactoeCells = document.querySelectorAll('.cell');
const tictactoeMessage = document.getElementById('tictactoe-message');
const finalYesBtn = document.getElementById('final-yes');
const finalFriendBtn = document.getElementById('final-friend');
const finalNoBtn = document.getElementById('final-no');
const endMessage = document.getElementById('end-message');
const historyDots = document.getElementById('history-dots');

// History elements
const historyModal = document.getElementById('history-modal');
const closeModal = document.querySelector('.close-modal');
const historyPassword = document.getElementById('history-password');
const viewHistoryBtn = document.getElementById('view-history');
const historyContent = document.getElementById('history-content');
const clearHistoryBtn = document.getElementById('clear-history');

// Audio elements
const clickSound = document.getElementById('click-sound');
const successSound = document.getElementById('success-sound');
const heartSound = document.getElementById('heart-sound');

// Correct answers for the puzzle
const correctAnswers = [73, 76, 79, 86, 69, 32, 89, 79, 85];

// History configuration
const HISTORY_PASSWORD = '000143';

// Winning combinations for Tic Tac Toe
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Sound functions
function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log('Audio play failed:', e));
}

function playSuccessSound() {
    successSound.currentTime = 0;
    successSound.play().catch(e => console.log('Audio play failed:', e));
}

function playHeartSound() {
    heartSound.currentTime = 0;
    heartSound.play().catch(e => console.log('Audio play failed:', e));
}

// Initialize game
function initializeGame() {
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Login screen
    startGameBtn.addEventListener('click', startGame);
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') startGame();
    });

    // Game screens
    yesBtn.addEventListener('click', function() {
        playHeartSound();
        trackDecision('YES');
        showScreen(puzzleScreen);
    });
    
    noBtn.addEventListener('click', function() {
        playClickSound();
        trackDecision('NO');
        handleNoClick();
    });
    
    checkAnswersBtn.addEventListener('click', checkPuzzleAnswers);
    showHintBtn.addEventListener('click', showHint);
    
    // Rock Paper Scissors
    rpsButtons.forEach(button => {
        button.addEventListener('click', function() {
            playClickSound();
            if (!rpsPlayed) {
                playRockPaperScissors(this.dataset.choice);
            }
        });
    });

    // Tic Tac Toe
    tictactoeCells.forEach(cell => {
        cell.addEventListener('click', function() {
            playClickSound();
            handleTicTacToeClick(event);
        });
    });

    // Final decision
    finalYesBtn.addEventListener('click', () => {
        playHeartSound();
        handleFinalDecision('YES');
    });
    finalFriendBtn.addEventListener('click', () => {
        playClickSound();
        handleFinalDecision('FRIEND');
    });
    finalNoBtn.addEventListener('click', () => {
        playClickSound();
        handleFinalDecision('NO');
    });

    // History
    historyDots.addEventListener('click', openHistoryModal);
    closeModal.addEventListener('click', closeHistoryModal);
    viewHistoryBtn.addEventListener('click', viewHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === historyModal) {
            closeHistoryModal();
        }
    });

    // Add click sound to all buttons
    document.querySelectorAll('button').forEach(button => {
        if (!button.hasAttribute('data-sound-bound')) {
            button.setAttribute('data-sound-bound', 'true');
            button.addEventListener('click', playClickSound);
        }
    });
}

// Start game with player name
function startGame() {
    const name = playerNameInput.value.trim();
    if (name === '') {
        alert('Please enter your name to begin the magic!');
        return;
    }
    
    currentPlayerName = name;
    showScreen(initialScreen);
}

// SIMPLE HISTORY SYSTEM - Only tracks Yes/No decisions
function trackDecision(decision) {
    const history = loadHistory();
    const entry = {
        playerName: currentPlayerName,
        decision: decision,
        timestamp: new Date().toLocaleString()
    };
    
    history.push(entry);
    localStorage.setItem('loveGameHistory', JSON.stringify(history));
}

function loadHistory() {
    return JSON.parse(localStorage.getItem('loveGameHistory') || '[]');
}

function openHistoryModal() {
    historyModal.style.display = 'block';
    historyPassword.value = '';
    historyContent.innerHTML = '<p>Enter password to see responses</p>';
}

function closeHistoryModal() {
    historyModal.style.display = 'none';
}

function viewHistory() {
    const password = historyPassword.value.trim();
    
    if (password !== HISTORY_PASSWORD) {
        historyContent.innerHTML = '<p style="color: red;">❌ Incorrect password!</p>';
        return;
    }
    
    const history = loadHistory();
    
    if (history.length === 0) {
        historyContent.innerHTML = '<p>No responses recorded yet.</p>';
        return;
    }

    // Calculate stats
    const yesCount = history.filter(item => item.decision === 'YES').length;
    const noCount = history.filter(item => item.decision === 'NO').length;
    const total = history.length;

    let historyHTML = `
        <div class="stats-container">
            <h3>Response Summary</h3>
            <div class="stats-grid">
                <div class="stat-card yes">
                    <div class="stat-number">${yesCount}</div>
                    <div class="stat-label">Said Yes 💖</div>
                </div>
                <div class="stat-card no">
                    <div class="stat-number">${noCount}</div>
                    <div class="stat-label">Said No 💔</div>
                </div>
            </div>
            <p><strong>Total Responses:</strong> ${total}</p>
        </div>
        <div style="margin-top: 20px;">
            <h4>Individual Responses:</h4>
    `;

    history.forEach((entry, index) => {
        const emoji = entry.decision === 'YES' ? '💖' : '💔';
        historyHTML += `
            <div class="history-item">
                <span style="font-size: 1.2rem;">${emoji}</span>
                <div style="flex: 1;">
                    <strong>${entry.playerName}</strong> said <strong>${entry.decision}</strong>
                    <div style="font-size: 0.8rem; color: #666;">${entry.timestamp}</div>
                </div>
            </div>
        `;
    });

    historyHTML += '</div>';
    historyContent.innerHTML = historyHTML;
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all response history? This cannot be undone.')) {
        localStorage.removeItem('loveGameHistory');
        historyContent.innerHTML = '<p style="color: green;">✅ History cleared successfully!</p>';
    }
}

// Rest of game functions (same as before)
function handleNoClick() {
    noClickCount++;
    
    noBtn.classList.add('pulse');
    setTimeout(() => {
        noBtn.classList.remove('pulse');
    }, 500);
    
    if (noClickCount < 3) {
        const buttonGroup = document.querySelector('.button-group');
        const groupRect = buttonGroup.getBoundingClientRect();
        
        const maxX = groupRect.width - noBtn.offsetWidth - 20;
        const maxY = groupRect.height - noBtn.offsetHeight - 20;
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        noBtn.style.position = 'absolute';
        noBtn.style.left = `${randomX}px`;
        noBtn.style.top = `${randomY}px`;
        
        const messages = ["Are you sure?", "Really sure?", "Let's play a game instead..."];
        
        if (noClickCount <= messages.length) {
            noBtn.textContent = messages[noClickCount - 1];
        }
    } else {
        resetRPSGame();
        showScreen(rpsScreen);
    }
}

function showScreen(screen) {
    loginScreen.classList.remove('active');
    initialScreen.classList.remove('active');
    puzzleScreen.classList.remove('active');
    rpsScreen.classList.remove('active');
    tictactoeScreen.classList.remove('active');
    finalScreen.classList.remove('active');
    endScreen.classList.remove('active');
    screen.classList.add('active');
}

function checkPuzzleAnswers() {
    let allCorrect = true;
    const userAnswers = [];
    
    for (let i = 1; i <= 9; i++) {
        const userAnswer = parseInt(document.getElementById(`q${i}`).value);
        userAnswers.push(userAnswer);
        
        if (userAnswer !== correctAnswers[i-1]) {
            allCorrect = false;
        }
    }
    
    if (allCorrect) {
        playSuccessSound();
        const hindiShayari = "तुम मिली तो जिंदगी ने नया रंग पाला,\nतेरे होने से हर मौसम खिला-खिला सा लगा।\nतेरी हँसी मेरी सबसे बड़ी जीत है;\nतेरी खुशी से मेरी दुनिया रोशन है।";
        const englishTranslation = "When I found you, life took on a new color,\nWith you in it, every season feels blooming.\nYour laughter is my biggest victory;\nMy world is illuminated by your happiness.";
        
        resultMessage.innerHTML = `
            <h3>Congratulations! You solved all the puzzles!</h3>
            <p>Your numbers: ${userAnswers.join(', ')}</p>
            <p>When decoded, these numbers spell: <strong>I LOVE YOU</strong></p>
            <div class="shayari">
                <p>${hindiShayari.replace(/\n/g, '</p><p>')}</p>
            </div>
            <div class="translation">
                ${englishTranslation.replace(/\n/g, '</p><p>')}
            </div>
        `;
    } else {
        resultMessage.innerHTML = `
            <p>Some answers are incorrect. Please check your calculations or use the hint button for help.</p>
        `;
    }
}

function showHint() {
    resultMessage.innerHTML = `
        <h3>Hint</h3>
        <p>Convert these decimal ASCII codes into text: 73, 76, 79, 86, 69, 32, 89, 79, 85</p>
        <p>You can use any AI tool or ASCII decoder to convert these numbers to letters.</p>
    `;
}

function playRockPaperScissors(playerChoice) {
    if (rpsPlayed) return;

    rpsButtons.forEach(btn => btn.disabled = true);
    rpsRoundMessage.textContent = "I am thinking...";
    rpsRoundMessage.classList.add('shake');

    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    setTimeout(() => {
        rpsRoundMessage.classList.remove('shake');
        
        let result;
        if (playerChoice === computerChoice) {
            result = "tie";
            rpsRoundMessage.textContent = `You chose ${getEmoji(playerChoice)}, I chose ${getEmoji(computerChoice)}. It's a tie!`;
            rpsRoundMessage.style.color = 'orange';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = "win";
            playerScore++;
            playerScoreElement.textContent = playerScore;
            rpsRoundMessage.textContent = `You chose ${getEmoji(playerChoice)}, I chose ${getEmoji(computerChoice)}. You win this round! 🎉`;
            rpsRoundMessage.style.color = 'green';
        } else {
            result = "lose";
            computerScore++;
            computerScoreElement.textContent = computerScore;
            rpsRoundMessage.textContent = `You chose ${getEmoji(playerChoice)}, I chose ${getEmoji(computerChoice)}. I win this round! 💥`;
            rpsRoundMessage.style.color = 'red';
        }

        if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
            rpsPlayed = true;
            
            setTimeout(() => {
                if (playerScore >= WINNING_SCORE) {
                    playSuccessSound();
                    rpsMessage.textContent = `🎉 Congratulations! You won ${playerScore}-${computerScore}! 🎉`;
                    
                    const englishMessage = "You won here… and you're allowed to.\nI never wanted to win against you anyway.\nMy only wish was to stand beside you, never opposite you.";
                    const hindiMessage = "तुम्हें यहाँ जीतने दिया... और तुम्हें अनुमति है।\nमैं तुम्हारे खिलाफ कभी जीतना नहीं चाहता था।\nमेरी एकमात्र इच्छा तुम्हारे साथ खड़े होने की थी, कभी विपरीत नहीं।";
                    
                    rpsFinalMessage.innerHTML = `
                        <div style="margin-top: 20px; padding: 20px; background-color: rgba(181, 131, 141, 0.2); border-radius: 8px;">
                            <p>"${englishMessage}"</p>
                            <div class="translation">${hindiMessage}</div>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        showScreen(tictactoeScreen);
                    }, 4000);
                } else {
                    rpsMessage.textContent = `💥 I won ${computerScore}-${playerScore}! Let's try another game!`;
                    
                    setTimeout(() => {
                        showScreen(tictactoeScreen);
                    }, 3000);
                }
            }, 2000);
        } else {
            setTimeout(() => {
                rpsButtons.forEach(btn => btn.disabled = false);
                rpsRoundMessage.style.color = '';
            }, 1500);
        }
    }, 1500);
}

function getEmoji(choice) {
    const emojis = {
        'rock': '✊',
        'paper': '✋', 
        'scissors': '✌️'
    };
    return emojis[choice] || choice;
}

function resetRPSGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreElement.textContent = '0';
    computerScoreElement.textContent = '0';
    rpsPlayed = false;
    rpsRoundMessage.textContent = '';
    rpsMessage.textContent = '';
    rpsFinalMessage.innerHTML = '';
    rpsButtons.forEach(btn => btn.disabled = false);
}

function handleTicTacToeClick(event) {
    if (tictactoePlayed || !gameActive) return;
    
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Player's move (X)
    gameBoard[cellIndex] = 'X';
    clickedCell.textContent = 'X';
    clickedCell.classList.add('x');
    
    if (checkWinner()) {
        gameActive = false;
        tictactoeMessage.textContent = 'Congratulations! You won! 🎉';
        playSuccessSound();
        setTimeout(() => showScreen(finalScreen), 2000);
        tictactoePlayed = true;
        return;
    }
    
    if (isBoardFull()) {
        gameActive = false;
        tictactoeMessage.textContent = "It's a tie! Let's try again!";
        setTimeout(resetTicTacToe, 1500);
        return;
    }
    
    setTimeout(makeAIMove, 800);
}

function makeAIMove() {
    if (!gameActive || tictactoePlayed) return;
    
    const emptyCells = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            emptyCells.push(i);
        }
    }
    
    if (emptyCells.length === 0) return;
    
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    gameBoard[randomIndex] = 'O';
    tictactoeCells[randomIndex].textContent = 'O';
    tictactoeCells[randomIndex].classList.add('o');
    
    if (checkWinner()) {
        gameActive = false;
        tictactoeMessage.textContent = "I won! But don't worry, let's try again!";
        setTimeout(resetTicTacToe, 1500);
    } else if (isBoardFull()) {
        gameActive = false;
        tictactoeMessage.textContent = "It's a tie! Let's try again!";
        setTimeout(resetTicTacToe, 1500);
    }
}

function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            tictactoeCells[a].classList.add('win');
            tictactoeCells[b].classList.add('win');
            tictactoeCells[c].classList.add('win');
            return true;
        }
    }
    return false;
}

function isBoardFull() {
    return gameBoard.every(cell => cell !== '');
}

function resetTicTacToe() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    tictactoeCells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win');
    });
    tictactoeMessage.textContent = 'Your turn! Make a move!';
}

function handleFinalDecision(decision) {
    let message = '';
    if (decision === 'YES') {
        const hindiShayari = "तुम्हें पाकर लगा जैसे खोया हुआ खज़ाना मिल गया,\nहर पल तुम्हारे साथ बिताना है अब मुझे प्यारा लगता है।\nतुम्हारी हाँ ने मेरी दुनिया रोशन कर दी,\nअब हर सुबह तुम्हारे नाम से शुरू होगी।";
        const englishTranslation = "Having you feels like I found a lost treasure,\nNow every moment spent with you feels precious.\nYour yes has illuminated my world,\nNow every morning will start with your name.";
        
        message = `
            <h2>🎉 You Made My Heart Complete! 🎉</h2>
            <p>This is the beginning of our beautiful journey together.</p>
            <div class="shayari">
                <p>${hindiShayari.replace(/\n/g, '</p><p>')}</p>
            </div>
            <div class="translation">
                ${englishTranslation.replace(/\n/g, '</p><p>')}
            </div>
            <p style="margin-top: 20px; font-size: 1.5rem;">I love you more than words can say! 💖</p>
        `;
    } else if (decision === 'FRIEND') {
        const hindiShayari = "दोस्ती भी एक खूबसूरत रिश्ता है,\nइसमें भी प्यार की बहार होती है।\nतुम्हारी दोस्ती मेरे लिए अनमोल है,\nइसे हमेशा संजोकर रखूंगा।";
        const englishTranslation = "Friendship is also a beautiful relationship,\nIt also has the spring of love.\nYour friendship is priceless to me,\nI will always cherish it.";
        
        message = `
            <h2>🤝 Friends Forever 🤝</h2>
            <p>I respect your decision. Let's build a beautiful friendship!</p>
            <div class="shayari">
                <p>${hindiShayari.replace(/\n/g, '</p><p>')}</p>
            </div>
            <div class="translation">
                ${englishTranslation.replace(/\n/g, '</p><p>')}
            </div>
            <p style="margin-top: 20px;">Thank you for being honest with me! 🌟</p>
        `;
    } else {
        const hindiShayari = "रिश्ते तो टूट जाते हैं,\nयादें रह जाती हैं,\nतुम्हारी यादें दिल में संजोकर,\nआगे बढ़ता हूं मैं।";
        const englishTranslation = "Relationships may break,\nBut memories remain,\nCherishing your memories in my heart,\nI move forward.";
        
        message = `
            <h2>💔 Goodbye, Take Care 💔</h2>
            <p>I understand and respect your decision. Thank you for being part of this journey.</p>
            <div class="shayari">
                <p>${hindiShayari.replace(/\n/g, '</p><p>')}</p>
            </div>
            <div class="translation">
                ${englishTranslation.replace(/\n/g, '</p><p>')}
            </div>
            <p style="margin-top: 20px;">I'll always cherish the moments we shared. Be happy! 🌈</p>
        `;
    }
    
    endMessage.innerHTML = message;
    showScreen(endScreen);
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);