import { getWorldById } from '../data/worldsConfig.js';
import { livingWorld } from '../systems/LivingWorldManager.js';

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMap');
  }

  init(data) {
    this.worldId = data.worldId;
    this.world = getWorldById(this.worldId);
  }

  create() {
    const { width, height } = this.scale;
    const stage = livingWorld.getStage(this.worldId);
    const stageProgress = livingWorld.getStageProgressWithinCurrent(this.worldId);

    // Living World arka planı: "dead" ve "alive" paletleri arasında stage'e göre lerp yapıyoruz.
    const bgColor = this._lerpColor(this.world.palette.dead.bg, this.world.palette.alive.bg, stage / 5);
    this.cameras.main.setBackgroundColor(bgColor);

    this._drawLivingBackground(stage);

    // Geri butonu
    this._createBackButton();

    // Başlık + stage açıklaması (Living World'ün "hikaye anlatan" kısmı)
    this.add.text(width / 2, 36, this.world.name, {
      fontFamily: 'sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    this.stageLabel = this.add.text(width / 2, 62, this.world.stageDescriptions[stage], {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#dcefe0', wordWrap: { width: width * 0.8 }, align: 'center',
    }).setOrigin(0.5);

    // Stage ilerleme çubuğu
    const barW = width * 0.6;
    this.add.rectangle(width / 2, 84, barW, 6, 0x000000, 0.3).setOrigin(0.5);
    this.add.rectangle(width / 2 - barW / 2, 84, barW * stageProgress, 6, this.world.palette.alive.accent).setOrigin(0, 0.5);

    this._createLevelPath();

    // Ambient parçacıklar (yaprak/kar/kıvılcım vs.) — dünya "yaşıyor" hissi
    this._createAmbientParticles();
  }

  _lerpColor(c1, c2, t) {
    const col1 = Phaser.Display.Color.IntegerToColor(c1);
    const col2 = Phaser.Display.Color.IntegerToColor(c2);
    const result = Phaser.Display.Color.Interpolate.ColorWithColor(col1, col2, 100, Math.round(t * 100));
    return Phaser.Display.Color.GetColor(result.r, result.g, result.b);
  }

  _createBackButton() {
    const btn = this.add.text(20, 20, '← Dünyalar', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', backgroundColor: '#00000055', padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.scene.start('MainMenu'));
  }

  _drawLivingBackground(stage) {
    const { width, height } = this.scale;
    const bgKey = `bg_${this.worldId}`;

    // Gerçek illüstrasyon (assets/backgrounds/<worldId>.png) yüklenmişse onu kullan.
    if (this.textures.exists(bgKey)) {
      const img = this.add.image(width / 2, height / 2, bgKey);
      const src = this.textures.get(bgKey).getSourceImage();
      const coverScale = Math.max(width / src.width, height / src.height);
      img.setScale(coverScale);

      // Living World hissi: dünya henüz tam canlanmadıysa üzerine hafif soluk/gri bir
      // katman biner; stage arttıkça bu katman kalkar ve illüstrasyon tam renginde görünür.
      const overlayAlpha = ((5 - stage) / 5) * 0.5;
      if (overlayAlpha > 0.02) {
        this.add.rectangle(width / 2, height / 2, width, height, 0x232323, overlayAlpha)
          .setBlendMode(Phaser.BlendModes.MULTIPLY);
      }
      return;
    }

    // Gerçek illüstrasyon yoksa: prosedürel (vektör) zemin çizimi.
    const g = this.add.graphics();

    // Zemin şeridi - stage arttıkça daha "canlı" renk
    const groundColor = this._lerpColor(this.world.palette.dead.ground, this.world.palette.alive.ground, stage / 5);
    g.fillStyle(groundColor, 1);
    g.fillRect(0, height * 0.55, width, height * 0.45);

    // Basit tepecikler (derinlik hissi)
    g.fillStyle(groundColor, 0.6);
    for (let i = 0; i < 4; i++) {
      const hx = (width / 4) * i + width * 0.12;
      g.fillEllipse(hx, height * 0.58, width * 0.3, 40);
    }

    // Stage 1+ : dere / stage 2+: çiçek noktaları gibi basit "yaşam belirtileri"
    if (stage >= 1) {
      g.fillStyle(0x4fc3f7, 0.5);
      g.fillEllipse(width * 0.5, height * 0.7, width * 0.7, 24);
    }
    if (stage >= 2) {
      for (let i = 0; i < 8; i++) {
        const fx = Phaser.Math.Between(20, width - 20);
        const fy = Phaser.Math.Between(height * 0.6, height * 0.9);
        g.fillStyle(this.world.palette.alive.accent, 0.9);
        g.fillCircle(fx, fy, 3);
      }
    }
  }

  _createLevelPath() {
    const { width, height } = this.scale;
    const levelCount = this.world.levelCount;
    const nextLevel = livingWorld.getNextLevelIndex(this.world.id);

    const pathTop = height * 0.62;
    const pathBottom = height * 0.95;
    const colsPerRow = 4;
    const rowH = 46;

    for (let i = 0; i < levelCount; i++) {
      const row = Math.floor(i / colsPerRow);
      const colInRow = i % colsPerRow;
      const zigzagCol = row % 2 === 0 ? colInRow : (colsPerRow - 1 - colInRow);
      const x = width * 0.18 + zigzagCol * ((width * 0.64) / (colsPerRow - 1));
      const y = pathTop + row * rowH;

      const unlocked = livingWorld.isLevelUnlocked(this.world.id, i);
      const completed = livingWorld.isLevelCompleted(this.world.id, i);

      const nodeColor = completed ? this.world.palette.alive.accent : (unlocked ? 0xffffff : 0x555555);
      const node = this.add.circle(x, y, 16, unlocked ? 0x222222 : 0x1a1a1a, 1)
        .setStrokeStyle(3, nodeColor);

      const label = this.add.text(x, y, `${i + 1}`, {
        fontFamily: 'sans-serif', fontSize: '12px', color: unlocked ? '#ffffff' : '#666666',
      }).setOrigin(0.5);

      if (completed) {
        this.add.text(x, y - 24, '★', { fontSize: '14px', color: '#ffd54f' }).setOrigin(0.5);
      }

      if (i === nextLevel && unlocked && !completed) {
        // Oyuncunun bir sonraki hedefini vurgula (nabız animasyonu)
        this.tweens.add({ targets: node, scale: 1.15, duration: 500, yoyo: true, repeat: -1 });
      }

      if (unlocked) {
        node.setInteractive({ useHandCursor: true });
        node.on('pointerdown', () => {
          this.scene.start('Game', { worldId: this.world.id, levelIndex: i });
        });
      }
    }
  }

  _createAmbientParticles() {
    const { width, height } = this.scale;
    this.add.particles(0, 0, 'sparkle', {
      x: { min: 0, max: width },
      y: { min: -20, max: 0 },
      lifespan: 6000,
      speedY: { min: 20, max: 40 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: this.world.palette.alive.accent,
      frequency: 400,
      quantity: 1,
    });
  }
}
