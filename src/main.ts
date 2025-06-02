import 'phaser';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Initialize the game
const game = new Phaser.Game(config);

// Preload game assets
function preload(this: Phaser.Scene) {
  // No assets to preload since we're using primitive shapes
}

// Create game objects
function create(this: Phaser.Scene) {
  // Add player
  const player = this.add.rectangle(400, 300, 32, 48, 0x00ff00);
  this.physics.add.existing(player, false);
  
  // Add some text
  this.add.text(16, 16, 'Enflasyon Kaçkını', {
    fontSize: '32px',
    color: '#fff'
  });
  
  // Add price display
  this.add.text(16, 56, 'Ekmek: 40 TL', {
    fontSize: '24px',
    color: '#fff'
  });
}

// Update game logic
function update(this: Phaser.Scene) {
  // Game loop logic will go here
}