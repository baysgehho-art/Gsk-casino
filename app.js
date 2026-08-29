// GSK | CASINO
let balance = 100;
let betAmount = 1;
let isSpinning = false;
let autoSpinMode = false;
let autoSpinCount = 0;
let jackpot = 1000;

const symbols = ['💎', '7️⃣', '🍒', '⭐', '🔔', '🍋', '🔥', '💰'];
const MIN_BET = 1;
const MAX_BET = 100;

function updateDisplay() {
    document.getElementById('balance').textContent = balance.toFixed(2);
    document.getElementById('betAmount').textContent = betAmount;
    document.getElementById('jackpot').textContent = jackpot.toFixed(0);
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function generateResult() {
    const grid = [];
    for (let col = 0; col < 5; col++) {
        const column = [];
        for (let row = 0; row < 3; row++) {
            column.push(getRandomSymbol());
        }
        grid.push(column);
    }
    return grid;
}

function checkWin(grid) {
    const winLines = [];
    let totalWin = 0;
    const multipliers = { 3: 5, 4: 10, 5: 50 };
    
    for (let row = 0; row < 3; row++) {
        const first = grid[0][row];
        let count = 1;
        let cells = [[0, row]];
        
        for (let col = 1; col < 5; col++) {
            if (grid[col][row] === first) {
                count++;
                cells.push([col, row]);
            } else {
                break;
            }
        }
        
        if (count >= 3) {
            const win = betAmount * multipliers[count];
            totalWin += win;
            winLines.push({ cells, win });
        }
    }
    
    return { totalWin, winLines };
}

function spin() {
    if (isSpinning) return;
    if (balance < betAmount) {
        showResult('❌ Недостаточно средств!', false);
        return;
    }
    
    isSpinning = true;
    balance -= betAmount;
    updateDisplay();
    
    const button = document.getElementById('spinButton');
    button.disabled = true;
    button.textContent = '🎰 КРУТИМ...';
    
    const cells = document.querySelectorAll('.reel-cell');
    cells.forEach(cell => {
        cell.classList.remove('winning');
        cell.style.animation = 'pulse 0.15s infinite';
    });
    
    setTimeout(() => {
        const grid = generateResult();
        const { totalWin, winLines } = checkWin(grid);
        
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const cell = document.getElementById(`cell-${col}-${row}`);
                cell.textContent = grid[col][row];
                cell.style.animation = 'none';
            }
        }
        
        winLines.forEach(line => {
            line.cells.forEach(([col, row]) => {
                const cell = document.getElementById(`cell-${col}-${row}`);
                cell.classList.add('winning');
            });
        });
        
        if (totalWin > 0) {
            balance += totalWin;
            jackpot += betAmount * 0.1;
            showResult(`🎉 ВЫИГРЫШ: ${totalWin} USDT! 🎉`, true);
            createConfetti();
        } else {
            showResult('😢 Не повезло! Попробуй ещё!', false);
        }
        
        addHistory(grid, totalWin);
        updateDisplay();
        isSpinning = false;
        button.disabled = false;
        button.textContent = '🎰 КРУТИТЬ';
        
        if (autoSpinMode && autoSpinCount > 0) {
            autoSpinCount--;
            if (autoSpinCount === 0) {
                autoSpinMode = false;
                document.getElementById('autoSpinButton').textContent = '🔄 АВТО';
            }
            setTimeout(spin, 500);
        }
    }, 800);
}

function showResult(text, isWin) {
    const resultElement = document.getElementById('result');
    resultElement.textContent = text;
    resultElement.className = isWin ? 'result win' : 'result lose';
}

function createConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#ffd700', '#ff00ff', '#00ff00', '#ff4444', '#00ffff', '#ffaa00'];
    
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(piece);
        
        setTimeout(() => {
            piece.remove();
        }, 3000);
    }
}

function addHistory(grid, win) {
    const historyElement = document.getElementById('history');
    const item = document.createElement('div');
    const flatGrid = grid.flat().join(' ');
    item.className = win > 0 ? 'history-item win' : 'history-item lose';
    item.textContent = flatGrid + ' — ' + (win > 0 ? '+' + win + ' USDT' : 'Проигрыш');
    historyElement.prepend(item);
    
    while (historyElement.children.length > 30) {
        historyElement.removeChild(historyElement.lastChild);
    }
}

function changeBet(delta) {
    if (isSpinning) return;
    betAmount = Math.max(MIN_BET, Math.min(MAX_BET, betAmount + delta));
    updateDisplay();
}

function setMaxBet() {
    if (isSpinning) return;
    betAmount = Math.min(balance, MAX_BET);
    updateDisplay();
}

function toggleAutoSpin() {
    if (autoSpinMode) {
        autoSpinMode = false;
        autoSpinCount = 0;
        document.getElementById('autoSpinButton').textContent = '🔄 АВТО';
        spin();
    } else {
        autoSpinMode = true;
        autoSpinCount = 10;
        document.getElementById('autoSpinButton').textContent = '⏹ СТОП';
    }
}

document.getElementById('spinButton').addEventListener('click', spin);
document.getElementById('autoSpinButton').addEventListener('click', toggleAutoSpin);
document.getElementById('betMinus').addEventListener('click', () => changeBet(-1));
document.getElementById('betPlus').addEventListener('click', () => changeBet(1));
document.getElementById('maxBetButton').addEventListener('click', setMaxBet);

updateDisplay();
