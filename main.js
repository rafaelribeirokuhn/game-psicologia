// --- Scene Definitions ---
class StartScene extends Phaser.Scene {
  constructor() { super('StartScene'); }
  preload() {
    this.load.image('start-screen', 'assets/backgrounds/start-screen.png');
  }
  create() {
    // Add the start screen background
    this.add.image(0, 0, 'start-screen').setOrigin(0, 0);
    // Place an almost invisible clickable play button over the image's "start" button
    // Adjust these coordinates and size to match the "start" button on your image
    const playBtnArea = this.add.rectangle(228, 185, 120, 44, 0x00ff00, 0.01)
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
  preload() {
    this.load.image('simon-space-ship', 'assets/sprites/simon-space-ship.png');
  }
  init() {
    this.sequence = [];
    this.userStep = 0;
    this.level = 1;
    this.isUserTurn = false;
  }
  create() {
    // Place the simon-space-ship in the center of the screen
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.ship = this.add.image(centerX, centerY, 'simon-space-ship').setOrigin(0.5);

    // Box colors and offsets (relative to ship)
    this.boxData = [
      { color: 0x2196f3, name: 'blue',   dx: -135, dy: 0 },
      { color: 0x43a047, name: 'green',  dx: -60,  dy: 40 },
      { color: 0xffeb3b, name: 'yellow', dx: 60,   dy: 40 },
      { color: 0xf44336, name: 'red',    dx: 135,  dy: 0 }
    ];
    this.simonBoxes = [];
    for (let idx = 0; idx < this.boxData.length; idx++) {
      const { color, name } = this.boxData[idx];
      const box = this.add.rectangle(0, 0, 65, 65, color, 0.001)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          console.log('this.isUserTurn', this.isUserTurn);
          if (!this.isUserTurn) return;
          this.handleUserInput(idx);
        });
      this.simonBoxes.push(box);
      this[name + 'Box'] = box;
    }

    // Start continuous bounce animation for the ship
    this.tweens.add({
      targets: this.ship,
      y: centerY - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Update box positions relative to the ship in update loop
    this.shipBaseY = centerY;
    this.events.on('update', this.updateBoxes, this);

    // Start the Simon game sequence after a short delay to allow box positions to update
    this.time.delayedCall(200, () => this.startSimon());
    // Remove or comment out the line below to avoid skipping the Simon game
    // this.input.once('pointerdown', () => this.scene.start('Puzzle4'));
  }

  update(time, delta) {
    this.updateBoxes();
  }

  updateBoxes() {
    if (!this.ship) return;
    for (let i = 0; i < this.simonBoxes.length; i++) {
      const { dx, dy } = this.boxData[i];
      this.simonBoxes[i].x = this.ship.x + dx;
      this.simonBoxes[i].y = this.ship.y + dy;
    }
  }

  startSimon() {
    this.sequence = [];
    this.level = 1;
    this.nextLevel();
  }

  nextLevel() {
    // Add a random box to the sequence
    this.sequence.push(Phaser.Math.Between(0, this.simonBoxes.length - 1));
    this.userStep = 0;
    this.isUserTurn = false;
    this.playSequence();
  }

  playSequence() {
    let i = 0;
    this.isUserTurn = false;
    const stepTime = 600;
    const totalTime = stepTime * this.sequence.length;
    // Play the sequence visually
    this.flashBox(this.sequence[0]);
    if (this.sequence.length > 1) {
      this.time.addEvent({
        delay: stepTime,
        repeat: this.sequence.length - 2,
        callback: () => {
          i++;
          this.flashBox(this.sequence[i]);
        },
        callbackScope: this
      });
    }
    // Always enable user input after the sequence is done
    this.time.delayedCall(totalTime, () => { this.isUserTurn = true; });
  }

  flashBox(idx) {
    const box = this.simonBoxes[idx];
    const color = this.boxData[idx].color;
    // Create a glowing flash effect (same color as box, semi-transparent, blurred) as a circle
    const glow = this.add.circle(box.x, box.y, 38, color, 0.7)
      .setOrigin(0.5)
      .setDepth(10);
    this.tweens.add({
      targets: glow,
      scale: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => glow.destroy()
    });
  }

  handleUserInput(idx) {
    this.flashBox(idx);
    if (idx === this.sequence[this.userStep]) {
      this.userStep++;
      if (this.userStep === this.sequence.length) {
        this.isUserTurn = false;
        this.time.delayedCall(700, () => this.nextLevel(), []);
      }
    } else {
      // User failed: grayscale effect and stop ship animation
      this.isUserTurn = false;
      // Stop ship animation
      if (this.ship && this.ship.anims) this.ship.anims.stop && this.ship.anims.stop();
      if (this.ship && this.ship.active && this.ship.scene) {
        // Remove all tweens for the ship
        this.tweens.killTweensOf(this.ship);
      }
      // Add grayscale effect to the whole game canvas
      let usedPipeline = false;
      if (this.cameras.main.setPostPipeline && this.sys.game.renderer.pipelines) {
        // Try Phaser 3 built-in pipeline if available
        const grayPipeline = this.sys.game.renderer.pipelines.get('Gray');
        if (grayPipeline) {
          this.cameras.main.setPostPipeline('Gray');
          usedPipeline = true;
        }
      }
      // Fallback to CSS filter
      const canvas = this.sys.game.canvas;
      if (!usedPipeline && canvas) canvas.style.filter = 'grayscale(1)';
      this.time.delayedCall(900, () => {
        // Remove grayscale effect before changing scene
        if (usedPipeline) this.cameras.main.clearPostPipeline();
        if (canvas) canvas.style.filter = '';
        this.scene.start('Puzzle4');
      });
    }
  }
}

class Puzzle4 extends Phaser.Scene {
  constructor() { super('Puzzle4'); }
  preload() {
    this.load.image('galaxy', 'assets/backgrounds/galaxy.png');
    this.load.image('lunar-surface-back', 'assets/backgrounds/lunar-surface-back.png');
    this.load.image('lunar-surface-front', 'assets/backgrounds/lunar-surface-front.png');
    // Load the spinning coin spritesheet (8 frames, 29x28 each, spacing 1)
    this.load.spritesheet('spinning-coin', 'assets/sprites/spinning-coin.png', { frameWidth: 29, frameHeight: 28, margin: 0, spacing: 1 });
    // Load the spinning fireball spritesheet (8 frames, 16x16 each, spacing 1)
    this.load.spritesheet('spinning-fireball', 'assets/sprites/spinning-fireball.png', { frameWidth: 16, frameHeight: 16, margin: 0, spacing: 1 });
  }
  create() {
    // Layered background: galaxy, then lunar-surface-back, then lunar-surface-front
    this.add.image(-1, 0, 'galaxy').setOrigin(0, 0);
    this.add.image(-1, 0, 'lunar-surface-back').setOrigin(0, 0);
    // We'll add lunar-surface-front after all sprites, so they appear behind it
    const lunarSurfaceFront = this.add.image(-1, 0, 'lunar-surface-front').setOrigin(0, 0);


    // Add 4 yellow and 4 red boxes (20x30) at specified positions
    const boxPositions = [
      { x: 78, y: this.sys.game.config.height - 25 },
      { x: 180, y: this.sys.game.config.height - 25 },
      { x: 275, y: this.sys.game.config.height - 25 },
      { x: 370, y: this.sys.game.config.height - 25 }
    ];
    this.yellowBoxes = [];
    this.redBoxes = [];
    this.boxPairs = [];

    // Load the coin animation if not already loaded
    if (!this.anims.exists('spin-coin')) {
      this.anims.create({
        key: 'spin-coin',
        frames: this.anims.generateFrameNumbers('spinning-coin', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1
      });
    }
    // Load the fireball animation if not already loaded
    if (!this.anims.exists('spin-fireball')) {
      this.anims.create({
        key: 'spin-fireball',
        frames: this.anims.generateFrameNumbers('spinning-fireball', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1
      });
    }

    for (let i = 0; i < boxPositions.length; i++) {
      const pos = boxPositions[i];
      // Replace yellow box with spinning coin sprite
      const yellow = this.add.sprite(pos.x, pos.y, 'spinning-coin', 0).setOrigin(0.5);
      yellow.displayWidth = 29;
      yellow.displayHeight = 28;
      yellow.initialY = pos.y;
      yellow.isAtInitial = true;
      yellow.colorType = 'yellow';
      yellow.setInteractive({ useHandCursor: true });
      yellow.isFalling = false;
      yellow.isFrozen = false;
      yellow.play('spin-coin');
      yellow.on('pointerdown', () => {
        if (yellow.isAtInitial || yellow.isFrozen) return;
        // Create a glowing yellow circle effect at the coin's position
        const glow = this.add.circle(yellow.x, yellow.y, 24, 0xfff200, 0.6)
          .setOrigin(0.5)
          .setDepth(yellow.depth + 1);
        this.tweens.add({
          targets: glow,
          scale: 1.7,
          alpha: 0,
          duration: 500,
          ease: 'Cubic.easeOut',
          onComplete: () => glow.destroy()
        });
        yellow.isFrozen = true;
        this.tweens.killTweensOf(yellow);
        // Fade out the coin
        this.tweens.add({
          targets: yellow,
          alpha: 0,
          duration: 1000,
          ease: 'Linear',
        });
        this.time.delayedCall(1000, () => {
          this.tweens.killTweensOf(yellow);
          yellow.y = yellow.initialY;
          yellow.isAtInitial = true;
          yellow.isFrozen = false;
          yellow.isFalling = false;
          yellow.setAlpha(1); // Restore visibility
          const pair = this.boxPairs.find(p => p.yellow === yellow);
          if (pair) this.trySchedulePairLaunch(pair);
        });
      });
      this.yellowBoxes.push(yellow);

      // Replace red box with spinning fireball sprite
      const red = this.add.sprite(pos.x, pos.y, 'spinning-fireball', 0).setOrigin(0.5);
      red.displayWidth = 16;
      red.displayHeight = 16;
      red.initialY = pos.y;
      red.isAtInitial = true;
      red.colorType = 'red';
      red.setInteractive({ useHandCursor: true });
      red.play('spin-fireball');
      red.on('pointerdown', () => {
        // Stop all coin and fireball animations
        this.boxPairs.forEach(pair => {
          if (pair.yellow.anims) pair.yellow.anims.stop();
          if (pair.red.anims) pair.red.anims.stop();
        });
        // Grayscale effect (like Puzzle3 failure) and move to next puzzle
        // Stop all box tweens and prevent further launches
        this.boxPairs.forEach(pair => {
          this.tweens.killTweensOf(pair.yellow);
          this.tweens.killTweensOf(pair.red);
          pair.yellow.disableInteractive();
          pair.red.disableInteractive();
        });
        this._puzzle4Frozen = true;
        let usedPipeline = false;
        if (this.cameras.main.setPostPipeline && this.sys.game.renderer.pipelines) {
          const grayPipeline = this.sys.game.renderer.pipelines.get('Gray');
          if (grayPipeline) {
            this.cameras.main.setPostPipeline('Gray');
            usedPipeline = true;
          }
        }
        const canvas = this.sys.game.canvas;
        if (!usedPipeline && canvas) canvas.style.filter = 'grayscale(1)';
        this.time.delayedCall(900, () => {
          if (usedPipeline) this.cameras.main.clearPostPipeline();
          if (canvas) canvas.style.filter = '';
          this.scene.start('Puzzle5');
        });
      });
      this.redBoxes.push(red);

      this.boxPairs.push({ yellow, red });
    }

    // Start the launch/fall cycle for each pair
    this.boxPairs.forEach(pair => {
      this.trySchedulePairLaunch(pair);
    });

    // Move all coin and fireball sprites behind lunar-surface-front
    this.boxPairs.forEach(pair => {
      this.children.moveBelow(pair.yellow, lunarSurfaceFront);
      this.children.moveBelow(pair.red, lunarSurfaceFront);
    });
  }

  trySchedulePairLaunch(pair) {
    // Stop all launches if frozen (after red click)
    if (this._puzzle4Frozen) return;
    // Only schedule if both are at initial position
    if (!pair.yellow.isAtInitial || !pair.red.isAtInitial) return;
    const delay = Phaser.Math.Between(0, 7000);
    this.time.delayedCall(delay, () => {
      if (this._puzzle4Frozen) return;
      // Check again before launching
      if (pair.yellow.isAtInitial && pair.red.isAtInitial) {
        // Make red launch much rarer than yellow (e.g., 1 in 5 chance)
        const launchRed = Phaser.Math.Between(1, 5) === 1;
        this.launchBox(launchRed ? pair.red : pair.yellow, pair);
      }
    });
  }

  launchBox(box, pair) {
    if (this._puzzle4Frozen) return;
    if (!box.isAtInitial) return;
    box.isAtInitial = false;
    if (box.colorType === 'yellow') {
      box.isFalling = false;
      box.isFrozen = false;
    }
    this.tweens.add({
      targets: box,
      y: box.initialY - 200,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.fallBox(box, pair);
      }
    });
  }

  fallBox(box, pair) {
    if (this._puzzle4Frozen) return;
    if (box.colorType === 'yellow') {
      // If frozen by user click, do not fall
      if (box.isFrozen) {
        // Instantly snap to initial position if not already there
        this.tweens.killTweensOf(box);
        box.y = box.initialY;
        box.isAtInitial = true;
        box.isFrozen = false;
        box.isFalling = false;
        const pairObj = this.boxPairs.find(p => p.yellow === box);
        if (pairObj) this.trySchedulePairLaunch(pairObj);
        return;
      }
      box.isFalling = true;
    }
    this.tweens.add({
      targets: box,
      y: box.initialY,
      duration: 1000,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        box.isAtInitial = true;
        if (box.colorType === 'yellow') box.isFalling = false;
        // Only schedule next launch if both are at initial position
        this.trySchedulePairLaunch(pair);
      }
    });
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
