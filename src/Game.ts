/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {
  const monsterSpeed: number = 350;
  const levelWidth: number = 24000;
  const levelHeight: number = 600;
  const frontFactor: number = -0.1;
  const obstacleData: any[] = [
    { key: "obstacle_jump0" },
    { key: "obstacle_jump1" },
    { key: "obstacle_jump2" }
  ];
  const lampOffset: Phaser.Point = new Phaser.Point(72, 25);
  const lampAngle: number = 2.5;
  const lampDistance: number = 200;
  const lampFrameOffsets: number[] = [0, 3, 0, -2];
  const obstacleInterval: number = 900;
  const obstacleVariation: number = 100;

  function createPlayer(game: Phaser.Game): Phaser.Sprite {
    var player = game.add.sprite(600, 0, 'bob');
    player.y = levelHeight - player.height;
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

    monster.animations.add('right', null, 10, true);

    monster.animations.play('right');

    var monsterBody: Phaser.Physics.Arcade.Body = monster.body;
    monsterBody.velocity.x = monsterSpeed;
    monsterBody.allowGravity = false;
    monsterBody.setSize(390, 350, 0, 60);

    return monster;
  }

  function createObstacles(game: Phaser.Game) {
      var obstacles = game.add.physicsGroup(Phaser.Physics.ARCADE);
      _.range(0, levelWidth, obstacleInterval).forEach(
        x => {
          var data = _.sample(obstacleData);
          var obstacle = obstacles.create(x + _.random(-obstacleVariation/2, obstacleVariation/2), 0,
                                          data.key);
          obstacle.body.immovable = true;
          obstacle.body.allowGravity = false;
          obstacle.y = levelHeight - obstacle.height;
          obstacle.animations.add('clap', null, 10, true);
          obstacle.animations.play('clap');
        }
      );
      return obstacles;
  }

  export class Game extends Phaser.State {
    player: Phaser.Sprite;
    monster: Phaser.Sprite;
    facing: string = 'right';
    slowDownUntil: number = 0;
    jumping: boolean = false;
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
      load.pack('main', 'asset/assets.json');

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

      this.obstacles = createObstacles(this.game);

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

      this.physics.arcade.overlap(this.player, this.obstacles, (p, obstacle) => {
        obstacle.destroy();
        this.slowDownUntil = this.time.now + 100;
      });

      this.camera.x = this.monster.x + 120;
      this.grotteFond.x = this.camera.x * 0.1;
      this.grotte.x = this.camera.x * 0.0;
      this.front.x = this.camera.x * frontFactor;


      if (this.player.body.onFloor()) {
        if (this.jumping) {
          this.player.body.velocity.x = monsterSpeed * 0.5;
          this.slowDownUntil = this.time.now + 500;
          this.jumping = false;
        }

        var velocityX = 0;
        if (this.time.now <= this.slowDownUntil) {
          velocityX = monsterSpeed * 0.0;
          this.player.animations.stop();
          this.player.frame = 1;
        } else {
          velocityX = monsterSpeed * (this.rightButton.isDown?1.2:1);
          this.player.animations.play('right');
        }

        this.player.body.velocity.x = velocityX;
      } else {
        this.player.animations.play('jump');
      }

      if (this.jumpButton.isDown && this.player.body.onFloor()) {
        this.player.body.velocity.x = monsterSpeed * 1.7;
        this.player.body.velocity.y = -500;
        this.jumping = true;
        this.leSon.footStep();
      }


      this.lamp.y = lampFrameOffsets[this.player.frame];
    }

    render () {

    // this.game.debug.text(this.game.time.fpsMax.toString(), 32, 32);
    //  this.obstacles.forEach(this.game.debug.body, this.game.debug, false, 'green', false);
      // this.game.debug.body(this.monster);
      // this.game.debug.bodyInfo(this.player, 16, 24);

    }
  }
}
