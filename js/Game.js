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
    var monsterSpeed = 250;
    var levelWidth = 24000;
    var frontFactor = -0.1;
    function createPlayer(game) {
        var player = game.add.sprite(500, 320, 'bob');
        game.physics.enable(player, Phaser.Physics.ARCADE);
        var playerBody = player.body;
        playerBody.collideWorldBounds = true;
        playerBody.gravity.y = 1000;
        playerBody.maxVelocity.y = 500;
        playerBody.setSize(50, 120, 20, 10);
        player.animations.add('right', [0, 1, 2], 10, true);
        player.animations.add('jump', [3], 10, false);
        player.animations.play('right');
        return player;
    }
    function createMonster(game) {
        var monster = game.add.sprite(100, 400, 'monster');
        game.physics.enable(monster, Phaser.Physics.ARCADE);
        monster.animations.add('right', [0, 1, 2], 10, true);
        monster.animations.play('right');
        var monsterBody = monster.body;
        monsterBody.velocity.x = monsterSpeed;
        monsterBody.allowGravity = false;
        return monster;
    }
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);
            this.facing = 'right';
            this.jumpTimer = 0;
        }
        Game.prototype.preload = function () {
            var load = this.load;
            load.spritesheet('bob', 'asset/sprite_perso_run.png', 92, 130)
                .spritesheet('monster', 'asset/sprite_monster_run.png', 238, 222)
                .image('stalactite', 'asset/scenery/decor_stalactite.png');
            _.range(4).forEach(function (i) { return load.image('grotte' + i, 'asset/scenery/background_grotte' + i + '.png'); });
            _.range(5).forEach(function (i) { return load.image('grotteFond' + i, 'asset/scenery/background_grotte_fond' + i + '.png'); });
            this.leSon = new Assosso.Son(this);
            this.leSon.preload();
        };
        Game.prototype.create = function () {
            var _this = this;
            this.world.setBounds(0, 0, levelWidth, 600);
            this.stage.backgroundColor = 'rgb(32,38,51)';
            var add = this.add;
            this.grotteFond = add.group();
            _.range(300, levelWidth, 900).forEach(function (x) { return add.image(x, 0, 'grotteFond' + _.random(4), undefined, _this.grotteFond); });
            this.grotte = add.group();
            _.range(0, levelWidth, 800).forEach(function (x) { return add.image(x, 0, 'grotte' + _.random(3), undefined, _this.grotte); });
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
        };
        Game.prototype.update = function () {
            this.camera.x = this.monster.x + 20;
            this.grotteFond.x = this.camera.x * 0.7;
            this.grotte.x = this.camera.x * 0.6;
            this.front.x = this.camera.x * frontFactor;
            this.player.body.velocity.x = monsterSpeed * 0.9;
            if (this.player.body.onFloor()) {
                this.player.animations.play('right');
            }
            else {
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
        };
        Game.prototype.render = function () {
            // this.game.debug.text(this.player.body.onFloor(), 32, 32);
            // this.game.debug.body(this.player);
            // this.game.debug.bodyInfo(this.player, 16, 24);
        };
        return Game;
    })(Phaser.State);
    Assosso.Game = Game;
})(Assosso || (Assosso = {}));
//# sourceMappingURL=Game.js.map