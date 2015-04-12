/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {
  export class Son {

    footSteps: Phaser.Sound[]=[];
    currentFS: number = 0;
    slideSounds: Phaser.Sound[]=[];
    currentSlide: number = 0;

    gameTheme: Phaser.Sound;
    gameAmbience: Phaser.Sound;

    constructor(public agame : Assosso.Game ){

    }

    preload(){
    }

    createSounds(regexp, volume) {
      var keys:string[] = (<any>this.agame.cache).getKeys(Phaser.Cache.SOUND).filter(k=>regexp.test(k));
      return keys.map(
        k => this.agame.add.audio(k, volume)
      );
    }

    create(){
      this.footSteps = this.createSounds(/^FS/, Assosso.param.footstepVolume);
      this.slideSounds = this.createSounds(/^Slide/, Assosso.param.slideVolume);

      // Obstacles
      Assosso.param.obstacleTypes.forEach(
        type => {
          type.Nbplay = 0;
          type.audio = this.agame.add.audio(type.assetKey, type.volume);
          type.actionAudio = this.agame.add.audio(type.action, type.actionVolume);
        }
      );

      // Musique
      this.gameTheme = this.agame.add.audio('game-theme');
      this.gameTheme.loopFull(Assosso.param.musicVolume);

      this.gameAmbience = this.agame.add.audio('game-ambience');
      this.gameAmbience.loopFull(Assosso.param.ambienceVolume);
    }

    ready(): boolean {
      return this.gameTheme.isDecoded && this.gameAmbience.isDecoded;
    }

    footStep(){
      // enchainement des 4 footStep different
      this.currentFS = (this.currentFS + 1) % this.footSteps.length;
      this.footSteps[this.currentFS].play();
    }

    slide() {
      this.currentSlide = (this.currentSlide + 1) % this.slideSounds.length;
      this.slideSounds[this.currentSlide].play();
    }

    obstacle( obs: any ){
      var type = obs.obstacleType;

      type.Nbplay++;
      switch( type.Nbplay ){
        case 1:
          // nom obstacle + action
          this.playInSequence(type.audio, type.actionAudio);
        break;
        default:
          // nom obstacle
          type.audio.play();
        break;

      }
    }// obstacle

    playInSequence(sound1: Phaser.Sound, sound2: Phaser.Sound) {
      sound1.onStop.addOnce(()=>sound2.play());
      sound1.play();
    }

  } // Son
}
