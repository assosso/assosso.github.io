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
    var monsterSpeed = 350;
    var levelWidth = 24000;
    var levelHeight = 600;
    var frontFactor = -0.1;
    Assosso.obstacleTypes = [
        { assetKey: "piege-a-loup", action: "saute" },
        { assetKey: "rocher", action: "saute" },
        { assetKey: "pic", action: "saute" },
        { assetKey: "chauve-souris", action: "glissade" }
    ];
    var lampOffset = new Phaser.Point(72, 25);
    var lampAngle = 2.5;
    var lampDistance = 200;
    var lampFrameOffsets = [0, 3, 0, -2, 1000, 1000];
    var obstacleInterval = 900;
    var obstacleVariation = 100;
    var detectorDistance = 400;
    function createPlayer(game) {
        var player = game.add.sprite(600, 0, 'bob');
        player.y = levelHeight - player.height;
        game.physics.enable(player, Phaser.Physics.ARCADE);
        var playerBody = player.body;
        playerBody.collideWorldBounds = true;
        playerBody.gravity.y = 1000;
        playerBody.maxVelocity.y = 500;
        playerBody.setSize(50, 120, 20, 10);
        player.animations.add('right', [0, 1, 2], 10, true);
        player.animations.add('jump', [3], 10, false);
        player.animations.add('reception', [4, 5], 3, true);
        player.animations.play('right');
        return player;
    }
    function createMonster(game) {
        var monster = game.add.sprite(0, 0, 'monster');
        monster.y = levelHeight - monster.height + 20;
        game.physics.enable(monster, Phaser.Physics.ARCADE);
        monster.animations.add('right', null, 10, true);
        monster.animations.play('right');
        var monsterBody = monster.body;
        monsterBody.velocity.x = monsterSpeed;
        monsterBody.allowGravity = false;
        monsterBody.setSize(390, 350, 0, 60);
        return monster;
    }
    function createObstacles(game) {
        var obstacles = game.add.physicsGroup(Phaser.Physics.ARCADE);
        _.range(2000, levelWidth, obstacleInterval).forEach(function (x) {
            var type = _.sample(Assosso.obstacleTypes);
            var obstacle = obstacles.create(x + _.random(-obstacleVariation / 2, obstacleVariation / 2), 0, type.assetKey);
            obstacle.body.immovable = true;
            obstacle.body.allowGravity = false;
            obstacle.y = levelHeight - obstacle.height;
            obstacle.animations.add('clap', null, 10, true);
            obstacle.animations.play('clap');
            obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8, 0, obstacle.height * 0.2);
            obstacle.obstacleType = type;
        });
        return obstacles;
    }
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);
            this.facing = 'right';
            this.slowDownUntil = 0;
            this.jumping = false;
        }
        Game.prototype.preload = function () {
            var load = this.load;
            load.pack('main', 'asset/assets.json');
            this.leSon = new Assosso.Son(this);
            this.leSon.preload();
        };
        Game.prototype.drawLamp = function (fill, alpha) {
            var gfx = this.add.graphics(lampOffset.x, lampOffset.y);
            gfx.beginFill(fill, alpha);
            gfx.arc(0, 0, lampDistance, -lampAngle / 4, lampAngle / 2, false);
            gfx.lineTo(0, 0);
            gfx.lineTo(0, -10);
            return gfx;
        };
        Game.prototype.create = function () {
            var _this = this;
            this.world.setBounds(0, 0, levelWidth, levelHeight);
            this.stage.backgroundColor = 'rgb(32,38,51)';
            var add = this.add;
            this.grotteFond = add.group();
            _.range(300, levelWidth, 900).forEach(function (x) { return add.image(x, 0, 'grotteFond' + _.random(4), undefined, _this.grotteFond); });
            this.grotte = add.group();
            _.range(0, levelWidth, 800).forEach(function (x) { return add.image(x, 0, 'grotte' + _.random(3), undefined, _this.grotte); });
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
            this.obstacleDetector = this.add.sprite(0, 0, null);
            this.physics.enable(this.obstacleDetector, Phaser.Physics.ARCADE);
            this.obstacleDetector.body.setSize(100, 500, detectorDistance, -50);
            this.obstacleDetector.body.moves = false;
            this.player.addChild(this.obstacleDetector);
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.physics.arcade.gravity.y = 300;
            this.cursors = this.input.keyboard.createCursorKeys();
            this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.leftButton = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightButton = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.leSon.create();
        };
        Game.prototype.update = function () {
            var _this = this;
            this.physics.arcade.overlap(this.player, this.obstacles, function (p, obstacle) {
                obstacle.destroy();
                _this.slowDownUntil = _this.time.now + 100;
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
            this.camera.x = this.monster.x + 120;
            this.grotteFond.x = this.camera.x * 0.1;
            this.grotte.x = this.camera.x * 0.0;
            this.front.x = this.camera.x * frontFactor;
            if (this.player.body.onFloor()) {
                if (this.jumping) {
                    this.player.body.velocity.x = monsterSpeed * 0.5;
                    this.slowDownUntil = this.time.now + 500;
                    this.jumping = false;
                    this.player.animations.play('reception');
                }
                var velocityX = 0;
                if (this.time.now <= this.slowDownUntil) {
                    velocityX = monsterSpeed * 0.0;
                }
                else {
                    velocityX = monsterSpeed * (this.rightButton.isDown ? 1.2 : 1);
                    this.player.animations.play('right');
                }
                this.player.body.velocity.x = velocityX;
            }
            else {
                this.player.animations.play('jump');
            }
            if (this.jumpButton.isDown && this.player.body.onFloor()) {
                this.player.body.velocity.x = monsterSpeed * 1.7;
                this.player.body.velocity.y = -500;
                this.jumping = true;
                this.leSon.footStep();
            }
            this.lamp.y = lampFrameOffsets[this.player.frame];
        };
        Game.prototype.render = function () {
            //this.obstacles.forEach(this.game.debug.body, this.game.debug, false, 'green', false);
            //this.game.debug.body(this.obstacleDetector);
            // this.game.debug.bodyInfo(this.player, 16, 24);
        };
        return Game;
    })(Phaser.State);
    Assosso.Game = Game;
})(Assosso || (Assosso = {}));
//# sourceMappingURL=Game.js.map