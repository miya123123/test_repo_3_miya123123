class ElementalFighter {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, ended
        this.round = 1;
        this.timer = 60;
        this.timerInterval = null;
        
        // プレイヤーデータ
        this.players = {
            1: {
                health: 100,
                maxHealth: 100,
                position: { x: 100, y: 350 },
                velocity: { x: 0, y: 0 },
                facing: 'right',
                currentElement: 'fire',
                combo: 0,
                specialGauge: 0,
                isAttacking: false,
                isBlocking: false,
                isMoving: false,
                lastAttackTime: 0,
                element: null,
                invulnerable: false
            },
            2: {
                health: 100,
                maxHealth: 100,
                position: { x: 900, y: 350 },
                velocity: { x: 0, y: 0 },
                facing: 'left',
                currentElement: 'water',
                combo: 0,
                specialGauge: 0,
                isAttacking: false,
                isBlocking: false,
                isMoving: false,
                lastAttackTime: 0,
                element: null,
                invulnerable: false
            }
        };
        
        // 元素データ
        this.elements = {
            fire: {
                damage: 20,
                speed: 1.2,
                effect: 'burn',
                weakTo: 'water',
                strongTo: 'earth',
                color: '#ff6b6b',
                emoji: '🔥'
            },
            water: {
                damage: 15,
                speed: 1.0,
                effect: 'slow',
                weakTo: 'earth',
                strongTo: 'fire',
                color: '#4ecdc4',
                emoji: '💧'
            },
            earth: {
                damage: 25,
                speed: 0.8,
                effect: 'stun',
                weakTo: 'air',
                strongTo: 'water',
                color: '#2ed573',
                emoji: '🌍'
            },
            air: {
                damage: 18,
                speed: 1.4,
                effect: 'knockback',
                weakTo: 'fire',
                strongTo: 'earth',
                color: '#dcedc8',
                emoji: '💨'
            }
        };
        
        // 入力管理
        this.keys = {};
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateUI();
        this.showModal('ゲーム開始', '4つの元素を駆使して戦いましょう！', 'スタート');
    }
    
    bindEvents() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key.toLowerCase());
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // ボタンイベント
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('modalBtn').addEventListener('click', () => {
            this.hideModal();
            if (this.gameState === 'menu') {
                this.startGame();
            }
        });
        
        // 元素オーブクリック
        document.querySelectorAll('.orb').forEach(orb => {
            orb.addEventListener('click', (e) => {
                const element = e.target.dataset.element;
                const player = e.target.closest('.fighter').id === 'player1' ? 1 : 2;
                this.switchElement(player, element);
            });
        });
        
        // モーダルクリック
        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameModal') {
                this.hideModal();
            }
        });
    }
    
    handleKeyPress(key) {
        if (this.gameState !== 'playing') return;
        
        const now = Date.now();
        
        // プレイヤー1の操作
        if (key === 'w' && now - this.players[1].lastAttackTime > 300) {
            this.attack(1);
        }
        if (key === 's') {
            this.players[1].isBlocking = true;
        }
        if (key === '1') this.switchElement(1, 'fire');
        if (key === '2') this.switchElement(1, 'water');
        if (key === '3') this.switchElement(1, 'earth');
        if (key === '4') this.switchElement(1, 'air');
        
        // プレイヤー2の操作
        if (key === 'arrowup' && now - this.players[2].lastAttackTime > 300) {
            this.attack(2);
        }
        if (key === 'arrowdown') {
            this.players[2].isBlocking = true;
        }
        if (key === '7') this.switchElement(2, 'fire');
        if (key === '8') this.switchElement(2, 'water');
        if (key === '9') this.switchElement(2, 'earth');
        if (key === '0') this.switchElement(2, 'air');
    }
    
    startGame() {
        this.gameState = 'playing';
        this.timer = 60;
        this.round = 1;
        this.resetPlayers();
        this.startTimer();
        this.gameLoop = setInterval(() => {
            this.update();
        }, 1000 / 60); // 60 FPS
        
        document.getElementById('startBtn').textContent = '再スタート';
        this.updateUI();
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.stopTimer();
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.resetPlayers();
        this.updateUI();
        document.getElementById('startBtn').textContent = 'ゲーム開始';
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimer();
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = null;
            }
            this.showModal('一時停止', 'ゲームを一時停止中です', '再開');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
            this.gameLoop = setInterval(() => {
                this.update();
            }, 1000 / 60);
            this.hideModal();
        }
    }
    
    resetPlayers() {
        this.players[1].health = this.players[1].maxHealth;
        this.players[1].position = { x: 100, y: 350 };
        this.players[1].combo = 0;
        this.players[1].specialGauge = 0;
        this.players[1].facing = 'right';
        
        this.players[2].health = this.players[2].maxHealth;
        this.players[2].position = { x: 900, y: 350 };
        this.players[2].combo = 0;
        this.players[2].specialGauge = 0;
        this.players[2].facing = 'left';
        
        // プレイヤー位置をリセット
        this.updatePlayerPositions();
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleMovement();
        this.updateCombos();
        this.checkCollisions();
        this.updatePlayerPositions();
        this.cleanupEffects();
        
        // 勝敗判定
        if (this.players[1].health <= 0 || this.players[2].health <= 0) {
            this.endRound();
        }
        
        if (this.timer <= 0) {
            this.endRound();
        }
    }
    
    handleMovement() {
        // プレイヤー1の移動
        if (this.keys['a'] && !this.players[1].isAttacking) {
            this.players[1].position.x = Math.max(50, this.players[1].position.x - 3);
            this.players[1].facing = 'left';
            this.players[1].isMoving = true;
        } else if (this.keys['d'] && !this.players[1].isAttacking) {
            this.players[1].position.x = Math.min(1050, this.players[1].position.x + 3);
            this.players[1].facing = 'right';
            this.players[1].isMoving = true;
        } else {
            this.players[1].isMoving = false;
        }
        
        // プレイヤー2の移動
        if (this.keys['arrowleft'] && !this.players[2].isAttacking) {
            this.players[2].position.x = Math.max(50, this.players[2].position.x - 3);
            this.players[2].facing = 'left';
            this.players[2].isMoving = true;
        } else if (this.keys['arrowright'] && !this.players[2].isAttacking) {
            this.players[2].position.x = Math.min(1050, this.players[2].position.x + 3);
            this.players[2].facing = 'right';
            this.players[2].isMoving = true;
        } else {
            this.players[2].isMoving = false;
        }
        
        // ブロック状態の更新
        if (!this.keys['s']) {
            this.players[1].isBlocking = false;
        }
        if (!this.keys['arrowdown']) {
            this.players[2].isBlocking = false;
        }
    }
    
    switchElement(player, element) {
        this.players[player].currentElement = element;
        
        // 元素オーブの表示を更新
        const playerElement = document.getElementById(`player${player}`);
        const orbs = playerElement.querySelectorAll('.orb');
        orbs.forEach(orb => {
            orb.classList.remove('active');
            if (orb.dataset.element === element) {
                orb.classList.add('active');
            }
        });
        
        // 元素切り替えエフェクト
        this.createSwitchEffect(player, element);
    }
    
    attack(player) {
        const attacker = this.players[player];
        const defender = this.players[player === 1 ? 2 : 1];
        
        if (attacker.isAttacking) return;
        
        attacker.isAttacking = true;
        attacker.lastAttackTime = Date.now();
        
        // 攻撃範囲の判定
        const distance = Math.abs(attacker.position.x - defender.position.x);
        const attackRange = 120;
        
        if (distance <= attackRange) {
            // ヒット判定
            if (!defender.isBlocking && !defender.invulnerable) {
                this.dealDamage(player, attacker.currentElement);
            } else if (defender.isBlocking) {
                this.createBlockEffect(player === 1 ? 2 : 1);
            }
        }
        
        // 攻撃エフェクトを作成
        this.createAttackEffect(player, attacker.currentElement);
        
        // 攻撃アニメーション終了
        setTimeout(() => {
            attacker.isAttacking = false;
        }, 300);
    }
    
    dealDamage(attackerPlayer, element) {
        const attacker = this.players[attackerPlayer];
        const defenderPlayer = attackerPlayer === 1 ? 2 : 1;
        const defender = this.players[defenderPlayer];
        
        let damage = this.elements[element].damage;
        
        // 元素相性による補正
        if (this.elements[element].strongTo === defender.currentElement) {
            damage *= 1.5; // 有利な相性
        } else if (this.elements[element].weakTo === defender.currentElement) {
            damage *= 0.7; // 不利な相性
        }
        
        // コンボ補正
        if (attacker.combo > 0) {
            damage *= (1 + attacker.combo * 0.1);
        }
        
        // ダメージ適用
        defender.health = Math.max(0, defender.health - Math.floor(damage));
        
        // コンボ増加
        attacker.combo++;
        
        // 必殺技ゲージ増加
        attacker.specialGauge = Math.min(100, attacker.specialGauge + 15);
        
        // 被ダメージエフェクト
        this.createDamageEffect(defenderPlayer, damage);
        
        // 元素効果の適用
        this.applyElementEffect(defenderPlayer, element);
        
        // 無敵時間
        defender.invulnerable = true;
        setTimeout(() => {
            defender.invulnerable = false;
        }, 200);
        
        this.updateUI();
    }
    
    applyElementEffect(player, element) {
        const target = this.players[player];
        
        switch (element) {
            case 'fire':
                // 燃焼効果：継続ダメージ
                target.element = 'burn';
                let burnCount = 0;
                const burnInterval = setInterval(() => {
                    if (burnCount >= 3) {
                        clearInterval(burnInterval);
                        target.element = null;
                        return;
                    }
                    target.health = Math.max(0, target.health - 3);
                    this.createElementEffect(player, 'fire');
                    burnCount++;
                    this.updateUI();
                }, 1000);
                break;
                
            case 'water':
                // 減速効果
                target.element = 'slow';
                setTimeout(() => {
                    target.element = null;
                }, 3000);
                break;
                
            case 'earth':
                // スタン効果
                target.element = 'stun';
                setTimeout(() => {
                    target.element = null;
                }, 1500);
                break;
                
            case 'air':
                // ノックバック効果
                const knockbackDistance = 30;
                if (target.facing === 'right') {
                    target.position.x = Math.max(50, target.position.x - knockbackDistance);
                } else {
                    target.position.x = Math.min(1050, target.position.x + knockbackDistance);
                }
                break;
        }
    }
    
    updateCombos() {
        // コンボのタイムアウト
        const now = Date.now();
        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            if (now - player.lastAttackTime > 2000) {
                player.combo = 0;
            }
        });
    }
    
    createAttackEffect(player, element) {
        const effectsLayer = document.getElementById('effects');
        const effect = document.createElement('div');
        effect.className = `attack-effect ${element}-attack`;
        
        const playerPos = this.players[player].position;
        const offsetX = this.players[player].facing === 'right' ? 60 : -60;
        
        effect.style.left = `${playerPos.x + offsetX}px`;
        effect.style.top = `${playerPos.y - 30}px`;
        
        effectsLayer.appendChild(effect);
        
        // エフェクトを自動削除
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 500);
    }
    
    createDamageEffect(player, damage) {
        const fighterElement = document.getElementById(`player${player}`);
        fighterElement.classList.add('damage-effect');
        
        // ダメージ数値を表示
        const damageNumber = document.createElement('div');
        damageNumber.textContent = `-${Math.floor(damage)}`;
        damageNumber.style.cssText = `
            position: absolute;
            color: #ff4757;
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            animation: damageFloat 1s ease-out forwards;
            z-index: 100;
        `;
        
        const playerPos = this.players[player].position;
        damageNumber.style.left = `${playerPos.x + 20}px`;
        damageNumber.style.top = `${playerPos.y - 50}px`;
        
        document.getElementById('effects').appendChild(damageNumber);
        
        setTimeout(() => {
            fighterElement.classList.remove('damage-effect');
            if (damageNumber.parentNode) {
                damageNumber.parentNode.removeChild(damageNumber);
            }
        }, 1000);
    }
    
    createBlockEffect(player) {
        const fighterElement = document.getElementById(`player${player}`);
        const blockEffect = document.createElement('div');
        blockEffect.textContent = 'ブロック!';
        blockEffect.style.cssText = `
            position: absolute;
            color: #ffd700;
            font-size: 18px;
            font-weight: bold;
            pointer-events: none;
            animation: blockFloat 1s ease-out forwards;
            z-index: 100;
        `;
        
        const playerPos = this.players[player].position;
        blockEffect.style.left = `${playerPos.x + 10}px`;
        blockEffect.style.top = `${playerPos.y - 30}px`;
        
        document.getElementById('effects').appendChild(blockEffect);
        
        setTimeout(() => {
            if (blockEffect.parentNode) {
                blockEffect.parentNode.removeChild(blockEffect);
            }
        }, 1000);
    }
    
    createSwitchEffect(player, element) {
        const fighterElement = document.getElementById(`player${player}`);
        const switchEffect = document.createElement('div');
        switchEffect.textContent = this.elements[element].emoji;
        switchEffect.style.cssText = `
            position: absolute;
            font-size: 30px;
            pointer-events: none;
            animation: switchFloat 1s ease-out forwards;
            z-index: 100;
        `;
        
        const playerPos = this.players[player].position;
        switchEffect.style.left = `${playerPos.x + 25}px`;
        switchEffect.style.top = `${playerPos.y - 20}px`;
        
        document.getElementById('effects').appendChild(switchEffect);
        
        setTimeout(() => {
            if (switchEffect.parentNode) {
                switchEffect.parentNode.removeChild(switchEffect);
            }
        }, 1000);
    }
    
    createElementEffect(player, element) {
        const fighterElement = document.getElementById(`player${player}`);
        const elementEffect = document.createElement('div');
        elementEffect.textContent = this.elements[element].emoji;
        elementEffect.style.cssText = `
            position: absolute;
            font-size: 20px;
            pointer-events: none;
            animation: elementPulse 0.5s ease-out forwards;
            z-index: 100;
        `;
        
        const playerPos = this.players[player].position;
        elementEffect.style.left = `${playerPos.x + Math.random() * 40}px`;
        elementEffect.style.top = `${playerPos.y - Math.random() * 40}px`;
        
        document.getElementById('effects').appendChild(elementEffect);
        
        setTimeout(() => {
            if (elementEffect.parentNode) {
                elementEffect.parentNode.removeChild(elementEffect);
            }
        }, 500);
    }
    
    updatePlayerPositions() {
        document.getElementById('player1').style.left = `${this.players[1].position.x}px`;
        document.getElementById('player2').style.left = `${this.players[2].position.x}px`;
    }
    
    cleanupEffects() {
        const effects = document.querySelectorAll('#effects > div');
        effects.forEach(effect => {
            if (effect.style.animationName === 'none' || 
                effect.style.animationPlayState === 'finished') {
                effect.remove();
            }
        });
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateUI();
            
            if (this.timer <= 0) {
                this.endRound();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    endRound() {
        this.gameState = 'ended';
        this.stopTimer();
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 勝者を決定
        let winner = '';
        if (this.players[1].health > this.players[2].health) {
            winner = 'プレイヤー1の勝利！';
        } else if (this.players[2].health > this.players[1].health) {
            winner = 'プレイヤー2の勝利！';
        } else {
            winner = '引き分け！';
        }
        
        this.showModal('ラウンド終了', winner, '次のラウンド');
    }
    
    updateUI() {
        // ヘルスバー更新
        const p1Health = (this.players[1].health / this.players[1].maxHealth) * 100;
        const p2Health = (this.players[2].health / this.players[2].maxHealth) * 100;
        
        document.getElementById('p1-health').style.width = `${p1Health}%`;
        document.getElementById('p2-health').style.width = `${p2Health}%`;
        
        // コンボ表示更新
        document.querySelector('#p1-combo .combo-count').textContent = this.players[1].combo;
        document.querySelector('#p2-combo .combo-count').textContent = this.players[2].combo;
        
        // 必殺技ゲージ更新
        document.querySelector('#p1-special .gauge-fill').style.width = `${this.players[1].specialGauge}%`;
        document.querySelector('#p2-special .gauge-fill').style.width = `${this.players[2].specialGauge}%`;
        
        // ゲージが満タンの場合の演出
        if (this.players[1].specialGauge >= 100) {
            document.querySelector('#p1-special .gauge-fill').classList.add('full');
        } else {
            document.querySelector('#p1-special .gauge-fill').classList.remove('full');
        }
        
        if (this.players[2].specialGauge >= 100) {
            document.querySelector('#p2-special .gauge-fill').classList.add('full');
        } else {
            document.querySelector('#p2-special .gauge-fill').classList.remove('full');
        }
        
        // タイマー更新
        document.getElementById('timer').textContent = this.timer;
        
        // ラウンド表示更新
        document.getElementById('round').textContent = this.round;
    }
    
    showModal(title, message, buttonText) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modalBtn').textContent = buttonText;
        document.getElementById('gameModal').style.display = 'block';
    }
    
    hideModal() {
        document.getElementById('gameModal').style.display = 'none';
        if (this.gameState === 'ended') {
            this.round++;
            this.resetPlayers();
            this.startGame();
        }
    }
}

// CSSアニメーションを追加
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes damageFloat {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
    }
    
    @keyframes blockFloat {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        100% { transform: translateY(-40px) scale(1); opacity: 0; }
    }
    
    @keyframes switchFloat {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-50px) scale(1); opacity: 0; }
    }
    
    @keyframes elementPulse {
        0% { transform: scale(0.5); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
        100% { transform: scale(1); opacity: 0; }
    }
    
    .fighter.moving {
        animation: walk 0.5s ease-in-out infinite;
    }
    
    @keyframes walk {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
    
    .fighter.attacking {
        animation: attack 0.3s ease-out;
    }
    
    @keyframes attack {
        0% { transform: scale(1) translateX(0); }
        50% { transform: scale(1.1) translateX(10px); }
        100% { transform: scale(1) translateX(0); }
    }
    
    .fighter.blocking {
        animation: block 0.2s ease-out;
    }
    
    @keyframes block {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(0.95); filter: brightness(1.2); }
        100% { transform: scale(1); filter: brightness(1); }
    }
`;

document.head.appendChild(additionalStyles);

// ゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
    new ElementalFighter();
});