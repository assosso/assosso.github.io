/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {

  export var orientated: boolean = false;

  export class Boot extends Phaser.State {
    init() {
        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setMinMax(532, 300, 1065, 600);

        if (this.game.device.desktop)
        {
        }
        else
        {
            this.scale.forceOrientation(true, false);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }

    }

    preload() {

    }

    create() {

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.game.state.start('Game');
    }

    enterIncorrectOrientation() {
        Assosso.orientated = false;

        document.getElementById('orientation').style.display = 'block';
    }

    leaveIncorrectOrientation() {
        Assosso.orientated = true;

        document.getElementById('orientation').style.display = 'none';
    }
  }
}
