/// <reference path="../lib/phaser.comments.d.ts" />
/// <reference path="../lib/lodash.d.ts" />

module Assosso {

  export class Son {

    currentFS: number = 0;
    footSteps: Phaser.Sound[]=[];
    obstacles: Phaser.Sound[]=[];
    Nbplay: number[]=[];

    constructor(public agame : Assosso.Game ){

    }

    preload(){
      // Footstep
      [1,2,3,4].forEach(
        i => this.agame.load.audio('FS' + i, 'asset/son/FS/Assosso_Footstep_Running_0' + i + '.wav')
      );

      // Obstacles
      this.agame.load.audio('OBS'+'1' , '/asset/son/obstacle/piege-a-loup.wav');
      this.agame.load.audio('OBS'+'2' , '/asset/son/obstacle/rocher.wav');
      this.agame.load.audio('OBS'+'3' , '/asset/son/obstacle/pic.wav');

      this.agame.load.audio('ACT'+'1' , '/asset/son/obstacle/saute.wav');

    }

    create(){
      // Footstep
      [1,2,3,4].forEach(
        i => this.footSteps[i] = this.agame.add.audio('FS' + i)
      );

      // Obstacles
      [0,1,2].forEach(
        i => this.obstacles[i] = this.agame.add.audio('OBS' + i)
      );

    }

    footStep(){
      // enchainement des 4 footStep different
      this.currentFS = this.currentFS + 1;
      if (this.currentFS > 4) {this.currentFS = 1;}
      this.footSteps[this.currentFS].play();
//      this.footSteps[Math.ceil(Math.random() * 4)].play();
    }

    obstacle( obsNb:number ){
      if (this.Nbplay[obsNb] == null){ this.Nbplay[obsNb]=0; }
      this.Nbplay[obsNb] = this.Nbplay[obsNb] + 1;
      switch( this.Nbplay[obsNb] ){
        case 1:
          // nom obstacle + action
          //this.obstacles[obsNb].onStop.addOnce( ()=> );
          this.obstacles[obsNb].play();
        break;
        case 2:
          // nom obstacle
        break;
        default :
          // nom obstacle etrange
        break;

      }
    }// obstacle


  } // Son
}
