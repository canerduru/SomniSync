# Telefona kurulum

SomniSync, React Native / Expo tabanlı gerçek bir mobil uygulamadır. Web bağlantısı geliştirme önizlemesidir; APK veya iOS kurulum paketi değildir.

## Android

EAS Build ile test için kurulabilir APK hazırlanabilir. Google Play yayını için AAB derlemesi ve Google Play geliştirici hesabı gerekir. APK testi için mağaza yayını şart değildir.

## iOS

TestFlight dağıtımı için Apple Developer hesabı, imzalı iOS derlemesi ve App Store Connect üzerinden yükleme gerekir. Alternatif olarak kayıtlı cihazlarla ad hoc dağıtım kullanılabilir. App Store yayını ayrıca mağaza incelemesine tabidir.

## Bu aşamada

Phase 2 sonunda native JavaScript paketleri iOS ve Android için başarıyla üretildi. Bu, imzalı uygulama derlemesi veya fiziksel cihaz testi değildir. APK, IPA, TestFlight yüklemesi veya mağaza yayını henüz yapılmadı. Dağıtım hesaplarına bağlanılmadı ve hiçbir ücretli build başlatılmadı.

Backend, AI ve hardening aşamalarından sonra dağıtım için uygulama kimlikleri, imzalama ve geliştirici hesapları birlikte yapılandırılabilir. `app.config.ts` içindeki bundle/package kimlikleri geliştirme taslağıdır; yayın öncesi kesinleştirilmelidir.

Kaynaklar:

- [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Expo TestFlight distribution](https://docs.expo.dev/submit/testflight/)
- [Expo app store submission](https://docs.expo.dev/deploy/submit-to-app-stores/)
