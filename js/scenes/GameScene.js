import { getWorldById } from '../data/worldsConfig.js';
import { livingWorld } from '../systems/LivingWorldManager.js';
import { Match3Board } from '../systems/Match3Board.js';

const ROWS = 7;
const COLS = 6;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.worldId = data.worldId;
    this.levelIndex = data.levelIndex;
    this.world = getWorldById(this.worldId);
    this.levelConfig = this._buildLevelConfig(this.levelIndex);

    this.selected = null; // {r,c} şu an seçili taş
    this.inputLocked = false;
    this.movesLeft = this.levelConfig.moves;
    this.collected = 0;
  }

  // Bölüm hedeflerini elle 120 kere yazmak yerine level index'ten türetiyoruz.
  // İleride her level'a özel el yapımı config (özel engeller, hedefler vb.) buraya eklenebilir.
  _buildLevelConfig(levelIndex) {
    const targetGemType = levelIndex % this.world.gemPalette.length;
    return {
      targetGemType,
      targetCount: 14 + Math.floor(levelIndex * 1.2),
      moves: 18 + Math.floor(levelIndex / 4),
    };
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(this.world.palette.alive.bg);

    this.board = new Match3Board(ROWS, COLS, this.world.gemPalette.length);

    // Grid boyutlarını ekrana göre hesapla
    this.cellSize = Math.floor(Math.min(width * 0.92 / COLS, height * 0.6 / ROWS));
    this.gridW = this.cellSize * COLS;
    this.gridH = this.cellSize * ROWS;
    this.gridX = (width - this.gridW) / 2;
    this.gridY = height * 0.28;

    this._createHUD();
    this._createGridBackground();

    this.sprites = []; // [row][col] -> Phaser.Image
    for (let r = 0; r < ROWS; r++) {
      this.sprites.push([]);
      for (let c = 0; c < COLS; c++) {
        this.sprites[r].push(this._createGemSprite(r, c, this.board.grid[r][c]));
      }
    }

    this._createSparkleEmitter();
  }

  // ---------- HUD ----------

  _createHUD() {
    const { width } = this.scale;

    this.add.text(20, 16, '← Çık', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', backgroundColor: '#00000055', padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => this._exitToMap());

    this.add.text(width / 2, 18, `${this.world.name} · Bölüm ${this.levelIndex + 1}`, {
      fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.movesText = this.add.text(width - 20, 16, `Hamle: ${this.movesLeft}`, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', backgroundColor: '#00000055', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0);

    // Hedef göstergesi: hedef taş ikonu + ilerleme
    const goalY = 50;
    this.add.image(30, goalY, `gem_${this.worldId}_${this.levelConfig.targetGemType}`).setScale(0.35).setOrigin(0.5);
    this.goalText = this.add.text(52, goalY, `0 / ${this.levelConfig.targetCount}`, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0, 0.5);
  }

  _createGridBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(this.gridX - 8, this.gridY - 8, this.gridW + 16, this.gridH + 16, 14);
  }

  _createSparkleEmitter() {
    this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
      lifespan: 500,
      speed: { min: 60, max: 160 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
  }

  // ---------- Grid <-> dünya koordinatları ----------

  _cellToXY(r, c) {
    return {
      x: this.gridX + c * this.cellSize + this.cellSize / 2,
      y: this.gridY + r * this.cellSize + this.cellSize / 2,
    };
  }

  _createGemSprite(r, c, type) {
    const { x, y } = this._cellToXY(r, c);
    const key = `gem_${this.worldId}_${type}`;
    const img = this.add.image(x, y, key)
      .setDisplaySize(this.cellSize * 0.82, this.cellSize * 0.82)
      .setInteractive({ useHandCursor: true });

    img.setData('r', r);
    img.setData('c', c);
    img.on('pointerdown', () => this._onGemClicked(img));
    return img;
  }

  // ---------- Girdi / seçim ----------

  _onGemClicked(img) {
    if (this.inputLocked) return;
    const r = img.getData('r');
    const c = img.getData('c');

    if (!this.selected) {
      this.selected = { r, c, img };
      this._pulse(img);
      return;
    }

    const sel = this.selected;
    if (sel.img === img) {
      this.selected = null;
      this._resetGemScale(img);
      return;
    }

    if (this.board.isAdjacent(sel.r, sel.c, r, c)) {
      this._resetGemScale(sel.img);
      this.selected = null;
      this._trySwap(sel.r, sel.c, r, c);
    } else {
      // Farklı, komşu olmayan bir taşa dokunuldu: seçimi ona taşı
      this._resetGemScale(sel.img);
      this.selected = { r, c, img };
      this._pulse(img);
    }
  }

  _pulse(img) {
    img.setScale(img.scaleX * 1.12, img.scaleY * 1.12);
  }

  _resetGemScale(img) {
    img.setDisplaySize(this.cellSize * 0.82, this.cellSize * 0.82);
  }

  async _trySwap(r1, c1, r2, c2) {
    this.inputLocked = true;

    if (!this.board.wouldCreateMatch(r1, c1, r2, c2)) {
      // Geçersiz hamle: küçük "hayır" animasyonu (AAA hissi için önemli negatif geri bildirim)
      await this._animateSwap(r1, c1, r2, c2, true);
      this.inputLocked = false;
      return;
    }

    this.board.swap(r1, c1, r2, c2);
    await this._animateSwap(r1, c1, r2, c2, false);

    this.movesLeft--;
    this.movesText.setText(`Hamle: ${this.movesLeft}`);

    await this._resolveBoard();
    this.inputLocked = false;

    this._checkEndConditions();
  }

  _animateSwap(r1, c1, r2, c2, revert) {
    const imgA = this.sprites[r1][c1];
    const imgB = this.sprites[r2][c2];
    const posA = this._cellToXY(r1, c1);
    const posB = this._cellToXY(r2, c2);

    return new Promise(resolve => {
      this.tweens.add({
        targets: imgA, x: posB.x, y: posB.y, duration: 160, ease: 'Quad.easeInOut',
      });
      this.tweens.add({
        targets: imgB, x: posA.x, y: posA.y, duration: 160, ease: 'Quad.easeInOut',
        onComplete: () => {
          if (revert) {
            // Görsel olarak geri al (mantıkta zaten değişmedi)
            this.tweens.add({ targets: imgA, x: posA.x, y: posA.y, duration: 140 });
            this.tweens.add({
              targets: imgB, x: posB.x, y: posB.y, duration: 140,
              onComplete: resolve,
            });
          } else {
            // Sprite referanslarını grid ile senkronize et
            this.sprites[r1][c1] = imgB;
            this.sprites[r2][c2] = imgA;
            imgA.setData('r', r2).setData('c', c2);
            imgB.setData('r', r1).setData('c', c1);
            resolve();
          }
        },
      });
    });
  }

  // ---------- Eşleşme çözümü / kaskad ----------

  async _resolveBoard() {
    let cascadeMultiplier = 1;

    while (true) {
      const matches = this.board.findMatches();
      if (matches.length === 0) break;

      await this._popMatches(matches, cascadeMultiplier);
      this.board.removeMatches(matches);

      const moves = this.board.collapse();
      await this._animateCollapse(moves);

      const spawns = this.board.refill();
      this._animateSpawns(spawns);
      await this._wait(120);

      cascadeMultiplier++;
    }

    if (!this.board.hasAvailableMoves()) {
      await this._shuffleBoard();
    }
  }

  _popMatches(matches, multiplier) {
    return new Promise(resolve => {
      matches.forEach(({ r, c, type }, i) => {
        const img = this.sprites[r][c];
        if (type === this.levelConfig.targetGemType) {
          this.collected++;
        }

        const { x, y } = this._cellToXY(r, c);
        this.sparkleEmitter.setParticleTint(this.world.gemPalette[type]);
        this.sparkleEmitter.explode(10, x, y);

        this.tweens.add({
          targets: img,
          scale: img.scaleX * 1.3,
          alpha: 0,
          duration: 180,
          ease: 'Back.easeIn',
          onComplete: () => {
            img.destroy();
            if (i === matches.length - 1) resolve();
          },
        });
      });

      this.goalText.setText(`${Math.min(this.collected, this.levelConfig.targetCount)} / ${this.levelConfig.targetCount}`);
      if (matches.length === 0) resolve();
    });
  }

  _animateCollapse(moves) {
    if (moves.length === 0) return Promise.resolve();
    return new Promise(resolve => {
      let remaining = moves.length;
      moves.forEach(({ col, fromRow, toRow }) => {
        const img = this.sprites[fromRow][col];
        this.sprites[toRow][col] = img;
        this.sprites[fromRow][col] = null;
        img.setData('r', toRow);
        const { y } = this._cellToXY(toRow, col);
        this.tweens.add({
          targets: img, y, duration: 220, ease: 'Bounce.easeOut',
          onComplete: () => {
            remaining--;
            if (remaining <= 0) resolve();
          },
        });
      });
    });
  }

  _animateSpawns(spawns) {
    spawns.forEach(({ row, col, type }) => {
      const { x, y } = this._cellToXY(row, col);
      const img = this.add.image(x, y - this.cellSize * (ROWS), `gem_${this.worldId}_${type}`)
        .setDisplaySize(this.cellSize * 0.82, this.cellSize * 0.82)
        .setInteractive({ useHandCursor: true });
      img.setData('r', row).setData('c', col);
      img.on('pointerdown', () => this._onGemClicked(img));
      this.sprites[row][col] = img;

      this.tweens.add({ targets: img, y, duration: 320, ease: 'Bounce.easeOut' });
    });
  }

  async _shuffleBoard() {
    const label = this.add.text(this.scale.width / 2, this.gridY - 24, 'Karıştırılıyor...', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#ffd54f',
    }).setOrigin(0.5);

    this.board.shuffle();
    // Mevcut sprite'ları temizleyip yeni düzene göre yeniden çiz
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.sprites[r][c]?.destroy();
      }
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.sprites[r][c] = this._createGemSprite(r, c, this.board.grid[r][c]);
      }
    }
    await this._wait(400);
    label.destroy();
  }

  _wait(ms) {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }

  // ---------- Bitiş koşulları ----------

  _checkEndConditions() {
    const won = this.collected >= this.levelConfig.targetCount;
    const lost = !won && this.movesLeft <= 0;

    if (won) {
      const { stageChanged, newStage } = livingWorld.completeLevel(this.worldId, this.levelIndex);
      this._showResult(true, stageChanged, newStage);
    } else if (lost) {
      this._showResult(false, false, null);
    }
  }

  _showResult(won, stageChanged, newStage) {
    this.inputLocked = true;
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65).setDepth(100);

    const title = this.add.text(width / 2, height * 0.38, won ? 'Bölüm Tamamlandı! ⭐' : 'Hamle Bitti', {
      fontFamily: 'sans-serif', fontSize: '24px', fontStyle: 'bold', color: won ? '#ffd54f' : '#ff8a80',
    }).setOrigin(0.5).setDepth(101);

    let infoText = won
      ? `${this.world.name} biraz daha canlandı.`
      : 'Tekrar dene, dünya seni bekliyor.';

    if (stageChanged) {
      infoText = `🌱 Dünya değişti!\n${this.world.stageDescriptions[newStage]}`;
    }

    const info = this.add.text(width / 2, height * 0.46, infoText, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff', align: 'center', wordWrap: { width: width * 0.75 },
    }).setOrigin(0.5).setDepth(101);

    const btnLabel = won ? 'Dünyaya Dön' : 'Tekrar Dene';
    const btn = this.add.text(width / 2, height * 0.6, btnLabel, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#0b1f14', backgroundColor: '#ffd54f', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      if (won) {
        this._exitToMap();
      } else {
        this.scene.restart({ worldId: this.worldId, levelIndex: this.levelIndex });
      }
    });
  }

  _exitToMap() {
    this.scene.start('WorldMap', { worldId: this.worldId });
  }
}
