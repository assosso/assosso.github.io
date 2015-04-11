/// <reference path="lib/phaser.comments.d.ts" />

module Assosso {
  const monsterSpeed: number = 150;

  function createPlayer(game: Phaser.Game): Phaser.Sprite {
    var player = game.add.sprite(500, 320, 'bob');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    var playerBody: Phaser.Physics.Arcade.Body = player.body;
    playerBody.collideWorldBounds = true;
    playerBody.gravity.y = 1000;
    playerBody.maxVelocity.y = 500;
    playerBody.setSize(50, 120, 20, 10);

    player.animations.add('right', [0, 1, 2], 10, true);
    player.animations.add('jump', [3], 10, false);

    player.animations.play('right');

    return player;
  }

  function createMonster(game: Phaser.Game): Phaser.Sprite {
    var monster = game.add.sprite(100, 400, 'monster');
    game.physics.enable(monster, Phaser.Physics.ARCADE);

    monster.animations.add('right', [0, 1, 2], 10, true);

    monster.animations.play('right');

    var monsterBody: Phaser.Physics.Arcade.Body = monster.body;
    monsterBody.velocity.x = monsterSpeed;
    monsterBody.allowGravity = false;

    return monster;
  }

  class AssossoGame {
    game: Phaser.Game;
    player: Phaser.Sprite;
    monster: Phaser.Sprite;
    facing: string = 'right';
    jumpTimer: number = 0;
    cursors: Phaser.CursorKeys;
    jumpButton: Phaser.Key;
    rightButton: Phaser.Key;
    leftButton: Phaser.Key;

    start() {
      this.game = new Phaser.Game(1000, 600, Phaser.CANVAS, 'Assosso', {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this),
        render: this.render.bind(this)
      });
     }

    preload() {
      this.game.load.spritesheet('bob', 'asset/sprite_perso_run.png', 92, 130)
        .spritesheet('monster', 'asset/sprite_monster_run.png', 240, 222)
        .image('stalactite', 'asset/scenery/decor_stalactite.png');
    }

    create() {
      this.game.world.setBounds(0, 0, 24000, 600);

      this.game.stage.backgroundColor = 'rgb(32,38,51)';

      this.game.add.tileSprite(0, 0, this.game.world.bounds.width, this.game.world.bounds.height, 'stalactite');

      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.game.physics.arcade.gravity.y = 300;

      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

      this.player = createPlayer(this.game);

      this.monster = createMonster(this.game);

    }

    update() {

      // this.game.physics.arcade.collide(this.player, this.layer);
      this.game.camera.x = this.monster.x + 20;

      this.player.body.velocity.x = monsterSpeed * 0.9;

      if (this.player.body.onFloor()) {
        this.player.animations.play('right');
      } else {
        this.player.animations.play('jump');
      }

      if (this.jumpButton.isDown && this.player.body.onFloor() && this.game.time.now > this.jumpTimer) {
        this.player.body.velocity.y = -500;
        this.jumpTimer = this.game.time.now + 750;
      }

      if (this.rightButton.isDown) {
        this.player.body.velocity.x = 300;
      }

    }

    render () {

      // this.game.debug.text(this.player.body.onFloor(), 32, 32);
      // this.game.debug.body(this.player);
      // this.game.debug.bodyInfo(this.player, 16, 24);

    }
  }

  new AssossoGame().start();

}
