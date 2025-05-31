import './style.css';
import Phaser from 'phaser';

const GRID_ROWS = 4;
const GRID_COLS = 4;
const TILE_SIZE = 120; // Logical tile size for layout

// Calculate game size based on tile size and grid
const GAME_WIDTH = TILE_SIZE * GRID_COLS + 2 * TILE_SIZE * 0.5;
const GAME_HEIGHT = TILE_SIZE * GRID_ROWS + 2 * TILE_SIZE * 0.5;

const tileKeys = [
  'tile1', 'tile2', 'tile3', 'tile4',
  'tile5', 'tile6', 'tile7', 'tile8'
];

let tiles = [];
let revealedTiles = [];
let matchedTiles = 0;
let canClick = true;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#222',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: {
    preload,
    create
  }
};

function preload() {
  // Load tile face images
  for (let i = 1; i <= 8; i++) {
    this.load.image(`tile${i}`, `/tile${i}.png`);
  }
  // Load tile back image
  this.load.image('tile_back', '/tile_back.png');
}

function create() {
  let keys = tileKeys.concat(tileKeys);
  Phaser.Utils.Array.Shuffle(keys);

  tiles = [];
  matchedTiles = 0;
  canClick = true;
  revealedTiles = [];

  const startX = TILE_SIZE * 0.5;
  const startY = TILE_SIZE * 0.5;
  const boxSize = TILE_SIZE - 14; // tile inner margin

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const idx = row * GRID_COLS + col;
      const key = keys[idx];
      const x = startX + col * TILE_SIZE;
      const y = startY + row * TILE_SIZE;

      // Draw a white rounded rectangle as the background for each tile
      this.add.rectangle(x, y, boxSize, boxSize, 0xffffff, 1)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(2, 0xcccccc);

      // Place the sprite on top
      const sprite = this.add.image(x, y, 'tile_back')
        .setInteractive()
        .setOrigin(0.5, 0.5);

      // Fit the sprite within the tile box WHILE PRESERVING ASPECT RATIO
      fitSprite(sprite, boxSize, boxSize);

      const tile = {
        row, col, key,
        revealed: false,
        matched: false,
        sprite
      };

      sprite.on('pointerdown', () => onTileClicked.call(this, tile));
      tiles.push(tile);
    }
  }
}

function fitSprite(sprite, maxW, maxH) {
  // Only call after the texture is loaded!
  const frame = sprite.texture.getSourceImage();
  if (!frame) return;

  const iw = frame.width;
  const ih = frame.height;
  const scale = Math.min(maxW / iw, maxH / ih);
  sprite.setScale(scale);
}

function onTileClicked(tile) {
  if (!canClick || tile.revealed || tile.matched) return;

  tile.revealed = true;
  tile.sprite.setTexture(tile.key);
  fitSprite(tile.sprite, TILE_SIZE - 14, TILE_SIZE - 14);

  revealedTiles.push(tile);

  if (revealedTiles.length === 2) {
    canClick = false;
    const [a, b] = revealedTiles;
    if (a.key === b.key) {
      a.matched = b.matched = true;
      matchedTiles += 2;
      revealedTiles = [];
      canClick = true;
      if (matchedTiles === tiles.length) {
        setTimeout(() => alert('You win!'), 300);
      }
    } else {
      setTimeout(() => {
        a.revealed = b.revealed = false;
        a.sprite.setTexture('tile_back');
        fitSprite(a.sprite, TILE_SIZE - 14, TILE_SIZE - 14);

        b.sprite.setTexture('tile_back');
        fitSprite(b.sprite, TILE_SIZE - 14, TILE_SIZE - 14);

        revealedTiles = [];
        canClick = true;
      }, 900);
    }
  }
}

export default new Phaser.Game(config);
