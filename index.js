/// <reference path="lib/phaser.comments.d.ts" />
var Assosso;
(function (Assosso) {
    var monsterSpeed = 150;
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
    var AssossoGame = (function () {
        function AssossoGame() {
            this.facing = 'right';
            this.jumpTimer = 0;
        }
        AssossoGame.prototype.start = function () {
            this.game = new Phaser.Game(1000, 600, Phaser.CANVAS, 'Assosso', { preload: this.preload, create: this.create, update: this.update, render: this.render });
        };
        AssossoGame.prototype.preload = function () {
            this.game.load.spritesheet('bob', 'asset/sprite_perso_run.png', 92, 130);
            this.game.load.spritesheet('monster', 'asset/sprite_monster_run.png', 240, 222);
            this.game.load.image('background', 'background2.png');
        };
        AssossoGame.prototype.create = function () {
            this.game.world.setBounds(0, 0, 24000, 600);
            this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.gravity.y = 300;
            this.cursors = this.game.input.keyboard.createCursorKeys();
            this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.player = createPlayer(this.game);
            this.monster = createMonster(this.game);
        };
        AssossoGame.prototype.update = function () {
            this.game.camera.x = this.player.x - 300;
            this.player.body.velocity.x = monsterSpeed;
            if (this.player.body.onFloor()) {
                this.player.animations.play('right');
            }
            else {
                this.player.animations.play('jump');
            }
            if (this.jumpButton.isDown && this.player.body.onFloor() && this.game.time.now > this.jumpTimer) {
                this.player.body.velocity.y = -500;
                this.jumpTimer = this.game.time.now + 750;
            }
            if (this.rightButton.isDown) {
                this.player.body.velocity.x = 300;
            }
        };
        AssossoGame.prototype.render = function () {
            // this.game.debug.text(this.game.time.physicsElapsed, 32, 32);
            // this.game.debug.body(this.player);
            // this.game.debug.bodyInfo(this.player, 16, 24);
        };
        return AssossoGame;
    })();
    new AssossoGame().start();
})(Assosso || (Assosso = {}));
//# sourceMappingURL=index.js.map