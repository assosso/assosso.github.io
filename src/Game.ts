/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {
  const monsterSpeed: number = 250;
  const levelWidth: number = 24000;
  const frontFactor: number = -0.1;

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

  export class Game extends Phaser.State {
    player: Phaser.Sprite;
    monster: Phaser.Sprite;
    facing: string = 'right';
    jumpTimer: number = 0;
    cursors: Phaser.CursorKeys;
    jumpButton: Phaser.Key;
    rightButton: Phaser.Key;
    leftButton: Phaser.Key;
    grotte: Phaser.Group;
    grotteFond: Phaser.Group;
    front: Phaser.Group;
    leSon: Assosso.Son;

    preload() {
      var load = this.load;
      load.spritesheet('bob', 'asset/sprite_perso_run.png', 92, 130)
        .spritesheet('monster', 'asset/sprite_monster_run.png', 238, 222)
        .image('stalactite', 'asset/scenery/decor_stalactite.png');

      _.range(4).forEach(
        i => load.image('grotte' + i, 'asset/scenery/background_grotte' + i + '.png')
      );
      _.range(5).forEach(
        i => load.image('grotteFond' + i, 'asset/scenery/background_grotte_fond' + i + '.png')
      );

      this.leSon = new Son(this);
      this.leSon.preload();

    }

    create() {
      this.world.setBounds(0, 0, levelWidth, 600);

      this.stage.backgroundColor = 'rgb(32,38,51)';

      var add = this.add;

      this.grotteFond = add.group();
      _.range(300, levelWidth, 900).forEach(
        x => add.image(x, 0, 'grotteFond' + _.random(4), undefined, this.grotteFond)
      );

      this.grotte = add.group();
      _.range(0, levelWidth, 800).forEach(
        x => add.image(x, 0, 'grotte' + _.random(3), undefined, this.grotte)
      );

      this.player = createPlayer(this.game);

      this.monster = createMonster(this.game);

      this.front = add.group();
      add.tileSprite(0, 0, levelWidth * (1 - frontFactor), this.world.bounds.height, 'stalactite', undefined, this.front);

      this.physics.startSystem(Phaser.Physics.ARCADE);

      this.physics.arcade.gravity.y = 300;

      this.cursors = this.input.keyboard.createCursorKeys();
      this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

      this.leSon.create();

    }

    update() {

      // this.physics.arcade.collide(this.player, this.layer);
      this.camera.x = this.monster.x + 20;
      this.grotteFond.x = this.camera.x * 0.7;
      this.grotte.x = this.camera.x * 0.6;
      this.front.x = this.camera.x * frontFactor;

      this.player.body.velocity.x = monsterSpeed * 0.9;

      if (this.player.body.onFloor()) {
        this.player.animations.play('right');
      } else {
        this.player.animations.play('jump');
      }

      if (this.jumpButton.isDown && this.player.body.onFloor() && this.time.now > this.jumpTimer) {
        this.player.body.velocity.y = -500;
        this.jumpTimer = this.time.now + 150;
        this.leSon.footStep();
      }

      if (this.rightButton.isDown) {
        this.player.body.velocity.x = monsterSpeed * 1.2;
      }
    }

    render () {

      // this.game.debug.text(this.player.body.onFloor(), 32, 32);
      // this.game.debug.body(this.player);
      // this.game.debug.bodyInfo(this.player, 16, 24);

    }
  }
}
