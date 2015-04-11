/// <reference path="../lib/phaser.comments.d.ts" />
var Assosso;
(function (Assosso) {
    window.onload = function () {
        var game = new Phaser.Game(1065, 600, Phaser.CANVAS, 'game');
        game.state.add('Game', Assosso.Game);
        game.state.add('Boot', Assosso.Boot);
        game.state.start('Boot');
    };
})(Assosso || (Assosso = {}));
//# sourceMappingURL=init.js.map