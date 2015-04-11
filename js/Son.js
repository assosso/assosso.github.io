/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />
var Assosso;
(function (Assosso) {
    var Son = (function () {
        function Son(agame) {
            this.agame = agame;
            this.currentFS = 0;
            this.footSteps = [];
            this.Nbplay = [];
        }
        Son.prototype.preload = function () {
            var _this = this;
            [1, 2, 3, 4].forEach(function (i) { return _this.agame.load.audio('FS' + i, 'asset/son/FS/Assosso_Footstep_Running_0' + i + '.wav'); });
        };
        Son.prototype.create = function () {
            var _this = this;
            [1, 2, 3, 4].forEach(function (i) { return _this.footSteps[i] = _this.agame.add.audio('FS' + i); });
            Assosso.obstacleTypes.forEach(function (type) {
                type.audio = _this.agame.add.audio(type.assetKey);
                type.actionAudio = _this.agame.add.audio(type.action);
            });
        };
        Son.prototype.footStep = function () {
            this.currentFS = this.currentFS + 1;
            if (this.currentFS > 4) {
                this.currentFS = 1;
            }
            this.footSteps[this.currentFS].play();
        };
        Son.prototype.obstacle = function (obs) {
            var type = obs.obstacleType;
            if (typeof type.Nbplay === 'undefined') {
                type.Nbplay = 0;
            }
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