/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />
var Assosso;
(function (Assosso) {
    var Son = (function () {
        function Son(agame) {
            this.agame = agame;
            this.footSteps = [];
            this.currentFS = 0;
            this.slideSounds = [];
            this.currentSlide = 0;
        }
        Son.prototype.preload = function () {
        };
        Son.prototype.createSounds = function (regexp, volume) {
            var _this = this;
            var keys = this.agame.cache.getKeys(Phaser.Cache.SOUND).filter(function (k) { return regexp.test(k); }).sort();
            return keys.map(function (k) { return _this.agame.add.audio(k, volume); });
        };
        Son.prototype.create = function () {
            var _this = this;
            this.footSteps = this.createSounds(/^FS/, Assosso.param.footstepVolume);
            this.slideSounds = this.createSounds(/^Slide/, Assosso.param.slideVolume);
            this.deathSound = this.agame.add.audio("death", Assosso.param.deathVolume);
            Assosso.param.obstacleTypes.forEach(function (type) {
                type.Nbplay = 0;
                type.audio = _this.createSounds(new RegExp("^" + type.assetKey), type.volume);
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
        Son.prototype.slide = function () {
            this.currentSlide = (this.currentSlide + 1) % this.slideSounds.length;
            this.slideSounds[this.currentSlide].play();
        };
        Son.prototype.death = function () {
            this.deathSound.play();
        };
        Son.prototype.obstacle = function (obs) {
            var type = obs.obstacleType;
            type.Nbplay++;
            switch (type.Nbplay) {
                case 1:
                    this.playInSequence(type.audio[0], type.actionAudio);
                    break;
                case 2:
                    type.audio[0].play();
                    break;
                default:
                    _.sample(type.audio).play();
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