# Sincap Kaşif — Yaşayan Dünyalar

Match-3 türünde, Phaser 3 ile yazılmış, "Living World" sistemine sahip mobil öncelikli bir web oyunu.
Saf HTML + CSS + JavaScript (ES Modules). Build aracı, bundler veya `npm install` gerekmez.

## Çalıştırma (yerel)

Tarayıcılar `file://` üzerinden ES module import'larına izin vermediği için basit bir yerel sunucu gerekir:

```bash
# Proje kök dizininde
python3 -m http.server 8080
# veya
npx serve .
```

Sonra `http://localhost:8080` adresini aç.

## Yayınlama (GitHub Pages)

1. Bu klasörü bir GitHub reposuna push et.
2. Repo **Settings → Pages** kısmından, kaynak olarak `main` branch / `/ (root)` klasörünü seç.
3. Birkaç dakika sonra `https://<kullanici-adi>.github.io/<repo-adi>/` adresinde yayında olur.

Ekstra ayar gerekmez; proje tamamen statik dosyalardan oluşuyor.

## Klasör yapısı

```
index.html                 Giriş noktası, Phaser CDN + main.js yükler
css/style.css               Tam ekran / mobil ayarları
js/main.js                  Phaser config + sahne kaydı
js/data/worldsConfig.js     6 dünyanın tanımı: renk paleti, Living World aşama metinleri
js/systems/LivingWorldManager.js   İlerleme takibi (localStorage), stage hesaplama
js/systems/Match3Board.js          Saf match-3 mantığı (Phaser'dan bağımsız, test edilebilir)
js/systems/GemFactory.js           Taş/sincap/parçacık texture'larını prosedürel üretir
js/scenes/BootScene.js
js/scenes/PreloadScene.js
js/scenes/MainMenuScene.js         Dünya seçim ekranı
js/scenes/WorldMapScene.js         Living World görselleştirmesi + bölüm yolu
js/scenes/GameScene.js             Asıl match-3 oynanışı
```

## Mimari notları

- **Match3Board** render'dan tamamen bağımsız. `GameScene` sadece bu sınıfın döndürdüğü
  eşleşme/collapse/spawn bilgisine göre animasyon oynatır. Bu sayede mantık birim testle
  doğrulanabilir (Phaser çalıştırmadan `node` ile test edildi).
- **LivingWorldManager** tüm ilerlemeyi `localStorage`'da tutar (`squirrelQuest.progress.v1`
  anahtarı altında). Her dünya 0-5 arası 6 "stage"e sahiptir; stage eşikleri dünyanın bölüm
  sayısına göre otomatik hesaplanır (`getStageThresholds`).
- **GemFactory** şu an tüm görselleri (taşlar, sincap, parçacıklar) `Phaser.Graphics` ile
  prosedürel çiziyor — gerçek sanat varlıkları (Pixar tarzı sincap, dünyaya özel taşlar) hazır
  olduğunda, `PreloadScene.preload()` içine `this.load.image(...)` / `this.load.atlas(...)`
  çağrıları eklenip `GemFactory` çağrıları kaldırılabilir. Texture key isimleri
  (`gem_{worldId}_{index}`, `squirrel_placeholder`) aynı kalırsa geri kalan kodda değişiklik
  gerekmez.

## Sırada ne var (öneriler)

1. **Gerçek sanat varlıkları**: sincap karakteri (Pixar-tarzı, mimikli), dünyaya özel taş setleri,
   arka plan illüstrasyonları.
2. **Ses tasarımı**: her dünya için ambiyans + taş kırılma/eşleşme SFX'leri (Preload'a ekle,
   `GameScene._popMatches` içinde çal).
3. **Level bazlı özel hedefler/engeller**: şu an hedefler `GameScene._buildLevelConfig` içinde
   otomatik türetiliyor; el yapımı, engelli (buz bloğu, kilitli kutu vb.) leveller için burada
   dünyaya özel bir `levels/<worldId>.js` config dosyasına geçilebilir.
4. **UIScene ayrımı**: HUD şu an `GameScene` içinde; büyüdükçe ayrı bir `UIScene` (paralel
   çalışan) olarak ayrılması kod düzenini kolaylaştırır.
5. **Telif güvenliği kontrol listesi**: karakter, ikon, UI, müzik, SFX, level tasarımı — hepsi
   özgün üretilmeli; sadece ilham alınmalı.

## Test

Match3Board ve LivingWorldManager, Phaser'ı mock'layan küçük Node script'leriyle mantık
düzeyinde test edildi (rastgele tahtada asla hazır eşleşme oluşmaması, collapse/refill
tutarlılığı, stage geçişleri, localStorage persistence). Gerçek render/animasyon testi için
tarayıcıda manuel oynanış testi önerilir.
