// GemFactory.js
// Gerçek sanat varlıkları (sprite'lar) projeye eklenene kadar, taşları ve sincabı
// Phaser Graphics ile çizip texture'a bastırıyoruz. İleride bu fonksiyonların
// içini `scene.load.image(...)` çağrılarıyla değiştirmek yeterli olacak;
// geri kalan kod (GameScene, WorldMapScene) aynı texture key'lerini kullanmaya devam eder.

const GEM_SHAPES = ['circle', 'star', 'diamond', 'square', 'triangle', 'hex'];

export function generateGemTextures(scene, worldId, gemPalette, size = 96) {
  gemPalette.forEach((color, index) => {
    const key = `gem_${worldId}_${index}`;
    if (scene.textures.exists(key)) return;

    const g = scene.add.graphics();
    const shape = GEM_SHAPES[index % GEM_SHAPES.length];
    const r = size * 0.36;
    const cx = size / 2;
    const cy = size / 2;

    // Yumuşak gölge
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(cx, cy + r * 0.75, r * 1.5, r * 0.5);

    g.fillStyle(color, 1);
    g.lineStyle(4, 0xffffff, 0.85);

    drawShape(g, shape, cx, cy, r);

    // İç parlaklık (AAA hissi için basit highlight)
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(cx - r * 0.3, cy - r * 0.35, r * 0.5, r * 0.3);

    g.generateTexture(key, size, size);
    g.destroy();
  });
}

function drawShape(g, shape, cx, cy, r) {
  switch (shape) {
    case 'circle':
      g.fillCircle(cx, cy, r);
      g.strokeCircle(cx, cy, r);
      break;
    case 'square': {
      const s = r * 1.5;
      g.fillRoundedRect(cx - s / 2, cy - s / 2, s, s, s * 0.25);
      g.strokeRoundedRect(cx - s / 2, cy - s / 2, s, s, s * 0.25);
      break;
    }
    case 'diamond': {
      const pts = [
        { x: cx, y: cy - r * 1.1 },
        { x: cx + r * 0.9, y: cy },
        { x: cx, y: cy + r * 1.1 },
        { x: cx - r * 0.9, y: cy },
      ];
      polyFillStroke(g, pts);
      break;
    }
    case 'triangle': {
      const pts = [
        { x: cx, y: cy - r * 1.05 },
        { x: cx + r * 0.95, y: cy + r * 0.7 },
        { x: cx - r * 0.95, y: cy + r * 0.7 },
      ];
      polyFillStroke(g, pts);
      break;
    }
    case 'hex': {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = Phaser.Math.DegToRad(60 * i - 30);
        pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      }
      polyFillStroke(g, pts);
      break;
    }
    case 'star': {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const angle = Phaser.Math.DegToRad(36 * i - 90);
        const rad = i % 2 === 0 ? r : r * 0.45;
        pts.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
      }
      polyFillStroke(g, pts);
      break;
    }
  }
}

function polyFillStroke(g, pts) {
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.fillPath();
  g.strokePath();
}

// Basit, sevimli placeholder sincap: turuncu gövde + büyük kuyruk + keşif çantası.
// Pixar-tarzı final karaktere geçilene kadar silüet ve orantıyı test etmek için yeterli.
export function generateSquirrelTexture(scene, key = 'squirrel_placeholder', size = 160) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  const cx = size * 0.42;
  const cy = size * 0.6;

  // Kuyruk (büyük, arkada)
  g.fillStyle(0xd97706, 1);
  g.fillEllipse(size * 0.75, size * 0.4, size * 0.55, size * 0.75);
  g.fillStyle(0xffb677, 1);
  g.fillEllipse(size * 0.75, size * 0.4, size * 0.32, size * 0.5);

  // Gövde
  g.fillStyle(0xf08a24, 1);
  g.fillEllipse(cx, cy, size * 0.42, size * 0.5);

  // Karın (açık ton)
  g.fillStyle(0xffe0b2, 1);
  g.fillEllipse(cx, cy + size * 0.08, size * 0.24, size * 0.3);

  // Baş
  g.fillStyle(0xf08a24, 1);
  g.fillCircle(cx, cy - size * 0.32, size * 0.22);

  // Kulaklar
  g.fillCircle(cx - size * 0.14, cy - size * 0.48, size * 0.06);
  g.fillCircle(cx + size * 0.14, cy - size * 0.48, size * 0.06);

  // Gözler (meraklı bakış)
  g.fillStyle(0x2b1a0e, 1);
  g.fillCircle(cx - size * 0.08, cy - size * 0.34, size * 0.035);
  g.fillCircle(cx + size * 0.09, cy - size * 0.34, size * 0.035);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - size * 0.07, cy - size * 0.355, size * 0.012);
  g.fillCircle(cx + size * 0.10, cy - size * 0.355, size * 0.012);

  // Keşif çantası (sırtta)
  g.fillStyle(0x5d4037, 1);
  g.fillRoundedRect(cx - size * 0.1, cy - size * 0.05, size * 0.22, size * 0.24, 6);

  // Pusula (göğüste)
  g.fillStyle(0xffd54f, 1);
  g.fillCircle(cx, cy + size * 0.02, size * 0.045);
  g.lineStyle(2, 0x5d4037, 1);
  g.strokeCircle(cx, cy + size * 0.02, size * 0.045);

  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}

// Küçük parıltı/parçacık texture'ı (particle efektleri için).
export function generateSparkleTexture(scene, key = 'sparkle', size = 16) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}
