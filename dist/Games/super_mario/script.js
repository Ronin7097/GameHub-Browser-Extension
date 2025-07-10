class SuperMarioGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer = document.getElementById('gameContainer');

        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.camera = { x: 0, y: 0 };
        this.keys = {};

        this.mario = {
            x: 100,
            y: 400,
            width: 32,
            height: 32,
            velX: 0,
            velY: 0,
            speed: 5,
            jumpPower: 15,
            onGround: false,
            direction: 1, // 1 for right, -1 for left
            color: '#FF0000' // Placeholder color
        };

        this.platforms = [
            { x: 0, y: 550, width: 800, height: 50, color: '#8B4513' },
            { x: 200, y: 450, width: 150, height: 20, color: '#228B22' },
            { x: 400, y: 350, width: 100, height: 20, color: '#228B22' },
            { x: 600, y: 250, width: 120, height: 20, color: '#228B22' },
            { x: 800, y: 500, width: 200, height: 20, color: '#228B22' },
            { x: 1100, y: 400, width: 100, height: 20, color: '#228B22' },
            { x: 1300, y: 300, width: 150, height: 20, color: '#228B22' },
            { x: 1500, y: 550, width: 300, height: 50, color: '#8B4513' }
        ];

        this.enemies = [
            { x: 250, y: 418, width: 24, height: 24, velX: -1, color: '#8B4513', active: true },
            { x: 450, y: 318, width: 24, height: 24, velX: -1, color: '#8B4513', active: true },
            { x: 850, y: 468, width: 24, height: 24, velX: -1, color: '#8B4513', active: true },
            { x: 1150, y: 368, width: 24, height: 24, velX: -1, color: '#8B4513', active: true }
        ];

        this.coins = [
            { x: 230, y: 420, width: 16, height: 16, collected: false },
            { x: 430, y: 320, width: 16, height: 16, collected: false },
            { x: 630, y: 220, width: 16, height: 16, collected: false },
            { x: 830, y: 470, width: 16, height: 16, collected: false },
            { x: 1130, y: 370, width: 16, height: 16, collected: false },
            { x: 1330, y: 270, width: 16, height: 16, collected: false }
        ];

        this.goal = { x: 1700, y: 450, width: 32, height: 100, color: '#FFD700' };

        this.init();
        this.attachEventListeners();
    }

    init() {
        this.updateUI();
        this.gameLoop();
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        window.restartGame = () => this.restartGame(); // Expose to global scope for HTML button
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updateMario();
        this.updateEnemies();
        this.updateCoins();
        this.checkGoal();
    }

    updateMario() {
        // Horizontal movement
        if (this.keys['a'] || this.keys['A']) {
            this.mario.velX = -this.mario.speed;
            this.mario.direction = -1;
        } else if (this.keys['d'] || this.keys['D']) {
            this.mario.velX = this.mario.speed;
            this.mario.direction = 1;
        } else {
            this.mario.velX *= 0.8; // Friction
        }

        // Jumping
        if ((this.keys['w'] || this.keys['W']) && this.mario.onGround) {
            this.mario.velY = -this.mario.jumpPower;
            this.mario.onGround = false;
        }

        // Apply gravity
        this.mario.velY += 0.8;

        // Update position
        this.mario.x += this.mario.velX;
        this.mario.y += this.mario.velY;

        // Check platform collisions
        this.mario.onGround = false;
        for (let platform of this.platforms) {
            if (this.checkCollision(this.mario, platform)) {
                // Landing on top
                if (this.mario.velY > 0 && this.mario.y < platform.y) {
                    this.mario.y = platform.y - this.mario.height;
                    this.mario.velY = 0;
                    this.mario.onGround = true;
                }
                // Hitting from below
                else if (this.mario.velY < 0 && this.mario.y > platform.y) {
                    this.mario.y = platform.y + platform.height;
                    this.mario.velY = 0;
                }
                // Hitting from sides
                else if (this.mario.velX > 0) {
                    this.mario.x = platform.x - this.mario.width;
                    this.mario.velX = 0;
                } else if (this.mario.velX < 0) {
                    this.mario.x = platform.x + platform.width;
                    this.mario.velX = 0;
                }
            }
        }

        // Check boundaries
        if (this.mario.x < 0) {
            this.mario.x = 0;
            this.mario.velX = 0;
        }

        // Fall death
        if (this.mario.y > this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetMario();
            }
        }

        // Update camera
        this.camera.x = this.mario.x - this.canvas.width / 2;
        if (this.camera.x < 0) this.camera.x = 0;
    }

    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;

            enemy.x += enemy.velX;

            // Simple boundary check for enemies (should be platform-aware)
            // For now, just reverse if they hit a hardcoded boundary or fall off a platform
            let onPlatform = false;
            for (let platform of this.platforms) {
                if (this.checkCollision(enemy, platform)) {
                    onPlatform = true;
                    break;
                }
            }
            // If enemy is not on a platform, reverse direction
            if (!onPlatform) {
                enemy.velX = -enemy.velX;
            }

            // Check collision with Mario
            if (this.checkCollision(this.mario, enemy)) {
                // Mario jumps on enemy
                if (this.mario.velY > 0 && this.mario.y < enemy.y) {
                    enemy.active = false;
                    this.mario.velY = -8; // Bounce Mario up
                    this.score += 100;
                    this.updateUI();
                } else {
                    // Mario gets hurt
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetMario();
                    }
                }
            }
        });
    }

    updateCoins() {
        this.coins.forEach(coin => {
            if (coin.collected) return;

            if (this.checkCollision(this.mario, coin)) {
                coin.collected = true;
                this.score += 50;
                this.updateUI();
            }
        });
    }

    checkGoal() {
        if (this.checkCollision(this.mario, this.goal)) {
            this.level++;
            this.score += 500;
            this.nextLevel();
        }
    }

    // AABB Collision Detection
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB'; // Sky color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawPlatforms();
        this.drawCoins();
        this.drawEnemies();
        this.drawGoal();
        this.drawMario();
    }

    drawMario() {
        this.ctx.fillStyle = this.mario.color;
        this.ctx.fillRect(this.mario.x - this.camera.x, this.mario.y, this.mario.width, this.mario.height);
        // Placeholder for actual sprite drawing
    }

    drawPlatforms() {
        this.platforms.forEach(platform => {
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x - this.camera.x, platform.y, platform.width, platform.height);
        });
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x - this.camera.x, enemy.y, enemy.width, enemy.height);
            // Placeholder for actual sprite drawing
        });
    }

    drawCoins() {
        this.coins.forEach(coin => {
            if (coin.collected) return;
            this.ctx.fillStyle = '#FFD700'; // Gold color
            this.ctx.beginPath();
            this.ctx.arc(coin.x - this.camera.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            // Placeholder for actual sprite drawing
        });
    }

    drawGoal() {
        this.ctx.fillStyle = this.goal.color;
        this.ctx.fillRect(this.goal.x - this.camera.x, this.goal.y, this.goal.width, this.goal.height);
        // Placeholder for actual sprite drawing
    }

    drawBackground() {
        // Simple ground
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
        // Placeholder for actual background elements
    }

    resetMario() {
        this.mario.x = 100;
        this.mario.y = 400;
        this.mario.velX = 0;
        this.mario.velY = 0;
        this.camera.x = 0;
        this.updateUI();
    }

    nextLevel() {
        // Reset enemies for new level
        this.enemies.forEach(enemy => {
            enemy.active = true;
            // You might want to reset enemy positions based on new level data here
        });

        // Reset coins for new level
        this.coins.forEach(coin => {
            coin.collected = false;
        });

        this.resetMario();
        this.updateUI();
        // Here you would load new level data (platforms, enemies, coins) based on this.level
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    restartGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.level = 1;

        // Reset all game elements
        this.enemies.forEach(enemy => {
            enemy.active = true;
            // Reset enemy positions to initial level state
        });
        this.coins.forEach(coin => {
            coin.collected = false;
        });

        this.resetMario();
        document.getElementById('gameOver').style.display = 'none';
        this.updateUI();
        this.gameLoop(); // Restart the game loop
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SuperMarioGame();
});
