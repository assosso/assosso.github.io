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
    Assosso.orientated = false;
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.init = function () {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(532, 300, 1065, 600);
            if (this.game.device.desktop) {
            }
            else {
                this.scale.forceOrientation(true, false);
                this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
                this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            }
        };
        Boot.prototype.preload = function () {
        };
        Boot.prototype.create = function () {
            this.game.state.start('Game');
        };
        Boot.prototype.enterIncorrectOrientation = function () {
            Assosso.orientated = false;
            document.getElementById('orientation').style.display = 'block';
        };
        Boot.prototype.leaveIncorrectOrientation = function () {
            Assosso.orientated = true;
            document.getElementById('orientation').style.display = 'none';
        };
        return Boot;
    })(Phaser.State);
    Assosso.Boot = Boot;
})(Assosso || (Assosso = {}));
//# sourceMappingURL=Boot.js.map