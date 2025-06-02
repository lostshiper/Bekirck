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
let bullets: Phaser.Physics.Arcade.Group;
let priceText: Phaser.GameObjects.Text;
let scoreText: Phaser.GameObjects.Text;
let ammoText: Phaser.GameObjects.Text;
let gameOver: boolean = false;
let score: number = 0;
let breadPrice = 40;
let gameTimer: number = 0;
let ammo: number = 10;
let spaceKey: Phaser.Input.Keyboard.Key;
let lastShootTime: number = 0;

const game = new Phaser.Game(config);

function preload(this: Phaser.Scene) {
  // Load game assets
  this.load.setBaseURL('https://labs.phaser.io');
  this.load.image('sky', 'assets/skies/space3.jpg');
  this.load.image('player', 'assets/sprites/phaser-dude.png');
  this.load.image('bullet', 'assets/sprites/bullets/bullet7.png');
}

function create(this: Phaser.Scene) {
  // Add background
  this.add.image(400, 300, 'sky');

  // Add ground platform
  platforms = this.physics.add.staticGroup();
  platforms.add(this.add.rectangle(400, 568, 800, 64, 0x00aa00).setOrigin(0.5));

  // Add player with sprite
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Create bullets group
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10
  });

  // Add collectors (ampül shaped)
  collectors = this.physics.add.group();
  spawnCollector(this);

  // Add collisions
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(collectors, platforms);
  this.physics.add.collider(player, collectors, handleCollectorCollision, undefined, this);
  this.physics.add.collider(bullets, collectors, handleBulletCollision, undefined, this);

  // Setup keyboard input
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Add game title and UI
  this.add.text(16, 16, 'Enflasyon Kaçkını', {
    fontSize: '32px',
    color: '#fff'
  });

  priceText = this.add.text(16, 56, `Ekmek: ${breadPrice} TL`, {
    fontSize: '24px',
    color: '#fff'
  });

  scoreText = this.add.text(16, 96, `Puan: ${score}`, {
    fontSize: '24px',
    color: '#fff'
  });

  ammoText = this.add.text(16, 136, `Mermi: ${ammo}`, {
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
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  // Shooting mechanics
  if (spaceKey.isDown && ammo > 0 && this.time.now > lastShootTime + 500) {
    const bullet = bullets.create(player.x, player.y, 'bullet');
    if (bullet) {
      bullet.setVelocityX(400);
      ammo--;
      ammoText.setText(`Mermi: ${ammo}`);
      lastShootTime = this.time.now;
    }
  }

  // Update collectors movement
  collectors.children.iterate((collector: any) => {
    // Create ampül shape
    if (!collector.ampulShape) {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xffff00);
      graphics.fillStyle(0xff0000);
      
      // Draw ampül shape
      graphics.beginPath();
      graphics.arc(collector.x, collector.y, 16, 0, Math.PI * 2);
      graphics.lineTo(collector.x, collector.y + 20);
      graphics.fill();
      graphics.stroke();
      
      collector.ampulShape = graphics;
    }
    
    // Update ampül shape position
    collector.ampulShape.x = collector.x;
    collector.ampulShape.y = collector.y;

    // Move collectors towards player
    const directionX = player.x - collector.x;
    const directionY = player.y - collector.y;
    const speed = 80;
    
    collector.body.setVelocityX(directionX > 0 ? speed : -speed);
    if (directionY < 0 && collector.body.touching.down) {
      collector.body.setVelocityY(-200);
    }
  });

  // Spawn new collectors and update prices
  gameTimer += 1;
  if (gameTimer % 300 === 0) {
    spawnCollector(this);
    breadPrice = Math.floor(breadPrice * (1 + Math.random() * 0.5));
    priceText.setText(`Ekmek: ${breadPrice} TL`);
    
    // Add ammo periodically
    ammo = Math.min(ammo + 5, 10);
    ammoText.setText(`Mermi: ${ammo}`);
  }

  // Update score
  if (gameTimer % 60 === 0) {
    score += 10;
    scoreText.setText(`Puan: ${score}`);
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

function handleBulletCollision(bullet: any, collector: any) {
  bullet.destroy();
  collector.destroy();
  if (collector.ampulShape) {
    collector.ampulShape.destroy();
  }
  score += 50;
  scoreText.setText(`Puan: ${score}`);
}