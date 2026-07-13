// worldsConfig.js
// Her dünyanın kimliği, renk paleti ve "Living World" aşama (stage) tanımları burada.
// STAGE_COUNT: her dünya 0'dan (ölü/solmuş) 5'e (tamamen canlanmış) kadar 6 aşamadan geçer.

export const STAGE_COUNT = 6; // 0,1,2,3,4,5

// Bir dünyanın stage eşiklerini, o dünyanın toplam bölüm sayısına göre üretir.
// Örn. 20 bölümlük bir dünyada eşikler: [0, 4, 8, 12, 16, 20]
export function getStageThresholds(levelCount) {
  const thresholds = [];
  for (let s = 0; s < STAGE_COUNT; s++) {
    thresholds.push(Math.round((s / (STAGE_COUNT - 1)) * levelCount));
  }
  return thresholds;
}

export const WORLDS = [
  {
    id: 'emerald-forest',
    order: 1,
    name: 'Emerald Forest',
    subtitle: 'Yeşil Orman',
    levelCount: 20,
    palette: {
      dead:  { bg: 0x2b2f28, ground: 0x3a3a30, accent: 0x5c5c4f },
      alive: { bg: 0x123321, ground: 0x2d5a3d, accent: 0x8bc34a },
    },
    gemPalette: [0x4caf50, 0xffd54f, 0xff7043, 0x42a5f5, 0xab47bc, 0xf5f5f5],
    ambience: { particle: 'leaf', loopSfx: 'forest_ambience' },
    stageDescriptions: [
      'Orman kurumuş, dallar çıplak.',
      'Küçük bir dere oluşuyor.',
      'İlk çiçekler açıyor.',
      'Kırık köprü onarılıyor.',
      'Kuşlar ve kelebekler geri dönüyor.',
      'Ormanın koruyucu ruhu uyanıyor.',
    ],
  },
  {
    id: 'crystal-cave',
    order: 2,
    name: 'Crystal Cave',
    subtitle: 'Kristal Mağara',
    levelCount: 20,
    palette: {
      dead:  { bg: 0x1a1a24, ground: 0x2a2a38, accent: 0x4a4a5e },
      alive: { bg: 0x1f1435, ground: 0x3d2a5c, accent: 0xba68c8 },
    },
    gemPalette: [0xba68c8, 0x7e57c2, 0x4fc3f7, 0xff8a65, 0xffd54f, 0xf5f5f5],
    ambience: { particle: 'sparkle', loopSfx: 'cave_echo' },
    stageDescriptions: [
      'Kristaller sönük, mağara karanlık.',
      'İlk kristal ışıldamaya başlıyor.',
      'Yankılar müziğe dönüşüyor.',
      'Kristal köprüler beliriyor.',
      'Mağara duvarları parıldıyor.',
      'Mağaranın kalbi tam güçle parlıyor.',
    ],
  },
  {
    id: 'sky-islands',
    order: 3,
    name: 'Sky Islands',
    subtitle: 'Gökada Adaları',
    levelCount: 20,
    palette: {
      dead:  { bg: 0x2e3440, ground: 0x3b4252, accent: 0x4c566a },
      alive: { bg: 0x4fa8e0, ground: 0xeceff4, accent: 0xffd54f },
    },
    gemPalette: [0x81d4fa, 0xffd54f, 0xff8a80, 0xa5d6a7, 0xce93d8, 0xffffff],
    ambience: { particle: 'cloud-puff', loopSfx: 'wind_high' },
    stageDescriptions: [
      'Adalar dağınık ve bulutlar gri.',
      'İlk ada tekrar yükseliyor.',
      'Rüzgar değirmenleri dönmeye başlıyor.',
      'Gökada köprüleri kuruluyor.',
      'Uçan hayvanlar geri dönüyor.',
      'Adaların hepsi gökyüzünde dans ediyor.',
    ],
  },
  {
    id: 'volcano-core',
    order: 4,
    name: 'Volcano Core',
    subtitle: 'Volkan Çekirdeği',
    levelCount: 20,
    palette: {
      dead:  { bg: 0x2b1a14, ground: 0x3a241a, accent: 0x5c3a26 },
      alive: { bg: 0x3d1408, ground: 0x7a2610, accent: 0xff7043 },
    },
    gemPalette: [0xff7043, 0xffab40, 0xffee58, 0x8d6e63, 0xef5350, 0xf5f5f5],
    ambience: { particle: 'ember', loopSfx: 'lava_rumble' },
    stageDescriptions: [
      'Volkan soğumuş, her yer kül.',
      'İlk lav damarı akmaya başlıyor.',
      'Kayalar yeniden şekilleniyor.',
      'Ateş kristalleri oluşuyor.',
      'Volkan hayvanları ortaya çıkıyor.',
      'Çekirdek tam güçle nabız atıyor.',
    ],
  },
  {
    id: 'frozen-valley',
    order: 5,
    name: 'Frozen Valley',
    subtitle: 'Donmuş Vadi',
    levelCount: 20,
    palette: {
      dead:  { bg: 0x232a30, ground: 0x2e363d, accent: 0x445059 },
      alive: { bg: 0x0d2b3d, ground: 0xa7d8e8, accent: 0x80deea },
    },
    gemPalette: [0x80deea, 0xb3e5fc, 0xce93d8, 0xffffff, 0x90caf9, 0xffd54f],
    ambience: { particle: 'snowflake', loopSfx: 'wind_cold' },
    stageDescriptions: [
      'Vadi buz kesmiş, gökyüzü boz.',
      'İlk kar tanesi süzülüyor.',
      'Buzullar parıldamaya başlıyor.',
      'Aurora gökyüzünde beliriyor.',
      'Kar hayvanları ortaya çıkıyor.',
      'Tüm vadi aurora ışığıyla parlıyor.',
    ],
  },
  {
    id: 'ancient-jungle',
    order: 6,
    name: 'Ancient Jungle',
    subtitle: 'Kadim Orman',
    levelCount: 20,
    palette: {
      dead:  { bg: 0x1c2418, ground: 0x27301f, accent: 0x3a4a2e },
      alive: { bg: 0x0f2e14, ground: 0x1f4d22, accent: 0xc9a227 },
    },
    gemPalette: [0x66bb6a, 0xc9a227, 0xef5350, 0x42a5f5, 0xab47bc, 0xf5f5f5],
    ambience: { particle: 'pollen', loopSfx: 'jungle_deep' },
    stageDescriptions: [
      'Dev ağaçlar sessiz, tapınaklar toprak altında.',
      'İlk kök toprağı yarıyor.',
      'Tapınak taşları ortaya çıkıyor.',
      'Kadim semboller ışıldıyor.',
      'Orman ruhları uyanıyor.',
      'Kadim tapınak tam ihtişamıyla açığa çıkıyor.',
    ],
  },
];

export function getWorldById(id) {
  return WORLDS.find(w => w.id === id);
}

export function getNextWorld(id) {
  const w = getWorldById(id);
  if (!w) return null;
  return WORLDS.find(x => x.order === w.order + 1) || null;
}
