/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Assosso;
(function (Assosso) {
    ;
    ;
    Assosso.param;
    function setBodySize(sprite, bodySize) {
        sprite.body.setSize(bodySize.width, bodySize.height, bodySize.x, bodySize.y);
    }
    function createAnimations(sprite, animations) {
        animations.forEach(function (anim) { return sprite.animations.add(anim.key, anim.frames, anim.frameRate, anim.loop); });
    }
    function createPlayer(game) {
        var player = game.add.sprite(Assosso.param.playerStartX, 0, 'perso');
        player.y = Assosso.param.levelHeight - player.height;
        game.physics.enable(player, Phaser.Physics.ARCADE);
        var playerBody = player.body;
        playerBody.collideWorldBounds = true;
        createAnimations(player, Assosso.param.playerAnimations);
        player.animations.play('right');
        setBodySize(player, Assosso.param.playerBodySizes['run']);
        return player;
    }
    function createMonster(game) {
        var monster = game.add.sprite(0, 0, 'monster');
        monster.y = Assosso.param.levelHeight - monster.height + Assosso.param.monsterPosition.y;
        game.physics.enable(monster, Phaser.Physics.ARCADE);
        createAnimations(monster, Assosso.param.monsterAnimations);
        monster.animations.play('right');
        var monsterBody = monster.body;
        monsterBody.allowGravity = false;
        setBodySize(monster, Assosso.param.monsterBodySize);
        return monster;
    }
    function generateXPositions(config, callback) {
        _.range(config.x0, Assosso.param.levelWidth, config.deltaX).forEach(function (x) { return callback(x + _.random(-config.variation / 2, config.variation / 2)); });
    }
    function createObstacles(game) {
        var obstacles = game.add.physicsGroup(Phaser.Physics.ARCADE);
        generateXPositions(Assosso.param.obstaclePositionConfig, function (x) {
            var type = _.sample(Assosso.param.obstacleTypes);
            var obstacle = obstacles.create(x, 0, type.assetKey);
            obstacle.body.immovable = true;
            obstacle.body.allowGravity = false;
            obstacle.y = Assosso.param.levelHeight - obstacle.height - ~~type.altitude;
            if (type.animation) {
                createAnimations(obstacle, [type.animation]);
                obstacle.animations.play(type.animation.key);
            }
            setBodySize(obstacle, type.bodySize);
            obstacle.obstacleType = type;
        });
        return obstacles;
    }
    function createBackground(game, data) {
        var group = game.add.group(null);
        group.classType = Phaser.Image;
        var assetRE = new RegExp(data.assetRegExp);
        var keys = game.cache.getKeys(Phaser.Cache.IMAGE).filter(function (k) { return k.match(assetRE); });
        generateXPositions(data.positionConfig, function (x) { return group.create(x, 0, _.sample(keys)); });
        game.world.addAt(group, data.inFront ? game.world.children.length : 0);
        data.group = group;
        return group;
    }
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);
            this.slowDownUntil = 0;
            this.jumping = false;
            this.slidingUntil = 0;
            this.noSlideUntil = 0;
        }
        Game.prototype.preload = function () {
            this.load.pack('main', 'asset/assets.json');
            this.load.json('param', 'asset/param.json');
            this.leSon = new Assosso.Son(this);
            this.leSon.preload();
        };
        Game.prototype.drawLamp = function (fill, alpha) {
            var gfx = this.add.graphics(Assosso.param.lampOffset.x, Assosso.param.lampOffset.y);
            gfx.beginFill(fill, alpha);
            gfx.arc(0, 0, Assosso.param.lampDistance, Assosso.param.lampAngle.min, Assosso.param.lampAngle.max, false);
            gfx.lineTo(0, 0);
            gfx.lineTo(0, -10);
            return gfx;
        };
        Game.prototype.createLamp = function () {
            var lamp = this.add.group();
            var lampMask = this.drawLamp(0xffffff, 1);
            lamp.addChild(lampMask);
            lamp.lampMask = lampMask;
            var beam = this.drawLamp(parseInt(Assosso.param.lampColor), Assosso.param.lampAlpha);
            lamp.addChild(beam);
            return lamp;
        };
        Game.prototype.create = function () {
            var _this = this;
            Assosso.param = this.cache.getJSON('param');
            this.world.setBounds(0, 0, Assosso.param.levelWidth, Assosso.param.levelHeight);
            this.stage.backgroundColor = Assosso.param.backgroundColor;
            this.obstacles = createObstacles(this.game);
            this.player = createPlayer(this.game);
            this.lamp = this.createLamp();
            this.player.addChild(this.lamp);
            this.obstacles.mask = this.lamp.lampMask;
            this.monster = createMonster(this.game);
            Assosso.param.backgrounds.forEach(function (b) { return createBackground(_this.game, b); });
            this.obstacleDetector = this.add.sprite(0, 0, null);
            this.physics.enable(this.obstacleDetector, Phaser.Physics.ARCADE);
            this.obstacleDetector.body.setSize(Assosso.param.detectorWidth, Assosso.param.detectorHeight, Assosso.param.detectorOffset.x, Assosso.param.detectorOffset.y);
            this.obstacleDetector.body.moves = false;
            this.player.addChild(this.obstacleDetector);
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.physics.arcade.gravity.y = Assosso.param.gravity;
            this.cursors = this.input.keyboard.createCursorKeys();
            this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.slideButton = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leSon.create();
        };
        Game.prototype.update = function () {
            var _this = this;
            this.monster.body.velocity.x = Assosso.param.monsterSpeed;
            var sliding = this.time.now <= this.slidingUntil;
            setBodySize(this.player, Assosso.param.playerBodySizes[sliding ? "slide" : "run"]);
            this.physics.arcade.overlap(this.player, this.obstacles, function (p, obstacle) {
                obstacle.destroy();
                _this.slowDownUntil = _this.time.now + Assosso.param.obstacleSlowDownTime;
            });
            if (!this.physics.arcade.overlap(this.obstacleDetector, this.obstacles, function (detector, obstacle) {
                if (!obstacle.detected) {
                    _this.detectedObstacle = obstacle;
                    obstacle.detected = true;
                    _this.leSon.obstacle(obstacle);
                }
            })) {
                this.detectedObstacle = null;
            }
            this.camera.x = this.monster.x - Assosso.param.monsterPosition.x;
            Assosso.param.backgrounds.forEach(function (b) { return b.group.x = _this.camera.x * b.scrollMultiplier; });
            if (this.player.body.onFloor()) {
                if (this.jumping) {
                    this.slowDownUntil = this.time.now + Assosso.param.jumpSlowDownTime;
                    this.jumping = false;
                    this.player.animations.play('reception');
                }
                var velocityX = 0;
                if (this.time.now <= this.slowDownUntil) {
                    velocityX = 0;
                }
                else {
                    velocityX = Assosso.param.monsterSpeed * Assosso.param.runSpeed;
                    this.player.animations.play(sliding ? 'slide' : 'right');
                }
                this.player.body.velocity.x = velocityX;
            }
            else {
                this.player.animations.play('jump');
            }
            if (this.player.body.onFloor()) {
                if (this.jumpButton.isDown) {
                    this.player.body.velocity.x = Assosso.param.monsterSpeed * Assosso.param.jumpSpeedBoost;
                    this.player.body.velocity.y = Assosso.param.jumpYVelocity;
                    this.jumping = true;
                    this.leSon.footStep();
                }
                else if (this.slideButton.isDown && !sliding && this.time.now > this.noSlideUntil) {
                    this.slidingUntil = this.time.now + Assosso.param.slideTime;
                    this.noSlideUntil = this.slidingUntil + Assosso.param.slideCoolDown;
                    this.player.animations.play('slide');
                }
            }
            var lampFrameOffset = Assosso.param.lampFrameOffsets[this.player.frame];
            this.lamp.x = lampFrameOffset.x;
            this.lamp.y = lampFrameOffset.y;
        };
        Game.prototype.render = function () {
            if (Assosso.param.debug) {
                this.obstacles.forEach(this.game.debug.body, this.game.debug, false, 'green', false);
                this.game.debug.body(this.monster, 'red', false);
                this.game.debug.body(this.player, 'blue', false);
                this.game.debug.body(this.obstacleDetector, 'yellow', false);
            }
        };
        return Game;
    })(Phaser.State);
    Assosso.Game = Game;
})(Assosso || (Assosso = {}));
//# sourceMappingURL=Game.js.map