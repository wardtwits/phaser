import './style.css';
import Phaser from 'phaser';

const GRID_ROWS = 4;
const GRID_COLS = 4;
const TILE_SIZE = 120;

const GAME_WIDTH = GRID_COLS * TILE_SIZE;
const GAME_HEIGHT = GRID_ROWS * TILE_SIZE;

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
  for (let i = 1; i <= 8; i++) {
    this.load.image(`tile${i}`, `/tile${i}.png`);
  }
  this.load.image('tile_back', '/tile_back.png');
  this.load.image('tile_back_hover', '/tile_back_hover.png'); // <-- Add hover image
}

function create() {
  let keys = tileKeys.concat(tileKeys);
  Phaser.Utils.Array.Shuffle(keys);

  tiles = [];
  matchedTiles = 0;
  canClick = true;
  revealedTiles = [];

  const boxSize = TILE_SIZE - 14;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const idx = row * GRID_COLS + col;
      const key = keys[idx];
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;

      this.add.rectangle(x, y, boxSize, boxSize, 0xffffff, 1)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(2, 0xcccccc);

      const sprite = this.add.image(x, y, 'tile_back')
        .setInteractive({ useHandCursor: true }) // ensures pointer events and hand cursor
        .setOrigin(0.5, 0.5);

      fitSprite(this, sprite, 'tile_back', boxSize, boxSize);

      const tile = {
        row, col, key,
        revealed: false,
        matched: false,
        sprite
      };

      // --- Hover effect ---
     sprite.on('pointerover', () => {
  if (!tile.revealed && !tile.matched) {
    sprite.setTexture('tile_back_hover');
    fitSprite(this, sprite, 'tile_back_hover', boxSize, boxSize);
    this.game.canvas.style.cursor = 'url("/cursor.png") 0 0, pointer';
  }
});
sprite.on('pointerout', () => {
  if (!tile.revealed && !tile.matched) {
    sprite.setTexture('tile_back');
    fitSprite(this, sprite, 'tile_back', boxSize, boxSize);
    this.game.canvas.style.cursor = 'url("/cursor.png") 0 0, pointer';
  }
});
 
sprite.on('pointerdown', () => onTileClicked.call(this, tile));
      tiles.push(tile);
    }
  }
}

function fitSprite(scene, sprite, textureKey, maxW, maxH) {
  // Ensures the image fits within maxW x maxH, preserving aspect ratio
  const tex = scene.textures.get(textureKey);
  if (!tex || !tex.source[0]) return;

  const iw = tex.source[0].width;
  const ih = tex.source[0].height;
  const scale = Math.min(maxW / iw, maxH / ih, 1);
  sprite.setScale(scale);
}

function onTileClicked(tile) {
  if (!canClick || tile.revealed || tile.matched) return;

  tile.revealed = true;
  tile.sprite.setTexture(tile.key);
  fitSprite(this, tile.sprite, tile.key, TILE_SIZE - 14, TILE_SIZE - 14);

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
        fitSprite(this, a.sprite, 'tile_back', TILE_SIZE - 14, TILE_SIZE - 14);
        b.sprite.setTexture('tile_back');
        fitSprite(this, b.sprite, 'tile_back', TILE_SIZE - 14, TILE_SIZE - 14);
        revealedTiles = [];
        canClick = true;
      }, 900);
    }
  }
}

export default new Phaser.Game(config);
