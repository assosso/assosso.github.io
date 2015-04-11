/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {

  export class Son {

    currentFS: number = 0;
    footSteps: Phaser.Sound[]=[];
    Nbplay: number[]=[];

    constructor(public agame : Assosso.Game ){

    }

    preload(){
      // Footstep
      [1,2,3,4].forEach(
        i => this.agame.load.audio('FS' + i, 'asset/son/FS/Assosso_Footstep_Running_0' + i + '.wav')
      );
    }

    create(){
      // Footstep
      [1,2,3,4].forEach(
        i => this.footSteps[i] = this.agame.add.audio('FS' + i)
      );

      // Obstacles
      Assosso.obstacleTypes.forEach(
        type => {
          type.audio = this.agame.add.audio(type.assetKey);
          type.actionAudio = this.agame.add.audio(type.action);
        }
      );
    }

    footStep(){
      // enchainement des 4 footStep different
      this.currentFS = this.currentFS + 1;
      if (this.currentFS > 4) {this.currentFS = 1;}
      this.footSteps[this.currentFS].play();
//      this.footSteps[Math.ceil(Math.random() * 4)].play();
    }

    obstacle( obs: any ){
      var type = obs.obstacleType;
      if (typeof type.Nbplay === 'undefined') {
        type.Nbplay = 0;
      }

      type.Nbplay++;
      switch( type.Nbplay ){
        case 1:
          // nom obstacle + action
          this.playInSequence(type.audio, type.actionAudio);
        break;
        case 2:
          // nom obstacle
          type.audio.play();
        break;
        default :
          // nom obstacle etrange
        break;

      }
    }// obstacle

    playInSequence(sound1: Phaser.Sound, sound2: Phaser.Sound) {
      sound1.onStop.addOnce(()=>sound2.play());
      sound1.play();
    }

  } // Son
}
