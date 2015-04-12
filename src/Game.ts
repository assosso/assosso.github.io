/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {

  interface Point { x: number, y: number }
  interface BodySize { width: number, height: number, x: number, y: number };
  interface Animation { key: string, frames: number[], frameRate: number, loop: boolean };
  interface ObstacleType {
    assetKey: string,
    volume: number,
    action: string,
    actionVolume: number,
    altitude?: number,
    bodySize: BodySize,
    animation: Animation,
    audio?: Phaser.Sound,
    actionAudio?: Phaser.Sound,
    Nbplay?: number
  }
  interface PositionConfig {
    x0: number,
    deltaX: number,
    variation: number
  }
  interface BackgroundData {
    positionConfig: PositionConfig,
    assetRegExp: string,
    scrollMultiplier: number,
    inFront: boolean,
    group?: Phaser.Group
  }
  interface Param {
    gravity: number;
    monsterSpeed: number;
    monsterPosition: Point;
    playerStartX: number;
    runSpeed: number;
    playerBodySizes: { [key: string]: BodySize };
    playerAnimations: Animation[];
    monsterBodySize: BodySize;
    monsterAnimations: Animation[];
    levelWidth: number;
    levelHeight: number;
    backgroundColor: string;
    obstacleTypes: ObstacleType[];
    lampOffset: Point;
    lampAngle: {min: number, max: number};
    lampDistance: number;
    lampFrameOffsets: Point[];
    lampColor: string;
    lampAlpha: number;
    obstaclePositionConfig: PositionConfig;
    detectorOffset: Point;
    detectorWidth: number;
    detectorHeight: number;
    jumpYVelocity: number;
    jumpSpeedBoost: number;
    slideTime: number;
    slideCoolDown: number;
    obstacleSlowDownTime: number;
    jumpSlowDownTime: number;
    backgrounds: BackgroundData[];
    debug: boolean;
    musicVolume: number;
    footstepVolume: number;
  }
  export var param: Param;

  function setBodySize(sprite: Phaser.Sprite, bodySize: BodySize) {
    sprite.body.setSize(bodySize.width, bodySize.height, bodySize.x, bodySize.y);
  }

  function createAnimations(sprite: Phaser.Sprite, animations: Animation[]) {
    animations.forEach(
      anim => sprite.animations.add(anim.key, anim.frames, anim.frameRate, anim.loop)
    );
  }

  function createPlayer(game: Phaser.Game): Phaser.Sprite {
    var player = game.add.sprite(param.playerStartX, 0, 'perso');
    player.y = param.levelHeight - player.height;
    game.physics.enable(player, Phaser.Physics.ARCADE);

    var playerBody: Phaser.Physics.Arcade.Body = player.body;
    playerBody.collideWorldBounds = true;

    createAnimations(player, param.playerAnimations);

    player.animations.play('right');
    setBodySize(player, param.playerBodySizes['run']);

    return player;
  }

  function createMonster(game: Phaser.Game): Phaser.Sprite {
    var monster = game.add.sprite(0, 0, 'monster');
    monster.y = param.levelHeight - monster.height + param.monsterPosition.y;
    game.physics.enable(monster, Phaser.Physics.ARCADE);

    createAnimations(monster, param.monsterAnimations);

    monster.animations.play('right');

    var monsterBody: Phaser.Physics.Arcade.Body = monster.body;
    monsterBody.velocity.x = param.monsterSpeed;
    monsterBody.allowGravity = false;

    setBodySize(monster, param.monsterBodySize);

    return monster;
  }

  function generateXPositions(config, callback) {
    _.range(config.x0, param.levelWidth, config.deltaX).forEach(
      x => callback(x + _.random(-config.variation/2, config.variation/2))
    );
  }

  function createObstacles(game: Phaser.Game) {
      var obstacles = game.add.physicsGroup(Phaser.Physics.ARCADE);
      generateXPositions(param.obstaclePositionConfig,
        x => {
          var type = _.sample(param.obstacleTypes);

          var obstacle = obstacles.create(x, 0, type.assetKey);
          obstacle.body.immovable = true;
          obstacle.body.allowGravity = false;
          obstacle.y = param.levelHeight - obstacle.height - ~~type.altitude;
          if (type.animation) {
            createAnimations(obstacle, [type.animation]);
            obstacle.animations.play(type.animation.key);
          }
          setBodySize(obstacle, type.bodySize);
          obstacle.obstacleType = type;
        }
      );
      return obstacles;
  }

  function createBackground(game: Phaser.Game, data: BackgroundData) {
      var group = game.add.group(null);
      group.classType = Phaser.Image;
      var assetRE = new RegExp(data.assetRegExp);

      var keys: string[] = (<any>game.cache).getKeys(Phaser.Cache.IMAGE).filter(k => k.match(assetRE));
      generateXPositions(data.positionConfig,
        x => group.create(x, 0, _.sample(keys))
      );
      game.world.addAt(group, data.inFront ? game.world.children.length : 0);
      data.group = group;
      return group;
  }

  export class Game extends Phaser.State {
    player: Phaser.Sprite;
    monster: Phaser.Sprite;
    slowDownUntil: number = 0;
    jumping: boolean = false;
    slidingUntil: number = 0;
    noSlideUntil: number = 0;
    cursors: Phaser.CursorKeys;
    jumpButton: Phaser.Key;
    slideButton: Phaser.Key;
    leftButton: Phaser.Key;
    obstacles: Phaser.Group;
    leSon: Assosso.Son;
    lamp: Phaser.Group;
    obstacleDetector: Phaser.Sprite;
    detectedObstacle: Phaser.Sprite;

    preload() {
      this.load.pack('main', 'asset/assets.json');
      this.load.json('param', 'asset/param.json');

      this.leSon = new Son(this);
      this.leSon.preload();
    }

    drawLamp(fill: number, alpha: number): PIXI.Graphics {
      var gfx = this.add.graphics(param.lampOffset.x, param.lampOffset.y);
      gfx.beginFill(fill, alpha);
      gfx.arc(0, 0, param.lampDistance, param.lampAngle.min, param.lampAngle.max, false);
      gfx.lineTo(0, 0);
      gfx.lineTo(0, -10);
      return gfx;
    }

    createLamp() {
      var lamp = this.add.group();

      var lampMask = this.drawLamp(0xffffff, 1);
      lamp.addChild(lampMask);

      (<any>lamp).lampMask = lampMask;

      var beam = this.drawLamp(parseInt(param.lampColor), param.lampAlpha);

      lamp.addChild(beam);

      return lamp;
    }

    create() {
      Assosso.param = this.cache.getJSON('param');

      this.world.setBounds(0, 0, param.levelWidth, param.levelHeight);

      this.stage.backgroundColor = param.backgroundColor;

      this.obstacles = createObstacles(this.game);

      this.player = createPlayer(this.game);

      this.lamp = this.createLamp();

      this.player.addChild(this.lamp);

      this.obstacles.mask = (<any>this.lamp).lampMask;

      this.monster = createMonster(this.game);

      param.backgrounds.forEach((b)=>createBackground(this.game, b));

      this.obstacleDetector = this.add.sprite(0, 0, null);
      this.physics.enable(this.obstacleDetector, Phaser.Physics.ARCADE);
      this.obstacleDetector.body.setSize(param.detectorWidth, param.detectorHeight, param.detectorOffset.x, param.detectorOffset.y);
      this.obstacleDetector.body.moves = false;
      this.player.addChild(this.obstacleDetector);

      this.physics.startSystem(Phaser.Physics.ARCADE);

      this.physics.arcade.gravity.y = param.gravity;

      this.cursors = this.input.keyboard.createCursorKeys();
      this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.slideButton = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);

      this.leSon.create();
    }

    update() {

      var sliding = this.time.now <= this.slidingUntil;
      setBodySize(this.player, param.playerBodySizes[sliding ? "slide" : "run"]);

      this.physics.arcade.overlap(this.player, this.obstacles, (p, obstacle) => {
        obstacle.destroy();
        this.slowDownUntil = this.time.now + param.obstacleSlowDownTime;
      });

      if (!this.physics.arcade.overlap(this.obstacleDetector, this.obstacles, (detector, obstacle) => {
        if (!obstacle.detected) {
          this.detectedObstacle = obstacle;
          obstacle.detected = true;
          this.leSon.obstacle(obstacle);
        }
      })) {
        this.detectedObstacle = null;
      }

      this.camera.x = this.monster.x - param.monsterPosition.x;

      param.backgrounds.forEach((b)=>b.group.x = this.camera.x * b.scrollMultiplier);

      if (this.player.body.onFloor()) {
        if (this.jumping) {
          this.slowDownUntil = this.time.now + param.jumpSlowDownTime;
          this.jumping = false;
          this.player.animations.play('reception');
        }

        var velocityX = 0;
        if (this.time.now <= this.slowDownUntil) {
          velocityX = 0;
        } else {
          velocityX = param.monsterSpeed * param.runSpeed;
          this.player.animations.play(sliding ? 'slide' : 'right');
        }

        this.player.body.velocity.x = velocityX;
      } else {
        this.player.animations.play('jump');
      }

      if (this.player.body.onFloor()) {
        if (this.jumpButton.isDown) {
          this.player.body.velocity.x = param.monsterSpeed * param.jumpSpeedBoost;
          this.player.body.velocity.y = param.jumpYVelocity;
          this.jumping = true;
          this.leSon.footStep();
        } else if (this.slideButton.isDown && !sliding && this.time.now > this.noSlideUntil) {
          this.slidingUntil = this.time.now + param.slideTime;
          this.noSlideUntil = this.slidingUntil + param.slideCoolDown;
          this.player.animations.play('slide');
        }
      }

      var lampFrameOffset = param.lampFrameOffsets[this.player.frame];
      this.lamp.x = lampFrameOffset.x;
      this.lamp.y = lampFrameOffset.y;
    }

    render () {

      if (param.debug) {
        this.obstacles.forEach(this.game.debug.body, this.game.debug, false, 'green', false);
        this.game.debug.body(this.monster, 'red', false);
        this.game.debug.body(this.player, 'blue', false);
        this.game.debug.body(this.obstacleDetector, 'yellow', false);
        //this.game.debug.bodyInfo(this.player, 16, 24);
      }

    }
  }
}
