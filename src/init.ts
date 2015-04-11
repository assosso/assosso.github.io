/// <reference path="../lib/phaser.comments.d.ts" />

module Assosso {
  window.onload = function () {
    var game = new Phaser.Game(1065, 600, Phaser.WEBGL, 'game');

    game.state.add('Game', Assosso.Game);
    game.state.add('Boot', Assosso.Boot);

    game.state.start('Boot');
   }
}
