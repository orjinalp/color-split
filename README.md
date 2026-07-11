# Color Split

Canvas tabanlı bir renk sıralama bulmacası. Sıvıları doğru şişelere dökerek her
şişeyi tek renk yap. Tüm ilerleme cihazda saklanır.

## Nasıl oynanır

- Bir şişeye dokun (seçilir), sonra başka bir şişeye dokun; üstteki renk oraya
  dökülür.
- Rengi yalnızca **boş** bir şişeye ya da **üstü aynı renk** olan bir şişeye
  dökebilirsin; hedefte yer olduğu kadarı akar.
- Her şişe tek renk olduğunda bölüm tamamlanır ve altın kazanırsın.
- Güç-artırıcılar (altınla): 💡 İpucu, ↩ Geri Al, ＋ Şişe Ekle.

## Özellikler

- Full-canvas oyun; düz, sade tasarım
- 10 bölüm; deterministik üretim + dahili çözücü (çözülebilirlik garantisi ve
  ipucu için)
- Talep-üzerine render (boşta çizim yapmaz)
- Hamburger menü: Ben, Liderlik Tablosu, Ayarlar, Nasıl Oynanır, Gizlilik
  Politikası, Kullanım Koşulları, Destek, Hakkında
- Liderlik tablosu servisi (`leaderboard.js`) — şimdilik yerel haftalık simülasyon
- Mobil dokunmatik + masaüstü klavye (`R` yeniden başlat, `U` geri al, `H` ipucu)
- PWA: ana ekrana eklenip tam ekran oynanabilir

## Çalıştırma

Statik dosyalardan ibarettir; kurulum gerektirmez.

```bash
python -m http.server 8000
# tarayıcıda: http://localhost:8000
```

`index.html` dosyasını doğrudan tarayıcıda da açabilirsin.

## Proje yapısı

```
.
├── index.html          # sayfa iskeleti + menü DOM
├── game.js             # oyun mantığı ve canvas çizimi
├── menu.js             # hamburger menü + sayfalar + liderlik UI
├── leaderboard.js      # liderlik servisi (yerel simülasyon)
├── style.css           # sayfa ve menü stilleri
├── site.webmanifest    # PWA manifesti
├── favicon.ico, icons/ # ikonlar
└── docs/               # GitHub Pages yayın kopyası (kök ile aynı içerik)
```

## Yayın (GitHub Pages)

Yayın dosyaları `docs/` klasöründedir: **Settings → Pages → Branch: main /
folder: `/docs`**. Web oyununu değiştirdiğinde kökteki dosyaları `docs/`'a da
kopyala (ikisi aynı olmalı).
