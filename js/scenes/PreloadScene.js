import { WORLDS } from '../data/worldsConfig.js';
import { generateGemTextures, generateSquirrelTexture, generateSparkleTexture, GEM_TYPES } from '../systems/GemFactory.js';

// Gerçek sanat varlıkları hazır olduğunda buraya bırakılacak dosyalar.
// Bir dosya bulunamazsa (henüz üretilmediyse) sessizce yok sayılır ve GemFactory
// aynı texture key'i prosedürel olarak üretir — yani bu dosyaları teker teker,
// hazır oldukça assets/ klasörüne eklemen yeterli, kodda değişiklik gerekmez.
const IMAGE_MANIFEST = [
  { key: 'squirrel_placeholder', path: 'assets/sprites/squirrel.png' },
  { key: 'panel_wood', path: 'assets/ui/panel-wood.png' },
  ...GEM_TYPES.map((gem, i) => ({ key: `gem_${i}`, path: `assets/sprites/gem_${i}.png` })),
  ...WORLDS.map(w => ({ key: `bg_${w.id}`, path: `assets/backgrounds/${w.id}.png` })),
];

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

    // Henüz üretilmemiş dosyalar için 404 kaçınılmaz ve zararsız; konsolda görünebilir
    // ama oyunu durdurmaz. Bilerek burada susturmuyoruz ki hangi dosyaların eksik
    // olduğunu tarayıcı konsolundan kolayca görebilesin.
    IMAGE_MANIFEST.forEach(({ key, path }) => this.load.image(key, path));

    this._loadingLabel = label;
    this._loadingBar = bar;
    this._loadingBarBg = barBg;
  }

  create() {
    // Gerçek görsel yüklenmiş her key için generateX çağrıları otomatik atlanır
    // (GemFactory içinde textures.exists kontrolü var) — yani burası hem "hepsi
    // prosedürel" hem "hepsi gerçek sanat" hem de "karışık" durumları sorunsuz kapsar.
    generateGemTextures(this);
    generateSquirrelTexture(this);
    generateSparkleTexture(this);

    this._loadingLabel.destroy();
    this._loadingBar.destroy();
    this._loadingBarBg.destroy();

    this.scene.start('MainMenu');
  }
}
