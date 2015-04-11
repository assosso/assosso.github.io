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
            var _this = this;
            [1, 2, 3, 4].forEach(function (i) { return _this.agame.load.audio('FS' + i, 'asset/son/FS/Assosso_Footstep_Running_0' + i + '.wav'); });
        };
        Son.prototype.create = function () {
            var _this = this;
            [1, 2, 3, 4].forEach(function (i) { return _this.footSteps[i] = _this.agame.add.audio('FS' + i); });
        };
        Son.prototype.footStep = function () {
            this.currentFS = this.currentFS + 1;
            if (this.currentFS > 4) {
                this.currentFS = 1;
            }
            this.footSteps[this.currentFS].play();
        };
        return Son;
    })();
    Assosso.Son = Son;
})(Assosso || (Assosso = {}));
//# sourceMappingURL=Son.js.map