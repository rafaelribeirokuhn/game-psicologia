// --- Scene Definitions ---
class StartScene extends Phaser.Scene {
  constructor() { super('StartScene'); }
  create() {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Retro Puzzle Game', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    const playBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'PLAY', { fontSize: '28px', color: '#0f0', backgroundColor: '#333', padding: { x: 20, y: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Puzzle1'));
  }
}

class Puzzle1 extends Phaser.Scene {
  constructor() { super('Puzzle1'); }
  preload() {
    this.load.image('draw-bg', 'assets/backgrounds/draw-the-image.png');
    this.load.image('eraser', 'assets/sprites/eraser.png');
  }
  create() {
    // Add background image (pixel-perfect)
    this.bg = this.add.image(0, 0, 'draw-bg').setOrigin(0, 0);
    // Create a graphics object for drawing
    this.drawing = this.add.graphics();
    this.drawing.lineStyle(2, 0xffd700, 1); // thinner for pixel art
    this.isDrawing = false;
    this.lastPos = null;
    this.strokes = []; // Array to store all strokes
    this.currentStroke = null;

    // Touch/mouse events for drawing
    this.input.on('pointerdown', pointer => {
      this.isDrawing = true;
      this.lastPos = { x: pointer.x, y: pointer.y };
      this.currentStroke = [{ x: pointer.x, y: pointer.y }];
    });
    this.input.on('pointermove', pointer => {
      if (this.isDrawing && this.lastPos) {
        this.drawing.lineBetween(this.lastPos.x, this.lastPos.y, pointer.x, pointer.y);
        this.currentStroke.push({ x: pointer.x, y: pointer.y });
        this.lastPos = { x: pointer.x, y: pointer.y };
      }
    });
    this.input.on('pointerup', () => {
      this.isDrawing = false;
      if (this.currentStroke && this.currentStroke.length > 1) {
        this.strokes.push(this.currentStroke);
      }
      this.currentStroke = null;
      this.lastPos = null;
    });

    // Eraser image button (undo)
    this.eraserBtn = this.add.image(55, GAME_HEIGHT - 45, 'eraser')
      .setOrigin(0.5, 0.5)
      .setScale(0.7)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.strokes.length > 0) {
          this.strokes.pop();
          this.redrawStrokes();
        }
      });

    // Tap/click to continue (for now, bottom right corner)
    this.nextBtn = this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 4, '→', { fontSize: '20px', color: '#0f0' })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Puzzle2'));
  }

  redrawStrokes() {
    this.drawing.clear();
    this.drawing.lineStyle(2, 0xffd700, 1);
    for (const stroke of this.strokes) {
      for (let i = 1; i < stroke.length; i++) {
        const p1 = stroke[i - 1];
        const p2 = stroke[i];
        this.drawing.lineBetween(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }
}

class Puzzle2 extends Phaser.Scene {
  constructor() { super('Puzzle2'); }
  create() {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Puzzle 2 (Flying Coins)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('Puzzle3'));
  }
}

class Puzzle3 extends Phaser.Scene {
  constructor() { super('Puzzle3'); }
  create() {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Puzzle 3 (Draw Image)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('Puzzle4'));
  }
}

class Puzzle4 extends Phaser.Scene {
  constructor() { super('Puzzle4'); }
  create() {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Puzzle 4 (Blank)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('Puzzle5'));
  }
}

class Puzzle5 extends Phaser.Scene {
  constructor() { super('Puzzle5'); }
  create() {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Puzzle 5 (Blank)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('ResultScene'));
  }
}

class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }
  create() {
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Result / Score (Blank)', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('StartScene'));
  }
}

// Phaser 3 Game Config
const GAME_WIDTH = 433;
const GAME_HEIGHT = 255;
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#222',
  scene: [StartScene, Puzzle1, Puzzle2, Puzzle3, Puzzle4, Puzzle5, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    orientation: Phaser.Scale.LANDSCAPE,
    // For crisp pixel art
    pixelArt: true
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};

// Start Phaser game and force fullscreen
window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  function goFullscreen() {
    const canvas = document.querySelector('canvas');
    if (canvas && document.fullscreenEnabled && !document.fullscreenElement) {
      canvas.requestFullscreen();
    }
  }
  // Try to go fullscreen on load
  goFullscreen();
  // Also go fullscreen on any user interaction (required by some browsers)
  window.addEventListener('pointerdown', goFullscreen, { once: true });
  window.addEventListener('touchstart', goFullscreen, { once: true });
  window.addEventListener('keydown', goFullscreen, { once: true });
});
