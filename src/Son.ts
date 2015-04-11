/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {

  export class Son {

    currentFS: number = 0;
    footSteps: Phaser.Sound[]=[];

    constructor(public agame : Assosso.Game ){

    }

    preload(){
      // Footstep
      [1,2,3,4].forEach(
        i => this.agame.load.audio('FS' + i, 'asset/son/FS/Assosso_Footstep_Running_0' + i + '.wav')
      );

      // Obstacles

    }

    create(){
      // Footstep
      [1,2,3,4].forEach(
        i => this.footSteps[i] = this.agame.add.audio('FS' + i)
      );
    }

    footStep(){
      this.currentFS = this.currentFS + 1;
      if (this.currentFS > 4) {this.currentFS = 1;}
      this.footSteps[this.currentFS].play();
//      this.footSteps[Math.ceil(Math.random() * 4)].play();
    }

    obstacle( obsName:string ){
      switch( obsName ){
        case "bat":
            
          break;

          default :
          //statements;
      }
    }

  } // Son
}
