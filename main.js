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
  preload() {
    this.load.image('find-items-bg', 'assets/backgrounds/find-the-items.png');
    this.load.image('check-mark', 'assets/sprites/check-mark.png');
  }
  create() {
    // Set the find-the-items image as the background
    this.bg = this.add.image(0, 0, 'find-items-bg').setOrigin(0, 0);

    // Add 11 individually positioned clickable blue boxes (15x15)
    this.blueBoxes = [];
    const blueBoxSize = 15;
    // Example positions (customize as needed)
    const bluePositions = [
      { x: 162,  y: 213 }, // flower
      { x: 131,  y: 10 }, // sleeping dog
      { x: 309, y: 218 }, // fruit
      { x: 254, y: 161 }, //grave
      { x: 89, y: 204 }, // robot
      { x: 296, y: 154 }, // mouse
      { x: 255, y: 141 }, // ghost
      { x: 240, y: 198 }, // camera
      { x: 203, y: 216 }, // cow
      { x: 18, y: 243 }, // thrash can
      { x: 320, y: 40 } // bird
    ];

    // Add 11 individually positioned clickable red boxes (15x15)
    this.redBoxes = [];
    const redBoxSize = 15;
    // Example positions for red boxes (customize as needed)
    const redPositions = [
      { x: 341,  y: 246 },  // flower
      { x: 351, y: 231 }, // sleeping dog
      { x: 358, y: 246 }, // fruit
      { x: 376, y: 220 }, //grave
      { x: 376, y: 243 }, // robot
      { x: 396, y: 217 }, // mouse
      { x: 397, y: 242 }, // ghost
      { x: 413, y: 225 }, // camera
      { x: 438, y: 219 }, // cow
      { x: 428, y: 246 }, // thrash can
      { x: 444, y: 245 } // bird
    ];

    this.checkMarks = {};
    for (let i = 0; i < 11; i++) {
      const blueBoxPos = bluePositions[i];
          const blueBox = this.add.rectangle(blueBoxPos.x, blueBoxPos.y, blueBoxSize, blueBoxSize)
            .setFillStyle(0x2196f3, 0.001)
            .setStrokeStyle(2, 0x1565c0, 0.001)
            .setInteractive() // pass { useHandCursor: true } to see the pointer
            .on('pointerdown', () => {
              // Place check-mark at the corresponding red box position
              const redBoxPos = redPositions[i];
              // Only add one check-mark per blue box
              if (!(i in this.checkMarks)) {
                const check = this.add.image(redBoxPos.x, redBoxPos.y, 'check-mark').setOrigin(0.5);
                this.checkMarks[i] = check;
              }
              if (Object.keys(this.checkMarks).length === 11) {
                // All items found, proceed to next puzzle after a short delay
                this.time.delayedCall(1000, () => {
                  this.scene.start('Puzzle3');
                });
              }
            });
      this.blueBoxes.push(blueBox);

      const redBoxPos = redPositions[i];
          const redBox = this.add.rectangle(redBoxPos.x, redBoxPos.y, redBoxSize, redBoxSize)
            .setFillStyle(0xf44336, 0.001)
            .setStrokeStyle(2, 0xb71c1c, 0.001);
      this.redBoxes.push(redBox);
    }

    // Tap/click to continue (for now, bottom right corner)
    this.nextBtn = this.add.text(GAME_WIDTH - 8, 14, '→', { fontSize: '20px', color: '#5136a9' })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Puzzle3'));
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
const GAME_WIDTH = 455;
const GAME_HEIGHT = 256;
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

// Start Phaser game, force fullscreen, and force landscape on mobile
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

  // Force landscape orientation on mobile
  function forceLandscape() {
    if (window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock('landscape').catch(() => {});
    }
  }
  // forceLandscape();
  // window.addEventListener('orientationchange', forceLandscape);

  // Show overlay if not in landscape (mobile only)
  function showOrientationWarning() {
    let overlay = document.getElementById('orientation-warning');
    if (!overlay) {
      // Inject retro font if not present
      if (!document.getElementById('retro-font-link')) {
        const link = document.createElement('link');
        link.id = 'retro-font-link';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        document.head.appendChild(link);
      }
      overlay = document.createElement('div');
      overlay.id = 'orientation-warning';
      overlay.style.position = 'fixed';
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.75)';
      overlay.style.color = '#fff';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.fontSize = '1em';
      overlay.style.zIndex = 9999;
      overlay.style.padding = '32px';
      overlay.style.boxSizing = 'border-box';
      overlay.style.fontFamily = "'Press Start 2P', monospace";
      overlay.innerText = 'Por favor, gire seu celular para o modo paisagem';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }
  function hideOrientationWarning() {
    const overlay = document.getElementById('orientation-warning');
    if (overlay) overlay.style.display = 'none';
  }
  function checkOrientation() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile && window.innerWidth < window.innerHeight) {
      showOrientationWarning();
    } else {
      hideOrientationWarning();
    }
  }
  // window.addEventListener('resize', checkOrientation);
  // window.addEventListener('orientationchange', checkOrientation);
  // checkOrientation();
});
