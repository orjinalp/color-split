# Android Google Play publishing base

Bu klasor Android uygulamasinin magaza metinlerini, ekran goruntulerini ve
imzali Android App Bundle (`.aab`) dosyasini Google Play'e Fastlane ile
gondermek icin yeniden kullanilabilir bir tabandir. `metadata` modu Gradle
projesi olmadan calisir. `release` modu icin Android Studio projesi ve Gradle
Wrapper bu klasorde bulunmalidir.

## Yeni oyuna klonlarken

1. Android Studio projesini bu klasore yerlestir. `gradlew` dosyasi
   `android-app/gradlew`, uygulama modulu varsayilan olarak `android-app/app`
   konumunda olmali.
2. `fastlane/metadata/android/en-US` ve `tr-TR` metinlerini yeni oyuna gore
   degistir.
3. Google Play Console'da uygulamayi olustur ve workflow'u calistirirken gercek
   application ID degerini `package_name` alanina yaz.
4. Android projesinin release signing yapilandirmasini kokte uretilen
   `keystore.properties` dosyasini okuyacak sekilde ayarla.
5. Repository secrets degerlerini tanimla.

Paket adi Fastfile icine sabitlenmemistir. Ayni yayin tabani farkli oyunlarda
workflow input'u veya yerel `PACKAGE_NAME` ortam degiskeniyle kullanilabilir.

## Google Play hazirligi

- Google Cloud projesinde Google Play Android Developer API'yi etkinlestir.
- Bir service account olusturup JSON anahtarini indir.
- Google Play Console'da service account'a uygulama erisimi ver. Metadata icin
  store presence, release icin ilgili test/production track izinleri gerekir.
- Uygulama Google Play Console'da onceden olusturulmus olmalidir. Yeni
  uygulamalarda ilk paket yukleme veya sart kabul islemi manuel gerekebilir.

JSON dosyasini PowerShell ile GitHub secret'a uygun base64 metnine cevirme:

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes("C:\path\google-play-service-account.json")
) | Set-Clipboard
```

GitHub'da `Settings > Secrets and variables > Actions` altinda:

- `PLAY_STORE_JSON_KEY_BASE64`: service-account JSON dosyasinin base64 degeri
- `ANDROID_KEYSTORE_BASE64`: upload keystore dosyasinin base64 degeri
- `ANDROID_KEYSTORE_PASSWORD`: keystore parolasi
- `ANDROID_KEY_ALIAS`: anahtar alias degeri
- `ANDROID_KEY_PASSWORD`: anahtar parolasi

Son dort secret yalnizca `release` modu icin gereklidir.

## Android signing ornegi

Uygulama modulundeki `build.gradle` dosyasinda ornek Groovy yapilandirmasi:

```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("keystore.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties["storeFile"])
                storePassword keystoreProperties["storePassword"]
                keyAlias keystoreProperties["keyAlias"]
                keyPassword keystoreProperties["keyPassword"]
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Metadata yapisi

Google Play locale adlari iOS'tan farkli olabilir. ABD Ingilizcesi `en-US`,
Turkiye Turkcesi `tr-TR` olarak tanimlidir.

```text
fastlane/metadata/android/
|-- en-US/
|   |-- title.txt
|   |-- short_description.txt
|   |-- full_description.txt
|   |-- changelogs/default.txt
|   `-- images/phoneScreenshots/*.png
`-- tr-TR/
    `-- ...
```

Istege bagli gorseller `images` altina eklenebilir: `icon.png`,
`featureGraphic.png`, `promoGraphic.png`, `tvBanner.png` ve
`phoneScreenshots/*.png`. Tablet, TV ve Wear klasorleri de Fastlane tarafindan
desteklenir.

## Yerel kullanim

```bash
cd android-app
bundle install

export PACKAGE_NAME="com.example.game"
export PLAY_STORE_JSON_KEY_PATH="/secure/service-account.json"
bundle exec fastlane android metadata
```

Mevcut imzali AAB'yi internal track'e yuklemek icin:

```bash
export AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
export PLAY_TRACK="internal"
export RELEASE_STATUS="completed"
bundle exec fastlane android release
```

`VALIDATE_ONLY=true` degisiklikleri kaydetmeden Google Play dogrulamasi yapar.
Kademeli production dagitiminda `RELEASE_STATUS=inProgress` ve ornegin
`ROLLOUT=0.1` kullanilabilir.

## GitHub Actions

Actions ekranindaki **Android Google Play Release** workflow'unda:

- Yalnizca metin/gorsel icin `mode: metadata`,
- AAB olusturup yuklemek icin `mode: release`,
- Ilk guvenli deneme icin `track: internal`

sec. Workflow ayni branch icin es zamanli iki Play Store duzenlemesi calistirmaz.
