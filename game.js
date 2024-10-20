class Example extends Phaser.Scene {
    constructor() {
        super();
        this.gridSize = 5;
        this.currentPlayer = 'red';
        this.grid = [];
        this.particles = [];
        this.scores = {
            red: 0,
            blue: 0
        };
    }
    preload() {
        this.load.image('square', 'https://play.rosebud.ai/assets/square.png?fETE');
        this.load.image('red_particle', 'https://play.rosebud.ai/assets/red.png?x9OX');
        this.load.audio('place_sound', 'https://play.rosebud.ai/assets/tokenplace.mp3?unIG');
        this.load.audio('collapse_sound', 'https://play.rosebud.ai/assets/collapse.wav?j1z9');
        this.load.image('r1_gif', 'https://play.rosebud.ai/assets/r1.gif?XPEw');
        this.load.image('r1_png', 'https://play.rosebud.ai/assets/r1.png?DpdY');
        this.load.image('r2_png', 'https://play.rosebud.ai/assets/r2.png?PwsB');
        this.load.image('r3_gif', 'https://play.rosebud.ai/assets/r3.gif?0AvI');
        this.load.image('r3_png', 'https://play.rosebud.ai/assets/r3.png?6Oei');
        this.load.image('r4_png', 'https://play.rosebud.ai/assets/r4.png?WAh2');
        this.load.image('g1_png', 'https://play.rosebud.ai/assets/g1.png?TS8D');
        this.load.image('g2_png', 'https://play.rosebud.ai/assets/g2.png?YG6M');
        this.load.image('g3_png', 'https://play.rosebud.ai/assets/g3.png?9wrQ');
        this.load.image('g4_png', 'https://play.rosebud.ai/assets/g4.png?tgso');
        this.load.audio('turn_sound', 'https://play.rosebud.ai/assets/turn.mp3?pQJW');
        this.load.image('background', 'https://play.rosebud.ai/assets/bg.jpg?Gnp4');
        this.load.image('green_particle', 'https://play.rosebud.ai/assets/green_particle.png?qfzY');
        this.load.image('red_particle', 'https://play.rosebud.ai/assets/red_particle.png?FrOK');
    }
    create() {
        // Add background image
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        const margin = 0.1;
        const availableWidth = this.cameras.main.width * (1 - 2 * margin);
        const availableHeight = this.cameras.main.height * (1 - 2 * margin);
        this.squareSize = Math.min(availableWidth, availableHeight) / this.gridSize;
        this.startX = (this.cameras.main.width - this.squareSize * this.gridSize) / 2;
        this.startY = (this.cameras.main.height - this.squareSize * this.gridSize) / 2;
        // Ensure the sound is loaded
        if (!this.sound.get('place_sound')) {
            console.error('Sound "place_sound" not loaded');
        }
        this.createGrid();
        this.addClickListeners();
        this.createScoreText();
        // Update all squares visually
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.updateSquareVisual(row, col);
            }
        }

        // Set up custom cursors
        this.input.setDefaultCursor('default');
        this.greenCursor = this.add.image(0, 0, 'green_particle');
        this.redCursor = this.add.image(0, 0, 'red_particle');
        this.greenCursor.setScale(0.2); // Make the green cursor smaller
        this.redCursor.setScale(0.075); // Make the red cursor 50% smaller than before
        this.greenCursor.setVisible(false);
        this.redCursor.setVisible(false);
        this.greenCursor.setDepth(1000); // Ensure it's on top of other elements
        this.redCursor.setDepth(1000); // Ensure it's on top of other elements
        this.input.on('pointermove', (pointer) => {
            this.greenCursor.setPosition(pointer.x, pointer.y);
            this.redCursor.setPosition(pointer.x, pointer.y);
        });
        // Initial cursor update
        this.updateCursor();
    }
    createGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = this.startX + col * this.squareSize + this.squareSize / 2;
                const y = this.startY + row * this.squareSize + this.squareSize / 2;
                const square = this.add.image(x, y, 'square');
                square.setDisplaySize(this.squareSize, this.squareSize);
                square.setInteractive();
                this.grid[row][col] = {
                    particles: 0,
                    owner: null,
                    image: square,
                    text: this.add.text(x, y, '0', {
                        fontSize: '32px',
                        fill: '#ffffff'
                    }).setOrigin(0.5)
                };
            }
        }
    }
    addClickListeners() {
        this.input.on('gameobjectdown', this.onSquareClick, this);
    }
    createScoreText() {
        this.redScoreText = this.add.text(10, 10, 'Red: 0', {
            fontSize: '24px',
            fill: '#ff0000'
        });
        this.blueScoreText = this.add.text(10, 40, 'Blue: 0', {
            fontSize: '24px',
            fill: '#0000ff'
        });
    }
    onSquareClick(pointer, gameObject) {
        const col = Math.floor((gameObject.x - this.startX) / this.squareSize);
        const row = Math.floor((gameObject.y - this.startY) / this.squareSize);
        const square = this.grid[row][col];
        if (square.owner === null || square.owner === this.currentPlayer) {
            this.sound.play('place_sound');
            this.sound.once('complete', (sound) => {
                if (sound.key === 'place_sound') {
                    this.sound.play('turn_sound');
                }
            });
            this.addParticle(row, col);
        }
    }
    addParticle(row, col, isCollapse = false, collapsingPlayer = null) {
        const square = this.grid[row][col];
        if (isCollapse || square.owner === null || square.owner === this.currentPlayer) {
            square.particles++;
            if (isCollapse) {
                if (square.owner === null) {
                    square.owner = collapsingPlayer;
                }
            } else {
                square.owner = this.currentPlayer;
            }
            this.updateSquareVisual(row, col);
            if (square.particles === 4) {
                this.time.delayedCall(200, () => {
                    this.collapseSquare(row, col);
                });
            } else if (!isCollapse) {
                this.switchPlayer();
            }
        }
    }
    updateSquareVisual(row, col) {
        const square = this.grid[row][col];
        // Remove existing particle image if any
        if (square.particleImage) {
            square.particleImage.destroy();
            square.particleImage = null;
        }
        if (square.owner === 'red') {
            if (square.particles === 1) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'r1_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else if (square.particles === 2) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'r2_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else if (square.particles === 3) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'r3_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else if (square.particles === 4) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'r4_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else {
                square.text.setText(square.particles.toString());
                square.text.setVisible(true);
                square.text.setFill('#ff0000');
            }
        } else if (square.owner === 'blue') {
            if (square.particles === 1) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'g1_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else if (square.particles === 2) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'g2_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else if (square.particles === 3) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'g3_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else if (square.particles === 4) {
                square.particleImage = this.add.image(square.image.x, square.image.y, 'g4_png');
                square.particleImage.setDisplaySize(this.squareSize * 0.8, this.squareSize * 0.8);
                square.text.setVisible(false);
            } else {
                square.text.setText(square.particles.toString());
                square.text.setVisible(true);
                square.text.setFill('#0000ff');
            }
        } else {
            square.text.setText(square.particles > 0 ? square.particles.toString() : '');
            square.text.setVisible(true);
            square.text.setFill('#ffffff');
        }
    }
    collapseSquare(row, col) {
        const square = this.grid[row][col];
        const collapsingPlayer = square.owner;
        this.scores[collapsingPlayer]++;
        square.particles = 0;
        square.owner = null;
        this.updateSquareVisual(row, col);
        this.updateScoreText();
        this.shakeScreen();
        this.sound.play('collapse_sound');
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];
        let chainReaction = false;
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (this.isValidSquare(newRow, newCol)) {
                this.addParticle(newRow, newCol, true, collapsingPlayer);
                if (this.grid[newRow][newCol].particles === 4) {
                    chainReaction = true;
                }
            }
        });
        this.checkWinCondition();
        if (!chainReaction) {
            this.switchPlayer();
        }
    }
    shakeScreen() {
        this.cameras.main.shake(250, 0.005, true);
    }
    isValidSquare(row, col) {
        return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
    }
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        this.updateCursor();
    }
    updateCursor() {
        this.input.setDefaultCursor('none');
        if (this.currentPlayer === 'blue') {
            this.greenCursor.setVisible(true);
            this.redCursor.setVisible(false);
        } else {
            this.greenCursor.setVisible(false);
            this.redCursor.setVisible(true);
        }
    }
    updateScoreText() {
        this.redScoreText.setText(`Red: ${this.scores.red}`);
        this.blueScoreText.setText(`Blue: ${this.scores.blue}`);
    }
    checkWinCondition() {
        if (this.scores.red >= 10 || this.scores.blue >= 10) {
            this.scene.pause();
            const winner = this.scores.red >= 10 ? 'Red' : 'Blue';
            const textColor = winner === 'Red' ? '#ff0000' : '#00ff00';
            const message = winner === 'Red' ? 'GGs player red you are the best uwu' : 'GGs player green you are the best uwu';
            this.add.text(400, 300, message, {
                fontSize: '48px',
                fill: textColor,
                align: 'center',
                wordWrap: {
                    width: 600
                }
            }).setOrigin(0.5);
        }
    }
    getRandomGridPosition(startX, startY, gridSize, squareSize) {
        const randomRow = Math.floor(Math.random() * gridSize);
        const randomCol = Math.floor(Math.random() * gridSize);
        const x = startX + randomCol * squareSize + squareSize / 2;
        const y = startY + randomRow * squareSize + squareSize / 2;
        return {
            x,
            y
        };
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    scene: Example
};

window.phaserGame = new Phaser.Game(config);
