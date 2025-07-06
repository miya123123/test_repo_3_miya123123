class ColorFlowGame {
    constructor() {
        this.boardSize = 7;
        this.board = [];
        this.level = 1;
        this.moves = 10;
        this.targetColor = null;
        this.colors = {
            red: { r: 255, g: 100, b: 100 },
            blue: { r: 100, g: 150, b: 255 },
            green: { r: 100, g: 255, b: 100 },
            yellow: { r: 255, g: 255, b: 100 },
            purple: { r: 200, g: 100, b: 255 },
            orange: { r: 255, g: 165, b: 0 },
            pink: { r: 255, g: 192, b: 203 },
            cyan: { r: 0, g: 255, b: 255 }
        };
        this.colorNames = Object.keys(this.colors);
        this.sources = [];
        this.gameRunning = false;
        this.isFlowing = false;
        this.selectedSource = null; // 選択された色源泉
        this.init();
    }

    init() {
        this.createBoard();
        this.generateLevel();
        this.bindEvents();
        this.updateUI();
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        this.board = Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill().map(() => ({
                color: this.getRandomColor(),
                element: null,
                isSource: false
            }))
        );

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                tile.style.backgroundColor = this.rgbToString(this.board[row][col].color);
                
                tile.addEventListener('click', () => this.handleTileClick(row, col));
                
                gameBoard.appendChild(tile);
                this.board[row][col].element = tile;
            }
        }
    }

    generateLevel() {
        this.gameRunning = true;
        this.isFlowing = false;
        this.selectedSource = null;
        this.moves = Math.max(5, 15 - this.level);
        this.sources = [];
        
        // レベルに応じて色源泉の数を決定
        const sourceCount = Math.min(3 + Math.floor(this.level / 2), 6);
        
        // ランダムに色源泉を配置
        for (let i = 0; i < sourceCount; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * this.boardSize);
                col = Math.floor(Math.random() * this.boardSize);
            } while (this.board[row][col].isSource);
            
            this.board[row][col].isSource = true;
            this.board[row][col].element.classList.add('source');
            this.sources.push({ row, col });
        }
        
        // 目標色を設定
        this.targetColor = this.getRandomColor();
        
        // ボードの色をランダムに設定
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.board[row][col].isSource) {
                    this.board[row][col].color = this.getRandomColor();
                    this.board[row][col].element.style.backgroundColor = 
                        this.rgbToString(this.board[row][col].color);
                }
            }
        }
        
        this.updateUI();
    }

    getRandomColor() {
        const colorName = this.colorNames[Math.floor(Math.random() * this.colorNames.length)];
        return { ...this.colors[colorName] };
    }

    rgbToString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    mixColors(color1, color2) {
        return {
            r: Math.floor((color1.r + color2.r) / 2),
            g: Math.floor((color1.g + color2.g) / 2),
            b: Math.floor((color1.b + color2.b) / 2)
        };
    }

    colorsEqual(color1, color2) {
        const threshold = 30;
        return Math.abs(color1.r - color2.r) < threshold &&
               Math.abs(color1.g - color2.g) < threshold &&
               Math.abs(color1.b - color2.b) < threshold;
    }

    handleTileClick(row, col) {
        if (!this.gameRunning || this.moves <= 0 || this.isFlowing) return;
        
        const tile = this.board[row][col];
        
        // 第1段階: 色源泉を選択
        if (this.selectedSource === null) {
            if (tile.isSource) {
                this.selectedSource = { row, col };
                this.updateSourceSelection();
            }
            return;
        }
        
        // 第2段階: 選択された色源泉から色を流す
        if (this.selectedSource) {
            // 同じ色源泉をクリックした場合は選択解除
            if (this.selectedSource.row === row && this.selectedSource.col === col) {
                this.selectedSource = null;
                this.updateSourceSelection();
                return;
            }
            
            // 選択された色源泉から指定されたタイルに色を流す
            this.isFlowing = true;
            this.flowColorToTarget(this.selectedSource.row, this.selectedSource.col, row, col);
            this.selectedSource = null;
            this.updateSourceSelection();
            this.moves--;
            this.updateUI();
            
            // Wait for flow animation to complete before checking win condition
            setTimeout(() => {
                this.isFlowing = false;
                if (this.checkWinCondition()) {
                    this.handleWin();
                } else if (this.moves <= 0) {
                    this.handleGameOver();
                }
            }, 2000);
        }
    }

    flowColor(sourceRow, sourceCol) {
        const sourceColor = this.board[sourceRow][sourceCol].color;
        const visited = new Set();
        const levelQueues = [[]];
        
        // Start with the source tile
        levelQueues[0].push({ row: sourceRow, col: sourceCol });
        visited.add(`${sourceRow},${sourceCol}`);
        
        this.processFlowLevel(levelQueues, 0, sourceColor, visited);
    }
    
    processFlowLevel(levelQueues, currentLevel, sourceColor, visited) {
        if (currentLevel >= levelQueues.length || currentLevel > 3) return;
        
        const currentQueue = levelQueues[currentLevel];
        if (currentQueue.length === 0) return;
        
        // Process all tiles in the current level
        for (const { row, col } of currentQueue) {
            // Update color
            const currentColor = this.board[row][col].color;
            const newColor = this.mixColors(currentColor, sourceColor);
            
            this.board[row][col].color = newColor;
            this.board[row][col].element.style.backgroundColor = this.rgbToString(newColor);
            this.board[row][col].element.classList.add('flowing');
            
            // Remove flowing class after animation
            setTimeout(() => {
                if (this.board[row][col].element) {
                    this.board[row][col].element.classList.remove('flowing');
                }
            }, 600);
            
            // Add adjacent tiles to the next level
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                const key = `${newRow},${newCol}`;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize &&
                    !visited.has(key)) {
                    
                    visited.add(key);
                    
                    // Create next level queue if it doesn't exist
                    if (!levelQueues[currentLevel + 1]) {
                        levelQueues[currentLevel + 1] = [];
                    }
                    
                    levelQueues[currentLevel + 1].push({ row: newRow, col: newCol });
                }
            }
        }
        
        // Process next level after a delay
        setTimeout(() => {
            this.processFlowLevel(levelQueues, currentLevel + 1, sourceColor, visited);
        }, 300);
    }

    updateSourceSelection() {
        // すべての色源泉の選択状態をクリア
        for (const { row, col } of this.sources) {
            this.board[row][col].element.classList.remove('selected');
        }
        
        // 選択された色源泉にselectedクラスを追加
        if (this.selectedSource) {
            const { row, col } = this.selectedSource;
            this.board[row][col].element.classList.add('selected');
        }
    }

    flowColorToTarget(sourceRow, sourceCol, targetRow, targetCol) {
        const sourceColor = this.board[sourceRow][sourceCol].color;
        
        // 直接指定されたタイルに色を流す
        const targetColor = this.board[targetRow][targetCol].color;
        const newColor = this.mixColors(targetColor, sourceColor);
        
        this.board[targetRow][targetCol].color = newColor;
        this.board[targetRow][targetCol].element.style.backgroundColor = this.rgbToString(newColor);
        this.board[targetRow][targetCol].element.classList.add('flowing');
        
        // Remove flowing class after animation
        setTimeout(() => {
            if (this.board[targetRow][targetCol].element) {
                this.board[targetRow][targetCol].element.classList.remove('flowing');
            }
        }, 600);
        
        // 隣接するタイルにも色を流す（1レベルのみ）
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const newRow = targetRow + dr;
            const newCol = targetCol + dc;
            
            if (newRow >= 0 && newRow < this.boardSize && 
                newCol >= 0 && newCol < this.boardSize) {
                
                const adjacentColor = this.board[newRow][newCol].color;
                const adjacentNewColor = this.mixColors(adjacentColor, sourceColor);
                
                setTimeout(() => {
                    this.board[newRow][newCol].color = adjacentNewColor;
                    this.board[newRow][newCol].element.style.backgroundColor = this.rgbToString(adjacentNewColor);
                    this.board[newRow][newCol].element.classList.add('flowing');
                    
                    setTimeout(() => {
                        if (this.board[newRow][newCol].element) {
                            this.board[newRow][newCol].element.classList.remove('flowing');
                        }
                    }, 600);
                }, 200);
            }
        }
    }

    checkWinCondition() {
        let targetTiles = 0;
        let totalTiles = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.board[row][col].isSource) {
                    totalTiles++;
                    if (this.colorsEqual(this.board[row][col].color, this.targetColor)) {
                        targetTiles++;
                    }
                }
            }
        }
        
        return targetTiles / totalTiles >= 0.8; // 80%以上が目標色
    }

    handleWin() {
        this.gameRunning = false;
        document.getElementById('successMessage').textContent = 
            `レベル ${this.level} をクリア！残り手数: ${this.moves}`;
        document.getElementById('successModal').style.display = 'block';
        document.getElementById('nextLevelBtn').style.display = 'inline-block';
    }

    handleGameOver() {
        this.gameRunning = false;
        document.getElementById('gameOverModal').style.display = 'block';
    }

    nextLevel() {
        this.level++;
        this.generateLevel();
        document.getElementById('successModal').style.display = 'none';
        document.getElementById('nextLevelBtn').style.display = 'none';
    }

    reset() {
        this.isFlowing = false;
        this.selectedSource = null;
        this.generateLevel();
        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('successModal').style.display = 'none';
        document.getElementById('nextLevelBtn').style.display = 'none';
    }

    showHint() {
        if (!this.gameRunning) return;
        
        // 最適な色源泉を光らせる
        const bestSource = this.sources[Math.floor(Math.random() * this.sources.length)];
        const element = this.board[bestSource.row][bestSource.col].element;
        
        // 一時的に超強力なグロー効果を追加
        element.classList.add('hint-glow');
        
        // ヒントメッセージを表示
        const hint = document.createElement('div');
        hint.textContent = 'キラキラ✨と光っている色源泉をクリックしてみてください！';
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 20px 30px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: bold;
            z-index: 999;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 4s ease-in-out;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        `;
        
        document.body.appendChild(hint);
        
        setTimeout(() => {
            element.classList.remove('hint-glow');
            hint.remove();
        }, 4000);
    }

    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('target-color').style.backgroundColor = 
            this.rgbToString(this.targetColor);
    }

    bindEvents() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('restartBtn').addEventListener('click', () => this.reset());
        document.getElementById('continueBtn').addEventListener('click', () => this.nextLevel());
        
        // モーダルを閉じる
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
}

// CSSアニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// ゲームを開始
document.addEventListener('DOMContentLoaded', () => {
    new ColorFlowGame();
});