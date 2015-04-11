/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {
  const monsterSpeed: number = 250;
  const levelWidth: number = 24000;
  const levelHeight: number = 600;
  const frontFactor: number = -0.1;
  const obstacleSheets: any[] = [
    { width: 105, height: 73, frames: [0, 1] },
    { width: 159, height: 56 },
    { width: 44,  height: 76 }
  ];
  const lampOffset: Phaser.Point = new Phaser.Point(72, 25);
  const lampAngle: number = 2.5;
  const lampDistance: number = 200;
  const lampFrameOffsets: number[] = [0, 3, 0, -2];
  const obstacleInterval: number = 300;
  const obstacleVariation: number = 100;

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
    var monster = game.add.sprite(0, 0, 'monster');
    monster.y = levelHeight - monster.height + 20;
    game.physics.enable(monster, Phaser.Physics.ARCADE);

    monster.animations.add('right', _.range(6), 10, true);

    monster.animations.play('right');

    var monsterBody: Phaser.Physics.Arcade.Body = monster.body;
    monsterBody.velocity.x = monsterSpeed;
    monsterBody.allowGravity = false;
    monsterBody.setSize(390, 350, 0, 60);

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
    obstacles: Phaser.Group;
    front: Phaser.Group;
    leSon: Assosso.Son;
    lamp: Phaser.Group;

    preload() {
      var load = this.load;
      load.spritesheet('bob', 'asset/sprite_perso_run.png', 92, 130)
        .spritesheet('monster', 'asset/sprite_monster_run.png', 476, 444)
        .image('stalactite', 'asset/scenery/decor_stalactite.png');

      obstacleSheets.forEach(
        (sheet, i) => {
          sheet.name = 'obstacle_jump' + i;
          load.spritesheet(sheet.name, 'asset/obstacles/obstacle_jump' + i + '.png',
                           sheet.width, sheet.height);
        }
      );

      _.range(4).forEach(
        i => load.image('grotte' + i, 'asset/scenery/background_grotte' + i + '.png')
      );
      _.range(5).forEach(
        i => load.image('grotteFond' + i, 'asset/scenery/background_grotte_fond' + i + '.png')
      );

      this.leSon = new Son(this);
      this.leSon.preload();

    }

    drawLamp(fill: number, alpha: number): PIXI.Graphics {
      var gfx = this.add.graphics(lampOffset.x, lampOffset.y);
      gfx.beginFill(fill, alpha);
      gfx.arc(0, 0, lampDistance, -lampAngle/4, lampAngle/2, false);
      gfx.lineTo(0, 0);
      gfx.lineTo(0, -10);
      return gfx;
    }

    create() {
      this.world.setBounds(0, 0, levelWidth, levelHeight);

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

      this.obstacles = add.group();
      _.range(0, levelWidth, 300).forEach(
        x => {
          var sheet = _.sample(obstacleSheets);
          var obstacle = add.sprite(x + _.random(-obstacleVariation/2, obstacleVariation/2), 0,
              sheet.name, undefined, this.obstacles);
          obstacle.y = levelHeight - obstacle.height;
          if (sheet.frames) {
            obstacle.animations.add('clap', sheet.frames, 10, true);
            obstacle.animations.play('clap');
          }
        }
      );

      this.player = createPlayer(this.game);

      this.lamp = add.group();

      var lampMask = this.drawLamp(0xffffff, 1);

      this.lamp.addChild(lampMask);

      this.obstacles.mask = lampMask;

      var beam = this.drawLamp(0xffff00, 0.2);

      this.lamp.addChild(beam);

      this.player.addChild(this.lamp);

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

      this.lamp.y = lampFrameOffsets[this.player.frame];
    }

    render () {

      // this.game.debug.text(this.player.body.onFloor(), 32, 32);
      // this.game.debug.body(this.monster);
      // this.game.debug.bodyInfo(this.player, 16, 24);

    }
  }
}
