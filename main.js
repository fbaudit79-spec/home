class PenguinGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: relative;
                    display: block;
                    width: 375px;
                    height: 667px;
                    background-color: var(--bg-color, #87CEEB);
                    overflow: hidden;
                    border: 2px solid #ccc;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .penguin {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g><rect x="30" y="40" width="40" height="50" rx="20" fill="%23333"/><path d="M50 10 C 25 10 25 40 50 40 C 75 40 75 10 50 10 Z" fill="%23333"/><path d="M50 30 C 40 30 40 40 50 40 C 60 40 60 30 50 30 Z" fill="white"/><ellipse cx="40" cy="35" rx="3" ry="5" fill="black"/><ellipse cx="60" cy="35" rx="3" ry="5" fill="black"/><path d="M50 50 C 40 60 40 70 50 70 C 60 70 60 60 50 50 Z" fill="white"/><path d="M20 60 L 30 50 L 10 40 Z" fill="%23333" transform="rotate(-20 20 50)"/><path d="M80 60 L 70 50 L 90 40 Z" fill="%23333" transform="rotate(20 80 50)"/><path d="M40 90 Q 50 95 60 90 L 55 95 L 45 95 Z" fill="orange"/></g></svg>');
                    background-size: cover;
                }
                .platform {
                    position: absolute;
                    width: 80px;
                    height: 20px;
                    background-color: var(--platform-color, #FFFFFF);
                    border-radius: 10px;
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
        this.gravity = 0.3;
        this.jumpForce = -10;
        
        this.keys = {};

        this.scoreElement = this.shadowRoot.querySelector('.score');
        this.gameOverElement = this.shadowRoot.querySelector('.game-over');
    }

    connectedCallback() {
        this.init();
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    init() {
        this.createPenguin();
        this.createInitialPlatforms();
        this.gameLoop();
    }

    createPenguin() {
        this.penguin = document.createElement('div');
        this.penguin.classList.add('penguin');
        this.shadowRoot.appendChild(this.penguin);
        this.updatePenguinPosition();
    }

    updatePenguinPosition() {
        this.penguin.style.left = this.penguinX + 'px';
        this.penguin.style.bottom = this.penguinY + 'px';
    }

    createInitialPlatforms() {
        // Start platform
        this.createPlatform(150, 50);

        // Other initial platforms
        for (let i = 1; i < 10; i++) {
            this.createPlatform(Math.random() * 295, 50 + i * 70);
        }
    }

    createPlatform(x, y) {
        const platform = document.createElement('div');
        platform.classList.add('platform');
        platform.style.left = x + 'px';
        platform.style.bottom = y + 'px';
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
    
    handleInput() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.penguinX -= 5;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
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
                
                // Adjust bounding client rects to be relative to the game container
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
                    this.createPlatform(Math.random() * 295, 650);
                     this.score += 10;
                    return false;
                }
                return true;
            });
        }
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    endGame() {
        this.gameOver = true;
        this.gameOverElement.style.display = 'block';
    }
}

customElements.define('penguin-game', PenguinGame);
