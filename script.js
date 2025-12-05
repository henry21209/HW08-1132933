const boardE1 = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const btnReset = document.getElementById('reset');
const btnResetAll = document.getElementById('reset-all');
const turnEl = document.getElementById('turn'); 
const stateEl = document.getElementById('state');
const winLineEl = document.getElementById('win-line'); // 取得勝利線元素
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

let board;
let current;
let active;
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6] // diags
];

function init() {
    board = Array(9).fill('');
    current = 'X';
    active = true;

    cells.forEach(c => {
        c.textContent = '';
        c.className = 'cell';
        c.disabled = false;
    });

    // 重設並隱藏勝利線
    winLineEl.style.cssText = '';
    winLineEl.classList.remove('show');
    
    turnEl.textContent = current;
    turnEl.classList.remove('is-o');
    turnEl.classList.add('is-x'); 
    
    stateEl.textContent = '請開始遊戲';
    updateScoreboard(); 
}

function place(idx) {
    if (!active || board[idx]) return; 

    board[idx] = current;
    const cell = cells[idx];
    cell.textContent = current;
    cell.classList.add(current.toLowerCase());

    const result = evaluate();

    if (result.finished) {
        endGame(result);
    } else {
        switchTurn();
    }
}

function switchTurn() {
    current = current === 'X' ? 'O' : 'X';
    turnEl.textContent = current;
    
    turnEl.classList.toggle('is-x', current === 'X');
    turnEl.classList.toggle('is-o', current === 'O');
}

function evaluate() {
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { finished: true, winner: board[a], line };
        }
    }
    if (board.every(v => v)) return { finished: true, winner: null }; 

    return { finished: false };
}

// 根據勝利線類型計算 CSS 屬性
function drawWinLine(line) {
    const [start] = line;
    const startRow = Math.floor(start / 3);
    const startCol = start % 3;
    
    // 線條粗細 (與 CSS 保持一致)
    const LINE_THICKNESS = '12px'; 
    
    let style = {
        width: '100%',
        height: LINE_THICKNESS,
        top: '50%',
        left: '0',
        transform: 'translateY(-50%)'
    };
    
    // 計算百分比位置 (單格為 33.33%，中心為 16.66% 或 50%)
    if (startCol === line[1] % 3) {
        // 垂直 (Cols)
        style.width = LINE_THICKNESS;
        style.height = 'calc(100% - 24px)'; 
        style.top = '12px';
        style.left = `${(startCol * 33.33) + 16.66}%`;
        style.transform = 'translateX(-50%)';
    } else if (startRow === Math.floor(line[1] / 3)) {
        // 水平 (Rows)
        style.width = 'calc(100% - 24px)'; 
        style.height = LINE_THICKNESS;
        style.top = `${(startRow * 33.33) + 16.66}%`;
        style.left = '12px';
        style.transform = 'translateY(-50%)';
    } else if (start === 0 && line[2] === 8) {
        // 對角線 (從左上到右下: [0, 4, 8])
        style.width = '141.42%'; 
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%) rotate(45deg)';
    } else if (start === 2 && line[2] === 6) {
        // 對角線 (從右上到左下: [2, 4, 6])
        style.width = '141.42%';
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%) rotate(-45deg)';
    }

    // 應用 CSS 樣式
    winLineEl.style.width = style.width;
    winLineEl.style.height = style.height;
    winLineEl.style.top = style.top;
    winLineEl.style.left = style.left;
    winLineEl.style.transform = style.transform;
    
    // 延遲後顯示線條
    setTimeout(() => {
        winLineEl.classList.add('show');
    }, 100);
}


function endGame({ winner, line }) {
    active = false;
    
    if (winner) {
        stateEl.textContent = `${winner} 勝利！🎉`;
        if (line) {
            line.forEach(i => cells[i].classList.add('win')); 
            drawWinLine(line); // 繪製勝利線
        }
        if (winner === 'X') scoreX++; else scoreO++;
    } else {
        stateEl.textContent = '平手 🤝';
        scoreDraw++;
    }

    updateScoreboard();
    cells.forEach(c => c.disabled = true); 
}

function updateScoreboard() {
    scoreXEl.textContent = scoreX;
    scoreOEl.textContent = scoreO;
    scoreDrawEl.textContent = scoreDraw;
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = Number(cell.getAttribute('data-idx')); 
        place(idx);
    });
});

btnReset.addEventListener('click', init);

btnResetAll.addEventListener('click', () => {
    scoreX = scoreO = scoreDraw = 0;
    updateScoreboard();
    init();
});

init();