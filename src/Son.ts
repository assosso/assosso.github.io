/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {
  export class Son {

    currentFS: number = 0;
    footSteps: Phaser.Sound[]=[];

    constructor(public agame : Assosso.Game ){

    }

    preload(){
    }

    create(){
      // Footstep
      var footstepKeys:string[] = (<any>this.agame.cache).getKeys(Phaser.Cache.SOUND).filter(k=>/^FS/.test(k));
      footstepKeys.forEach(
        k => this.footSteps.push(this.agame.add.audio(k, Assosso.param.footstepVolume))
      );

      // Obstacles
      Assosso.param.obstacleTypes.forEach(
        type => {
          type.Nbplay = 0;
          type.audio = this.agame.add.audio(type.assetKey, type.volume);
          type.actionAudio = this.agame.add.audio(type.action, type.actionVolume);
        }
      );

      // Musique
      var gameTheme = this.agame.add.audio('game-theme');
      gameTheme.loopFull(Assosso.param.musicVolume);
    }

    footStep(){
      // enchainement des 4 footStep different
      this.currentFS = (this.currentFS + 1) % this.footSteps.length;
      this.footSteps[this.currentFS].play();
    }

    obstacle( obs: any ){
      var type = obs.obstacleType;

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
