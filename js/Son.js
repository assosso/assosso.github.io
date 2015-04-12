/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />
var Assosso;
(function (Assosso) {
    var Son = (function () {
        function Son(agame) {
            this.agame = agame;
            this.currentFS = 0;
            this.footSteps = [];
        }
        Son.prototype.preload = function () {
        };
        Son.prototype.create = function () {
            var _this = this;
            var footstepKeys = this.agame.cache.getKeys(Phaser.Cache.SOUND).filter(function (k) { return /^FS/.test(k); });
            footstepKeys.forEach(function (k) { return _this.footSteps.push(_this.agame.add.audio(k, Assosso.param.footstepVolume)); });
            Assosso.param.obstacleTypes.forEach(function (type) {
                type.Nbplay = 0;
                type.audio = _this.agame.add.audio(type.assetKey, type.volume);
                type.actionAudio = _this.agame.add.audio(type.action, type.actionVolume);
            });
            this.gameTheme = this.agame.add.audio('game-theme');
            this.gameTheme.loopFull(Assosso.param.musicVolume);
            this.gameAmbience = this.agame.add.audio('game-ambience');
            this.gameAmbience.loopFull(Assosso.param.ambienceVolume);
        };
        Son.prototype.ready = function () {
            return this.gameTheme.isDecoded && this.gameAmbience.isDecoded;
        };
        Son.prototype.footStep = function () {
            this.currentFS = (this.currentFS + 1) % this.footSteps.length;
            this.footSteps[this.currentFS].play();
        };
        Son.prototype.obstacle = function (obs) {
            var type = obs.obstacleType;
            type.Nbplay++;
            switch (type.Nbplay) {
                case 1:
                    this.playInSequence(type.audio, type.actionAudio);
                    break;
                case 2:
                    type.audio.play();
                    break;
                default:
                    break;
            }
        };
        Son.prototype.playInSequence = function (sound1, sound2) {
            sound1.onStop.addOnce(function () { return sound2.play(); });
            sound1.play();
        };
        return Son;
    })();
    Assosso.Son = Son;
})(Assosso || (Assosso = {}));
//# sourceMappingURL=Son.js.map