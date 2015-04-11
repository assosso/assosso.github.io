/// <reference path="lib/phaser.comments.d.ts" />

module Assosso {
  var game = new Phaser.Game(1000, 600, Phaser.CANVAS, 'Assosso',
   { preload: preload, create: create, update: update, render: render });

  function preload() {

    game.load.spritesheet('bob', 'asset/sprite_perso_run.png', 92, 130);

    game.load.image('background', 'background2.png');

  }

  var player: Phaser.Sprite;
  var facing: string = 'right';
  var jumpTimer: number = 0;
  var cursors: Phaser.CursorKeys;
  var jumpButton: Phaser.Key;
  var rightButton: Phaser.Key;
  var leftButton: Phaser.Key;

  function create() {
    game.world.setBounds(0, 0, 24000, 600);

    game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.physics.arcade.gravity.y = 300;

    player = game.add.sprite(500, 320, 'bob');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 1000;
    player.body.maxVelocity.y = 500;
    player.body.setSize(92, 130, 0, 0);

    player.animations.add('right', [0, 1, 2], 10, true);
    player.animations.add('jump', [3], 10, false);

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
      player.animations.play('jump');
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

}
