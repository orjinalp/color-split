# Color Split — iOS

Color Split'in HTML/Canvas/JavaScript oyununu yerel bir `WKWebView` içinde
çalıştıran iPhone ve iPad uygulamasıdır. Oyun dosyaları pakete gömülür; temel
oynanış çevrimdışı çalışır ve ilerleme `localStorage` içinde saklanır.

- Bundle ID: `com.orjinalp.colorsplit`
- Uygulama/proje/scheme: `ColorSplit`
- Görünen ad: `Color Split`
- Minimum iOS: 15.0
- Cihazlar: iPhone ve iPad, dikey kullanım

## Web oyununu senkronlama

`docs/` web sürümünün kaynak kopyasıdır. iOS paketini güncellemek için:

```bash
cd ios-app
./sync-web.sh
```

## Xcode projesini üretme ve test

```bash
cd ios-app
xcodegen generate
open ColorSplit.xcodeproj

xcodebuild -project ColorSplit.xcodeproj -scheme ColorSplit \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro Max' build
```

## Reklam köprüsü

Google Mobile Ads SDK Swift Package Manager üzerinden eklenir. Alt alanda yerel
bir banner gösterilir. Oyundaki altın
bonusuna dokunulduğunda JavaScript, `colorSplitRewardedAd` mesajını yerel kabuğa
gönderir; altın yalnızca SDK ödülün kazanıldığını bildirdiğinde verilir.

- AdMob App ID: `Sources/Info.plist`
- Ödüllü reklam birimi: `Sources/GameViewController.swift`

Canlıya çıkmadan önce bu iki kimliğin AdMob'daki Color Split uygulama kaydına ait
olduğunu doğrula. Test sırasında canlı reklamlara tıklama.

## App Store Connect

Yeni uygulama kaydını şu değerlerle aç:

- Ad: `Color Split`
- Bundle ID: `com.orjinalp.colorsplit`
- SKU önerisi: `color-split-ios-2026`
- Birincil dil: Türkçe

Metadata `fastlane/metadata`, kaynak mağaza metni ve ekran görüntüleri ise
`../app-store` altındadır.

```bash
bundle install
bundle exec fastlane ios metadata
bundle exec fastlane ios release
```

`release` lane'i sertifika/profil ve App Store Connect API secrets değerlerini
bekler: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_PATH` ve dağıtım sertifikası.
GitHub Actions akışı için `ASC_KEY_ID`, `ASC_ISSUER_ID`,
`ASC_KEY_P8_BASE64`, `IOS_DIST_CERT_P12_BASE64` ve
`IOS_DIST_CERT_P12_PASSWORD` repository secret'larını tanımla.

App Privacy otomatik yüklenmez. Google Mobile Ads veri işleyebildiği için App
Store Connect'teki gizlilik soruları canlı AdMob yapılandırmasına göre hesap
sahibi/admin tarafından doldurulmalıdır.

## Yerel arşiv

```bash
./archive.sh YOUR_TEAM_ID
```

Çıktı `build/export/` altında oluşur.
