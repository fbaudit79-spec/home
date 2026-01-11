class PenguinGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.stages = [
            { // Stage 0
                scoreThreshold: 0,
                platformWidth: 80,
                gravity: 0.3,
                bgColor: 'linear-gradient(to bottom, #87CEEB, #FFFFFF)',
                penguinImage: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g><rect x='30' y='40' width='40' height='50' rx='20' fill='%23333'/><path d='M50 10 C 25 10 25 40 50 40 C 75 40 75 10 50 10 Z' fill='%23333'/><path d='M50 30 C 40 30 40 40 50 40 C 60 40 60 30 50 30 Z' fill='white'/><ellipse cx='40' cy='35' rx='3' ry='5' fill='black'/><ellipse cx='60' cy='35' rx='3' ry='5' fill='black'/><path d='M50 50 C 40 60 40 70 50 70 C 60 70 60 60 50 50 Z' fill='white'/><path d='M20 60 L 30 50 L 10 40 Z' fill='%23333' transform='rotate(-20 20 50)'/><path d='M80 60 L 70 50 L 90 40 Z' fill='%23333' transform='rotate(20 80 50)'/><path d='M40 90 Q 50 95 60 90 L 55 95 L 45 95 Z' fill='orange'/></g></svg>`
            },
            { // Stage 1
                scoreThreshold: 500,
                platformWidth: 60,
                gravity: 0.35,
                bgColor: 'linear-gradient(to bottom, #4682B4, #E0FFFF)',
                penguinImage: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g><rect x='30' y='30' width='40' height='60' rx='20' fill='%23333'/><path d='M50 5 C 25 5 25 35 50 35 C 75 35 75 5 50 5 Z' fill='%23333'/><path d='M50 25 C 40 25 40 35 50 35 C 60 35 60 25 50 25 Z' fill='white'/><ellipse cx='40' cy='30' rx='3' ry='5' fill='black'/><ellipse cx='60' cy='30' rx='3' ry='5' fill='black'/><path d='M50 45 C 40 55 40 65 50 65 C 60 65 60 55 50 45 Z' fill='white'/><path d='M20 55 L 30 45 L 10 35 Z' fill='%23333' transform='rotate(-20 20 45)'/><path d='M80 55 L 70 45 L 90 35 Z' fill='%23333' transform='rotate(20 80 45)'/><path d='M40 85 Q 50 90 60 85 L 55 90 L 45 90 Z' fill='orange'/><rect x='40' y='40' width='20' height='5' fill='red'/><polygon points='40,45 60,45 55,55 45,55' fill='red'/></g></svg>`
            },
            { // Stage 2
                scoreThreshold: 1500,
                platformWidth: 40,
                gravity: 0.4,
                bgColor: 'linear-gradient(to bottom, #000080, #87CEFA)',
                penguinImage: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><g><rect x='25' y='20' width='50' height='70' rx='25' fill='%23333'/><path d='M50 0 C 20 0 20 30 50 30 C 80 30 80 0 50 0 Z' fill='%23333'/><path d='M50 20 C 40 20 40 30 50 30 C 60 30 60 20 50 20 Z' fill='white'/><ellipse cx='40' cy='25' rx='3' ry='5' fill='black'/><ellipse cx='60' cy='25' rx='3' ry='5' fill='black'/><path d='M50 40 C 35 50 35 65 50 65 C 65 65 65 50 50 40 Z' fill='white'/><path d='M15 50 L 25 40 L 5 30 Z' fill='%23333' transform='rotate(-20 15 40)'/><path d='M85 50 L 75 40 L 95 30 Z' fill='%23333' transform='rotate(20 85 40)'/><path d='M40 85 Q 50 90 60 85 L 55 90 L 45 90 Z' fill='orange'/><rect x='35' y='0' width='30' height='15' fill='black'/><rect x='30' y='10' width='40' height='5' fill='black'/></g></svg>`
            }
        ];
        this.stage = 0;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: relative;
                    display: block;
                    width: 375px;
                    height: 667px;
                    background: var(--bg-color, linear-gradient(to bottom, #87CEEB, #FFFFFF));
                    overflow: hidden;
                    border: 2px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: background 1s;
                }
                .penguin {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background-size: cover;
                    transition: background-image 1s;
                }
                .platform {
                    position: absolute;
                    height: 20px;
                    background-color: var(--platform-color, #FFFFFF);
                    border-radius: 10px;
                    transition: width 0.5s;
                }
                .score {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    font-size: 24px;
                    color: var(--text-color, #000000);
                }
                .game-over {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 48px;
                    color: var(--text-color, #000000);
                    text-align: center;
                    display: none;
                }
            </style>
            <div class="score">Score: 0</div>
            <div class="game-over">Game Over</div>
        `;

        this.penguin = null;
        this.platforms = [];
        this.score = 0;
        this.gameOver = false;
        
        this.penguinX = 167;
        this.penguinY = 50;
        this.penguinDY = 0;
        this.jumpForce = -10;
        
        this.keys = {};
        this.moveLeft = false;
        this.moveRight = false;

        this.scoreElement = this.shadowRoot.querySelector('.score');
        this.gameOverElement = this.shadowRoot.querySelector('.game-over');
    }

    connectedCallback() {
        this.init();
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        this.shadowRoot.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.shadowRoot.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.shadowRoot.addEventListener('touchmove', (e) => this.handleTouch(e));
    }

    init() {
        this.setStage(0);
        this.createPenguin();
        this.createInitialPlatforms();
        this.gameLoop();
    }

    setStage(stageIndex) {
        if (stageIndex >= this.stages.length) return;

        this.stage = stageIndex;
        const stageConfig = this.stages[this.stage];

        this.gravity = stageConfig.gravity;
        this.style.background = stageConfig.bgColor;
        if (this.penguin) {
            this.penguin.style.backgroundImage = `url("${stageConfig.penguinImage}")`;
        }
    }

    createPenguin() {
        this.penguin = document.createElement('div');
        this.penguin.classList.add('penguin');
        this.penguin.style.backgroundImage = `url("${this.stages[this.stage].penguinImage}")`;
        this.shadowRoot.appendChild(this.penguin);
        this.updatePenguinPosition();
    }

    updatePenguinPosition() {
        this.penguin.style.left = this.penguinX + 'px';
        this.penguin.style.bottom = this.penguinY + 'px';
    }

    createInitialPlatforms() {
        const stageConfig = this.stages[this.stage];
        // Start platform
        this.createPlatform(150, 50, stageConfig.platformWidth);

        // Other initial platforms
        for (let i = 1; i < 10; i++) {
            this.createPlatform(Math.random() * (375 - stageConfig.platformWidth), 50 + i * 70, stageConfig.platformWidth);
        }
    }

    createPlatform(x, y, width) {
        const platform = document.createElement('div');
        platform.classList.add('platform');
        platform.style.left = x + 'px';
        platform.style.bottom = y + 'px';
        platform.style.width = width + 'px';
        this.shadowRoot.appendChild(platform);
        this.platforms.push(platform);
    }

    gameLoop() {
        if (this.gameOver) return;

        this.handleInput();
        this.updatePenguin();
        this.checkCollisions();
        this.updatePlatforms();
        this.updateScore();
        
        this.updatePenguinPosition();

        if (this.penguinY < -50) {
            this.endGame();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    handleTouch(e) {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const gameRect = this.getBoundingClientRect();
        const midPoint = gameRect.left + gameRect.width / 2;
        if (touchX < midPoint) {
            this.moveLeft = true;
            this.moveRight = false;
        } else {
            this.moveLeft = false;
            this.moveRight = true;
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.moveLeft = false;
        this.moveRight = false;
    }
    
    handleInput() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.moveLeft) {
            this.penguinX -= 5;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.moveRight) {
            this.penguinX += 5;
        }
        // wraparound
        if (this.penguinX > 375) {
            this.penguinX = -40;
        } else if (this.penguinX < -40) {
            this.penguinX = 375;
        }
    }

    updatePenguin() {
        this.penguinDY += this.gravity;
        this.penguinY -= this.penguinDY;
    }

    checkCollisions() {
        if (this.penguinDY > 0) { // only check for collisions when falling
            this.platforms.forEach(platform => {
                const p = this.penguin.getBoundingClientRect();
                const pf = platform.getBoundingClientRect();
                const hostRect = this.getBoundingClientRect();
                
                const p_left = p.left - hostRect.left;
                const p_right = p.right - hostRect.left;
                const p_top = p.top - hostRect.top;
                const p_bottom = p.bottom - hostRect.top;

                const pf_left = pf.left - hostRect.left;
                const pf_right = pf.right - hostRect.left;
                const pf_top = pf.top - hostRect.top;
                const pf_bottom = pf.bottom - hostRect.top;


                if (
                    p_right > pf_left &&
                    p_left < pf_right &&
                    p_bottom > pf_top &&
                    p_top < pf_bottom
                ) {
                     // Check if penguin bottom is within platform top
                    if(p_bottom > pf_top && p_bottom < pf_bottom + 10){
                        this.penguinDY = this.jumpForce;
                    }
                }
            });
        }
    }

    updatePlatforms() {
        const stageConfig = this.stages[this.stage];
        if (this.penguinY > 200) {
            const deltaY = this.penguinY - 200;
            this.penguinY = 200;
            this.platforms.forEach(platform => {
                let bottom = parseFloat(platform.style.bottom);
                bottom -= deltaY;
                platform.style.bottom = bottom + 'px';
            });

            this.platforms = this.platforms.filter(platform => {
                if (parseFloat(platform.style.bottom) < -20) {
                    this.shadowRoot.removeChild(platform);
                    this.createPlatform(Math.random() * (375 - stageConfig.platformWidth), 650, stageConfig.platformWidth);
                     this.score += 10;
                    return false;
                }
                return true;
            });
        }
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
        const nextStage = this.stage + 1;
        if (nextStage < this.stages.length && this.score >= this.stages[nextStage].scoreThreshold) {
            this.setStage(nextStage);
        }
    }

    endGame() {
        this.gameOver = true;
        this.gameOverElement.style.display = 'block';
    }
}

customElements.define('penguin-game', PenguinGame);
