import { WORLDS } from '../data/worldsConfig.js';
import { generateGemTextures, generateSquirrelTexture, generateSparkleTexture } from '../systems/GemFactory.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const { width, height } = this.scale;

    const label = this.add.text(width / 2, height / 2 - 20, 'Dünyalar hazırlanıyor...', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#dcefe0',
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(width / 2, height / 2 + 20, width * 0.6, 10, 0x1a3324).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - (width * 0.6) / 2, height / 2 + 20, 4, 10, 0x8bc34a).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      bar.width = (width * 0.6) * value;
    });

    this._loadingLabel = label;
    this._loadingBar = bar;
    this._loadingBarBg = barBg;

    // Şu an harici asset yüklemiyoruz (tüm görseller prosedürel); ileride burada
    // this.load.image('squirrel', 'assets/sprites/squirrel.png') gibi çağrılar eklenecek.
  }

  create() {
    // Her dünyanın taş texture setini ve ortak texture'ları üretiyoruz.
    WORLDS.forEach(world => generateGemTextures(this, world.id, world.gemPalette));
    generateSquirrelTexture(this);
    generateSparkleTexture(this);

    this._loadingLabel.destroy();
    this._loadingBar.destroy();
    this._loadingBarBg.destroy();

    this.scene.start('MainMenu');
  }
}
