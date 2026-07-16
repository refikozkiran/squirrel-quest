import { WORLDS } from '../data/worldsConfig.js';
import { livingWorld } from '../systems/LivingWorldManager.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0b1f14');

    // Varsa gerçek orman illüstrasyonunu tam ekran dekor olarak kullan.
    const bgKey = 'bg_emerald-forest';
    if (this.textures.exists(bgKey)) {
      const bg = this.add.image(width / 2, height / 2, bgKey).setDepth(-10);
      const src = this.textures.get(bgKey).getSourceImage();
      const coverScale = Math.max(width / src.width, height / src.height);
      bg.setScale(coverScale);
      // Menü metinlerinin okunabilmesi için hafif koyultma
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35).setDepth(-9);
    }

    this.add.text(width / 2, height * 0.1, 'SİNCAP KAŞİF', {
      fontFamily: 'sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#ffd54f',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.1 + 36, 'Yaşayan Dünyalar', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#a9c9ae',
    }).setOrigin(0.5);

    // Sincap: kaynak görsel ne çözünürlükte olursa olsun sabit bir ekran boyutuna kilitleniyor.
    const squirrelSize = width * 0.42;
    const squirrel = this.add.image(width / 2, height * 0.28, 'squirrel_placeholder')
      .setDisplaySize(squirrelSize, squirrelSize);
    this.tweens.add({
      targets: squirrel,
      y: squirrel.y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Dünya kartları - 2 sütunlu grid
    const cols = 2;
    const cardW = width * 0.42;
    const cardH = cardW * 0.85;
    const startX = width * 0.5 - (cardW * cols) / 2 - 10 + cardW / 2;
    const startY = height * 0.46;
    const gapX = cardW + 20;
    const gapY = cardH + 18;

    WORLDS.forEach((world, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX;
      const y = startY + row * gapY;
      this._createWorldCard(world, x, y, cardW, cardH);
    });
  }

  _createWorldCard(world, x, y, w, h) {
    const unlocked = livingWorld.isWorldUnlocked(world.id);
    const stage = livingWorld.getStage(world.id);
    const completed = livingWorld.getLevelsCompletedCount(world.id);

    const container = this.add.container(x, y);

    const bgColor = unlocked ? world.palette.alive.ground : 0x2a2a2a;
    const bg = this.add.rectangle(0, 0, w, h, bgColor, unlocked ? 1 : 0.6)
      .setStrokeStyle(2, unlocked ? world.palette.alive.accent : 0x555555);

    const title = this.add.text(0, -h * 0.28, world.name, {
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: unlocked ? '#ffffff' : '#888888',
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -h * 0.12, world.subtitle, {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: unlocked ? '#d7e8da' : '#777777',
    }).setOrigin(0.5);

    container.add([bg, title, subtitle]);

    if (unlocked) {
      const stageText = this.add.text(0, h * 0.12, `Aşama ${stage + 1}/6 · ${completed}/${world.levelCount} bölüm`, {
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#c9e6cd',
      }).setOrigin(0.5);
      container.add(stageText);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.tweens.add({
          targets: container,
          scale: 0.94,
          duration: 80,
          yoyo: true,
          onComplete: () => this.scene.start('WorldMap', { worldId: world.id }),
        });
      });
      bg.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.03, duration: 100 }));
      bg.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 100 }));
    } else {
      const lock = this.add.text(0, h * 0.12, '🔒 Kilitli', {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#999999',
      }).setOrigin(0.5);
      container.add(lock);
    }
  }
}
