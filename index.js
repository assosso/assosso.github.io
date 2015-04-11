var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Assosso',
 { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.spritesheet('dude', 'dude.png', 32, 48);
  game.load.image('background', 'background2.png');

}

var player;
var facing = 'right';
var jumpTimer = 0;
var cursors;
var jumpButton;
var leftButton;
var rightButton;

function create() {

  game.world.setBounds(0, 0, 24000, 600);

  game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');

  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.physics.arcade.gravity.y = 300;

  player = game.add.sprite(500, 320, 'dude');
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.collideWorldBounds = true;
  player.body.gravity.y = 1000;
  player.body.maxVelocity.y = 500;
  player.body.setSize(20, 32, 5, 16);

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  leftButton = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  rightButton = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  
  player.animations.play('right');
}

function update() {

  // game.physics.arcade.collide(player, layer);
  game.camera.x = player.x - 300;

  player.body.velocity.x = 150;

  if (player.body.onFloor()) {
    player.animations.play('right');
  } else {
    player.animations.stop();
  }

  if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
    player.body.velocity.y = -500;
    jumpTimer = game.time.now + 750;
  }

  if (rightButton.isDown) {
    player.body.velocity.x = 300;
  }

}

function render () {

  // game.debug.text(game.time.physicsElapsed, 32, 32);
  // game.debug.body(player);
  // game.debug.bodyInfo(player, 16, 24);

}
