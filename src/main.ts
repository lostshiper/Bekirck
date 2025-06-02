import 'phaser';

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
let collectors: Phaser.Physics.Arcade.Group;
let priceText: Phaser.GameObjects.Text;
let scoreText: Phaser.GameObjects.Text;
let gameOver: boolean = false;
let score: number = 0;
let breadPrice = 40;
let gameTimer: number = 0;

const game = new Phaser.Game(config);

function preload(this: Phaser.Scene) {
  // No assets to preload since we're using primitive shapes
}

function create(this: Phaser.Scene) {
  // Add ground platform
  platforms = this.physics.add.staticGroup();
  platforms.add(this.add.rectangle(400, 568, 800, 64, 0x00aa00).setOrigin(0.5));

  // Add player
  player = this.add.rectangle(100, 450, 32, 48, 0x00ff00) as any;
  this.physics.add.existing(player);
  player.body.setBounce(0.2);
  player.body.setCollideWorldBounds(true);

  // Add collectors (debt collectors chasing the player)
  collectors = this.physics.add.group();
  spawnCollector(this);

  // Add collisions
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(collectors, platforms);
  this.physics.add.collider(player, collectors, handleCollectorCollision, undefined, this);

  // Setup keyboard input
  cursors = this.input.keyboard.createCursorKeys();

  // Add game title and UI
  this.add.text(16, 16, 'Enflasyon Kaçkını', {
    fontSize: '32px',
    color: '#fff'
  });

  priceText = this.add.text(16, 56, `Ekmek: ${breadPrice} TL`, {
    fontSize: '24px',
    color: '#fff'
  });

  scoreText = this.add.text(16, 96, `Kaçış Süresi: ${score} saniye`, {
    fontSize: '24px',
    color: '#fff'
  });
}

function update(this: Phaser.Scene) {
  if (gameOver) {
    return;
  }

  // Player movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(160);
  } else {
    player.body.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.setVelocityY(-330);
  }

  // Update collectors movement
  collectors.children.iterate((collector: any) => {
    // Move collectors towards player
    const directionX = player.x - collector.x;
    const directionY = player.y - collector.y;
    const speed = 100;
    
    collector.body.setVelocityX(directionX > 0 ? speed : -speed);
    if (directionY < 0 && collector.body.touching.down) {
      collector.body.setVelocityY(-200);
    }
  });

  // Spawn new collectors periodically
  gameTimer += 1;
  if (gameTimer % 300 === 0) { // Every 5 seconds
    spawnCollector(this);
    breadPrice = Math.floor(breadPrice * (1 + Math.random() * 0.5));
    priceText.setText(`Ekmek: ${breadPrice} TL`);
  }

  // Update score (survival time)
  if (gameTimer % 60 === 0) { // Every second
    score += 1;
    scoreText.setText(`Kaçış Süresi: ${score} saniye`);
  }
}

function spawnCollector(scene: Phaser.Scene) {
  const x = Phaser.Math.Between(0, 800);
  const collector = scene.add.rectangle(x, 0, 32, 48, 0xff0000);
  collectors.add(collector);
  collector.body.setBounce(0.2);
  collector.body.setCollideWorldBounds(true);
}

function handleCollectorCollision(player: any, collector: any) {
  this.physics.pause();
  gameOver = true;

  const gameOverText = this.add.text(400, 300, 'Yakalandın!\nTekrar denemek için F5', {
    fontSize: '48px',
    color: '#ff0000',
    align: 'center'
  }).setOrigin(0.5);
}