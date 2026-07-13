export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    // İleride burada gerçek font/manifest yükleme ayarları yapılabilir.
    this.scene.start('Preload');
  }
}
