Bu klasöre gerçek sanat varlıklarını (PNG) koyunca oyun otomatik olarak onları kullanır.
Dosya bulunamazsa kod sessizce prosedürel (vektör) çizime döner — yani hiçbir dosya
zorunlu değil, hazır oldukça teker teker ekleyebilirsin.

BEKLENEN DOSYA YOLLARI (isimler ve klasörler birebir bu şekilde olmalı):

assets/sprites/squirrel.png          Sincap karakteri, şeffaf arka plan
assets/sprites/gem_0.png             Meşe Palamudu sembolü, şeffaf arka plan
assets/sprites/gem_1.png             Mantar sembolü
assets/sprites/gem_2.png             Yaprak sembolü
assets/sprites/gem_3.png             Kristal sembolü
assets/sprites/gem_4.png             Kozalak sembolü
assets/sprites/gem_5.png             Orman Çiçeği sembolü
assets/ui/panel-wood.png             Tahta arkası ahşap panel dokusu (match-3 çerçevesi)
assets/backgrounds/emerald-forest.png    Dünya haritası arka planı (dikey, mobil oran)
assets/backgrounds/crystal-cave.png
assets/backgrounds/sky-islands.png
assets/backgrounds/volcano-core.png
assets/backgrounds/frozen-valley.png
assets/backgrounds/ancient-jungle.png

Öneriler:
- Sembol ve karakter görselleri şeffaf arka plan (PNG, alpha kanallı) olmalı.
- Arka plan illüstrasyonları dikey oranda (örn. 1080x1920) olursa mobilde daha iyi kaplar.
- Tüm görsellerin ışık yönü/renk paleti/stil dili tutarlı olursa (aynı AI aracı + benzer
  prompt yapısı) oyun bütün halinde görünür.
