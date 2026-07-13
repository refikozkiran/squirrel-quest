// GemFactory.js
// Oyunun imza sembolleri: 6 doğa temalı, tamamen özgün ikon (jenerik şeker/taş yerine).
// Her ikon katmanlı çizilir: zemin gölgesi -> ana gövde -> doku/detay -> kontur -> parlaklık.
// Bu katman sırası "candy" hissi veren cilalı/3D görünümün kaynağı.
//
// Gerçek illüstrasyonlar hazır olduğunda, bu dosyadaki generateGemTextures çağrısını
// PreloadScene'den kaldırıp yerine this.load.image('gem_0', 'assets/...') gibi çağrılar
// eklemek yeterli; texture key isimleri (gem_0..gem_5) aynı kalmalı.

export const GEM_TYPES = [
  { id: 'acorn', name: 'Meşe Palamudu' },
  { id: 'mushroom', name: 'Mantar' },
  { id: 'leaf', name: 'Yaprak' },
  { id: 'crystal', name: 'Kristal' },
  { id: 'pinecone', name: 'Kozalak' },
  { id: 'flower', name: 'Orman Çiçeği' },
];

// Her sembolün baskın rengi — parçacık efektlerinde (patlama tint'i) kullanılır.
export const GEM_TINTS = [0xd9a066, 0xe1503d, 0x4caf50, 0x7e57c2, 0x8d6e63, 0xf48fb1];

export function generateGemTextures(scene, size = 100) {
  GEM_TYPES.forEach((gem, index) => {
    const key = `gem_${index}`;
    if (scene.textures.exists(key)) return;

    const g = scene.add.graphics();
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;

    _dropShadow(g, cx, cy, r);

    switch (gem.id) {
      case 'acorn': _drawAcorn(g, cx, cy, r); break;
      case 'mushroom': _drawMushroom(g, cx, cy, r); break;
      case 'leaf': _drawLeaf(g, cx, cy, r); break;
      case 'crystal': _drawCrystal(g, cx, cy, r); break;
      case 'pinecone': _drawPinecone(g, cx, cy, r); break;
      case 'flower': _drawFlower(g, cx, cy, r); break;
    }

    g.generateTexture(key, size, size);
    g.destroy();
  });
}

// ---------- Ortak yardımcılar ----------

function _shade(colorHex, amount) {
  return Phaser.Display.Color.IntegerToColor(colorHex).clone().darken(amount).color;
}

function _tintUp(colorHex, amount) {
  return Phaser.Display.Color.IntegerToColor(colorHex).clone().lighten(amount).color;
}

function _dropShadow(g, cx, cy, r) {
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(cx, cy + r * 0.95, r * 1.5, r * 0.5);
}

function _outline(g, color = 0x2b1a0e, width = 3, alpha = 0.55) {
  g.lineStyle(width, color, alpha);
}

// Genel "cilalı" üst parlaklık — tüm ikonların üzerine son katman olarak eklenir.
function _gloss(g, cx, cy, r) {
  g.fillStyle(0xffffff, 0.4);
  g.fillEllipse(cx - r * 0.32, cy - r * 0.4, r * 0.55, r * 0.32);
  g.fillStyle(0xffffff, 0.18);
  g.fillEllipse(cx - r * 0.1, cy - r * 0.15, r * 0.9, r * 0.55);
}

function _polyFillStroke(g, pts, close = true) {
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  if (close) g.closePath();
  g.fillPath();
  g.strokePath();
}

// ---------- 1) Meşe Palamudu (Acorn) ----------

function _drawAcorn(g, cx, cy, r) {
  const bodyColor = 0xd9a066;
  const bodyDark = _shade(bodyColor, 20);
  const capColor = 0x6d4c28;
  const capDark = _shade(capColor, 18);

  // Gövde (fındık kısmı)
  g.fillStyle(bodyColor, 1);
  g.fillEllipse(cx, cy + r * 0.28, r * 1.15, r * 1.35);
  // Alt gölgeleme (hacim hissi)
  g.fillStyle(bodyDark, 0.5);
  g.fillEllipse(cx + r * 0.05, cy + r * 0.55, r * 0.85, r * 0.6);
  _outline(g);
  g.strokeEllipse(cx, cy + r * 0.28, r * 1.15, r * 1.35);

  // Şapka (cap)
  g.fillStyle(capColor, 1);
  g.fillEllipse(cx, cy - r * 0.38, r * 1.35, r * 0.9);
  _outline(g);
  g.strokeEllipse(cx, cy - r * 0.38, r * 1.35, r * 0.9);

  // Şapka dokusu: küçük çapraz çizgiler
  g.lineStyle(2, capDark, 0.8);
  for (let i = -2; i <= 2; i++) {
    const x = cx + i * r * 0.22;
    g.beginPath();
    g.moveTo(x, cy - r * 0.6);
    g.lineTo(x + r * 0.1, cy - r * 0.18);
    g.strokePath();
  }

  // Sap
  g.fillStyle(capDark, 1);
  g.fillRoundedRect(cx - r * 0.08, cy - r * 0.95, r * 0.16, r * 0.28, 3);

  _gloss(g, cx, cy + r * 0.1, r);
}

// ---------- 2) Mantar (Mushroom) ----------

function _drawMushroom(g, cx, cy, r) {
  const capColor = 0xe1503d;
  const capDark = _shade(capColor, 20);
  const stemColor = 0xfff3e0;
  const stemShade = _shade(stemColor, 8);

  // Sap
  g.fillStyle(stemColor, 1);
  g.fillRoundedRect(cx - r * 0.32, cy - r * 0.05, r * 0.64, r * 0.95, r * 0.2);
  _outline(g);
  g.strokeRoundedRect(cx - r * 0.32, cy - r * 0.05, r * 0.64, r * 0.95, r * 0.2);

  // Şapka (kubbe) — üst yarım daire
  g.fillStyle(capColor, 1);
  g.beginPath();
  g.arc(cx, cy - r * 0.05, r * 1.05, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
  g.closePath();
  g.fillPath();
  _outline(g);
  g.beginPath();
  g.arc(cx, cy - r * 0.05, r * 1.05, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
  g.closePath();
  g.strokePath();

  // Şapka altı çizgisi (gill hattı)
  g.fillStyle(capDark, 1);
  g.fillEllipse(cx, cy - r * 0.05, r * 2.1, r * 0.18);

  // Beyaz benekler
  g.fillStyle(0xffffff, 0.95);
  g.fillCircle(cx - r * 0.5, cy - r * 0.55, r * 0.14);
  g.fillCircle(cx + r * 0.42, cy - r * 0.68, r * 0.11);
  g.fillCircle(cx + r * 0.05, cy - r * 0.35, r * 0.09);
  g.fillCircle(cx - r * 0.1, cy - r * 0.78, r * 0.1);

  _gloss(g, cx, cy - r * 0.25, r);
}

// ---------- 3) Yaprak (Leaf) ----------

// İkinci dereceden bezier eğrisini düz çizgi segmentleriyle örnekler (Graphics.quadraticCurveTo'ya
// bağımlı kalmadan, sadece moveTo/lineTo/fillPath gibi temel ve kesin desteklenen metodlarla).
function _quadBezierPoints(p0, cp, p1, segments = 10) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    pts.push({
      x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
      y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y,
    });
  }
  return pts;
}

function _drawLeaf(g, cx, cy, r) {
  const leafColor = 0x4caf50;
  const leafDark = _shade(leafColor, 22);
  const veinColor = _shade(leafColor, 35);

  const bottom = { x: cx, y: cy + r * 1.05 };
  const top = { x: cx, y: cy - r * 1.15 };
  const rightCp = { x: cx + r * 1.25, y: cy + r * 0.2 };
  const leftCp = { x: cx - r * 1.25, y: cy + r * 0.2 };

  const rightCurve = _quadBezierPoints(bottom, rightCp, top, 10);
  const leftCurve = _quadBezierPoints(top, leftCp, bottom, 10);
  const outline = rightCurve.concat(leftCurve.slice(1));

  _outline(g, 0x1b5e20, 3, 0.6);
  g.fillStyle(leafColor, 1);
  _polyFillStroke(g, outline);

  // Sağ yarıyı hafif gölgele (hacim)
  g.fillStyle(leafDark, 0.35);
  _polyFillStroke(g, [bottom, ...rightCurve.slice(1)]);

  // Orta damar
  g.lineStyle(2.5, veinColor, 0.9);
  g.beginPath();
  g.moveTo(cx, cy + r * 0.95);
  g.lineTo(cx, cy - r * 1.0);
  g.strokePath();
  // Yan damarlar
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const y = cy + r * 0.9 - t * r * 1.9;
    g.beginPath();
    g.moveTo(cx, y);
    g.lineTo(cx + r * 0.45 * (1 - t * 0.5), y - r * 0.25);
    g.strokePath();
    g.beginPath();
    g.moveTo(cx, y);
    g.lineTo(cx - r * 0.45 * (1 - t * 0.5), y - r * 0.25);
    g.strokePath();
  }

  // Sap
  g.lineStyle(3, _shade(0x6d4c28, 5), 1);
  g.beginPath();
  g.moveTo(cx, cy + r * 1.0);
  g.lineTo(cx, cy + r * 1.25);
  g.strokePath();

  _gloss(g, cx, cy, r);
}

// ---------- 4) Kristal (Crystal) ----------

function _drawCrystal(g, cx, cy, r) {
  const baseColor = 0x7e57c2;
  const lightFacet = _tintUp(baseColor, 25);
  const darkFacet = _shade(baseColor, 25);

  const top = { x: cx, y: cy - r * 1.2 };
  const left = { x: cx - r * 0.85, y: cy - r * 0.15 };
  const right = { x: cx + r * 0.85, y: cy - r * 0.15 };
  const bottom = { x: cx, y: cy + r * 1.15 };
  const midLeft = { x: cx - r * 0.4, y: cy + r * 0.25 };
  const midRight = { x: cx + r * 0.4, y: cy + r * 0.25 };

  _outline(g, 0x2a1a4a, 3, 0.6);

  // Sol yüz (koyu facet)
  g.fillStyle(darkFacet, 1);
  _polyFillStroke(g, [top, left, midLeft, bottom]);

  // Sağ yüz (açık facet)
  g.fillStyle(lightFacet, 1);
  _polyFillStroke(g, [top, right, midRight, bottom]);

  // Orta ön yüz (ana renk, öne çıkan facet)
  g.fillStyle(baseColor, 1);
  _polyFillStroke(g, [top, midLeft, bottom, midRight]);

  // İnce facet çizgileri (parıltı hissi)
  g.lineStyle(1.5, 0xffffff, 0.5);
  g.beginPath(); g.moveTo(top.x, top.y); g.lineTo(bottom.x, bottom.y); g.strokePath();
  g.beginPath(); g.moveTo(left.x, left.y); g.lineTo(midLeft.x, midLeft.y); g.strokePath();
  g.beginPath(); g.moveTo(right.x, right.y); g.lineTo(midRight.x, midRight.y); g.strokePath();

  // Küçük parıltı yıldızı
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(cx - r * 0.15, cy - r * 0.5, r * 0.07);
  g.fillCircle(cx + r * 0.3, cy - r * 0.1, r * 0.045);

  _gloss(g, cx, cy - r * 0.1, r);
}

// ---------- 5) Kozalak (Pinecone) ----------

function _drawPinecone(g, cx, cy, r) {
  const bodyColor = 0x8d6e63;
  const scaleLight = _tintUp(bodyColor, 12);
  const scaleDark = _shade(bodyColor, 15);

  // Ana gövde (oval)
  g.fillStyle(bodyColor, 1);
  _outline(g, 0x3e2723, 3, 0.55);
  g.fillEllipse(cx, cy + r * 0.1, r * 1.15, r * 1.5);
  g.strokeEllipse(cx, cy + r * 0.1, r * 1.15, r * 1.5);

  // Pul sırası deseni (üst üste binen küçük yapraklar/pullar)
  const rows = 4;
  for (let row = 0; row < rows; row++) {
    const rowY = cy - r * 0.85 + row * (r * 0.65);
    const cols = row % 2 === 0 ? 2 : 3;
    const offsetX = row % 2 === 0 ? r * 0.32 : 0;
    for (let col = 0; col < cols; col++) {
      const scaleX = cx - r * 0.55 + offsetX + col * (r * 0.55);
      const color = (row + col) % 2 === 0 ? scaleLight : scaleDark;
      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(scaleX, rowY);
      g.lineTo(scaleX + r * 0.28, rowY + r * 0.22);
      g.lineTo(scaleX, rowY + r * 0.44);
      g.lineTo(scaleX - r * 0.28, rowY + r * 0.22);
      g.closePath();
      g.fillPath();
    }
  }

  // Sap
  g.fillStyle(_shade(0x6d4c28, 10), 1);
  g.fillRoundedRect(cx - r * 0.07, cy - r * 1.45, r * 0.14, r * 0.3, 3);

  _gloss(g, cx, cy - r * 0.05, r);
}

// ---------- 6) Orman Çiçeği (Forest Flower) ----------

function _drawFlower(g, cx, cy, r) {
  const petalColor = 0xf48fb1;
  const petalLight = _tintUp(petalColor, 15);
  const centerColor = 0xffd54f;

  _outline(g, 0xad1457, 2.5, 0.45);

  const petalCount = 6;
  for (let i = 0; i < petalCount; i++) {
    const angle = (Math.PI * 2 * i) / petalCount;
    const px = cx + Math.cos(angle) * r * 0.62;
    const py = cy + Math.sin(angle) * r * 0.62;
    g.fillStyle(i % 2 === 0 ? petalColor : petalLight, 1);
    g.fillEllipse(px, py, r * 0.62, r * 0.42);
  }
  // Kontur için petalleri tekrar çiz (sadece stroke)
  for (let i = 0; i < petalCount; i++) {
    const angle = (Math.PI * 2 * i) / petalCount;
    const px = cx + Math.cos(angle) * r * 0.62;
    const py = cy + Math.sin(angle) * r * 0.62;
    g.strokeEllipse(px, py, r * 0.62, r * 0.42);
  }

  // Merkez
  g.fillStyle(centerColor, 1);
  g.fillCircle(cx, cy, r * 0.38);
  _outline(g, 0xb8860b, 2, 0.5);
  g.strokeCircle(cx, cy, r * 0.38);

  // Merkez dokusu (polen noktaları)
  g.fillStyle(0xb8860b, 0.6);
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    g.fillCircle(cx + Math.cos(angle) * r * 0.18, cy + Math.sin(angle) * r * 0.18, r * 0.045);
  }

  _gloss(g, cx, cy, r);
}

// ---------- Sincap ve parıltı (öncekiyle aynı) ----------

export function generateSquirrelTexture(scene, key = 'squirrel_placeholder', size = 160) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  const cx = size * 0.42;
  const cy = size * 0.6;

  g.fillStyle(0xd97706, 1);
  g.fillEllipse(size * 0.75, size * 0.4, size * 0.55, size * 0.75);
  g.fillStyle(0xffb677, 1);
  g.fillEllipse(size * 0.75, size * 0.4, size * 0.32, size * 0.5);

  g.fillStyle(0xf08a24, 1);
  g.fillEllipse(cx, cy, size * 0.42, size * 0.5);

  g.fillStyle(0xffe0b2, 1);
  g.fillEllipse(cx, cy + size * 0.08, size * 0.24, size * 0.3);

  g.fillStyle(0xf08a24, 1);
  g.fillCircle(cx, cy - size * 0.32, size * 0.22);

  g.fillCircle(cx - size * 0.14, cy - size * 0.48, size * 0.06);
  g.fillCircle(cx + size * 0.14, cy - size * 0.48, size * 0.06);

  g.fillStyle(0x2b1a0e, 1);
  g.fillCircle(cx - size * 0.08, cy - size * 0.34, size * 0.035);
  g.fillCircle(cx + size * 0.09, cy - size * 0.34, size * 0.035);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(cx - size * 0.07, cy - size * 0.355, size * 0.012);
  g.fillCircle(cx + size * 0.10, cy - size * 0.355, size * 0.012);

  g.fillStyle(0x5d4037, 1);
  g.fillRoundedRect(cx - size * 0.1, cy - size * 0.05, size * 0.22, size * 0.24, 6);

  g.fillStyle(0xffd54f, 1);
  g.fillCircle(cx, cy + size * 0.02, size * 0.045);
  g.lineStyle(2, 0x5d4037, 1);
  g.strokeCircle(cx, cy + size * 0.02, size * 0.045);

  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}

export function generateSparkleTexture(scene, key = 'sparkle', size = 16) {
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(size / 2, size / 2, size / 2);
  g.generateTexture(key, size, size);
  g.destroy();
  return key;
}
