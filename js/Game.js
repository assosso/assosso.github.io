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
    function createDeaths(game) {
        var deaths = {};
        Assosso.param.obstacleTypes.forEach(function (type) {
            type.deathSprite = game.make.sprite(0, 0, 'death_' + type.assetKey);
            type.deathSprite.animations.add('death', null, Assosso.param.deathAnimationFrameRate, true);
        });
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
            this.dead = false;
            this.slowDownUntil = 0;
            this.jumping = false;
            this.slidingUntil = 0;
            this.noSlideUntil = 0;
            this.swipeCommand = null;
        }
        Game.prototype.preload = function () {
            if (this.cache.checkJSONKey('param'))
                return;
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
            this.dead = false;
            this.slowDownUntil = 0;
            this.jumping = false;
            this.slidingUntil = 0;
            this.noSlideUntil = 0;
            Assosso.param = _.cloneDeep(this.cache.getJSON('param'));
            this.world.setBounds(0, 0, Assosso.param.levelWidth, Assosso.param.levelHeight);
            this.stage.backgroundColor = Assosso.param.backgroundColor;
            this.obstacles = createObstacles(this.game);
            this.player = createPlayer(this.game);
            this.lamp = this.createLamp();
            this.player.addChild(this.lamp);
            this.obstacles.mask = this.lamp.lampMask;
            this.monster = createMonster(this.game);
            this.backgrounds = Assosso.param.backgrounds.map(function (b) { return createBackground(_this.game, b); });
            createDeaths(this.game);
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
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.slideButton = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leSon.create();
            this.input.onDown.add(function () { return _this.downLocation = _this.input.position.clone(); });
            this.input.onUp.add(function () {
                if (_this.dead) {
                    _this.game.state.restart();
                    return;
                }
                var delta = Phaser.Point.subtract(_this.input.position, _this.downLocation);
                if (delta.y > 50) {
                    _this.swipeCommand = "down";
                }
                else if (delta.y < -50) {
                    _this.swipeCommand = "up";
                }
            });
            this.scoreText = this.game.add.text(100, 100, "TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEST", { font: "bold 16px Arial" });
            this.scoreText.fixedToCamera = true;
            this.scoreText.addColor("#22E122", 0);
        };
        Game.prototype.shutdown = function () {
            this.monster.destroy();
            this.obstacles.destroy();
            this.player.destroy();
            Assosso.param.obstacleTypes.forEach(function (type) { return type.deathSprite.destroy(); });
            this.leSon.shutdown();
        };
        Game.prototype.update = function () {
            var _this = this;
            if (this.dead) {
                this.monster.body.velocity.x = 0;
            }
            else {
                this.monster.body.velocity.x = Assosso.param.monsterSpeed;
            }
            var sliding = this.time.now <= this.slidingUntil;
            if (!this.dead) {
                setBodySize(this.player, Assosso.param.playerBodySizes[sliding ? "slide" : "run"]);
                var foundObstacle = null;
                if (this.physics.arcade.overlap(this.player, this.obstacles, function (p, obstacle) { return foundObstacle = obstacle; })) {
                    this.monster.animations.stop();
                    this.scoreText.text = "Score : " + Math.floor((this.player.x - Assosso.param.playerStartX) / Assosso.param.scoreDivision) + " mètres    - cliquer ou toucher l'ecran pour recommencer";
                    this.player.renderable = false;
                    this.dead = true;
                    var type = foundObstacle.obstacleType;
                    var deathSprite = type.deathSprite;
                    deathSprite.x = foundObstacle.x + type.deathOffset.x;
                    deathSprite.y = foundObstacle.y + type.deathOffset.y;
                    this.world.add(deathSprite);
                    deathSprite.animations.play('death');
                    this.obstacles.mask = null;
                    this.leSon.death();
                }
            }
            if (this.dead) {
            }
            else {
                this.scoreText.text = "Score : " + Math.floor((this.player.x - Assosso.param.playerStartX) / Assosso.param.scoreDivision);
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
                    if (this.jumpButton.isDown || this.swipeCommand === 'up') {
                        this.player.body.velocity.x = Assosso.param.monsterSpeed * Assosso.param.jumpSpeedBoost;
                        this.player.body.velocity.y = Assosso.param.jumpYVelocity;
                        this.jumping = true;
                        this.leSon.footStep();
                    }
                    else if ((this.slideButton.isDown || this.swipeCommand === 'down') && !sliding && this.time.now > this.noSlideUntil) {
                        this.slidingUntil = this.time.now + Assosso.param.slideTime;
                        this.noSlideUntil = this.slidingUntil + Assosso.param.slideCoolDown;
                        this.leSon.slide();
                        this.player.animations.play('slide');
                    }
                    this.swipeCommand = null;
                }
                if (this.rightButton.isDown) {
                    this.player.body.velocity.x = Assosso.param.monsterSpeed * Assosso.param.accelSpeed;
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