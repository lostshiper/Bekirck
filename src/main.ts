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

// Game variables
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let platforms: Phaser.Physics.Arcade.StaticGroup;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let priceText: Phaser.GameObjects.Text;
let breadPrice = 40;
let gameTimer: number = 0;

// Initialize the game
const game = new Phaser.Game(config);

// Preload game assets
function preload(this: Phaser.Scene) {
  // No assets to preload since we're using primitive shapes
}

// Create game objects
function create(this: Phaser.Scene) {
  // Add platforms
  platforms = this.physics.add.staticGroup();
  
  // Create ground
  platforms.add(this.add.rectangle(400, 568, 800, 64, 0x00aa00).setOrigin(0.5));
  
  // Create some floating platforms
  platforms.add(this.add.rectangle(600, 400, 200, 20, 0x00aa00));
  platforms.add(this.add.rectangle(200, 300, 200, 20, 0x00aa00));
  platforms.add(this.add.rectangle(400, 200, 200, 20, 0x00aa00));

  // Add player
  player = this.add.rectangle(100, 450, 32, 48, 0x00ff00) as any;
  this.physics.add.existing(player);
  
  // Player physics properties
  player.body.setBounce(0.2);
  player.body.setCollideWorldBounds(true);
  
  // Add collision between player and platforms
  this.physics.add.collider(player, platforms);
  
  // Setup keyboard input
  cursors = this.input.keyboard.createCursorKeys();
  
  // Add game title
  this.add.text(16, 16, 'Enflasyon Kaçkını', {
    fontSize: '32px',
    color: '#fff'
  });
  
  // Add price display that will update
  priceText = this.add.text(16, 56, `Ekmek: ${breadPrice} TL`, {
    fontSize: '24px',
    color: '#fff'
  });
}

// Update game logic
function update(this: Phaser.Scene, time: number) {
  // Player movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(160);
  } else {
    player.body.setVelocityX(0);
  }

  // Player jump
  if (cursors.up.isDown && player.body.touching.down) {
    player.body.setVelocityY(-330);
  }

  // Update bread price every 3 seconds
  gameTimer += 1;
  if (gameTimer % 180 === 0) { // 60fps * 3 seconds = 180 frames
    breadPrice = Math.floor(breadPrice * (1 + Math.random() * 0.5)); // Increase by up to 50%
    priceText.setText(`Ekmek: ${breadPrice} TL`);
  }
}