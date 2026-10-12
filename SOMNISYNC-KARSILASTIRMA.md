# SomniSync karşılaştırması — 11 Ekim 2026

İncelenen GitHub sürümü: `canerduru/SomniSync`, `main`, commit `c76589e4af3f59d349e8ca97bdf1732d9e20d6a4`.

Yerel sürüm: `/Users/caner/Documents/Codex/2026-10-11/8-gamification-quality-over-volume-points/outputs/somnisync`.

Karar konusu: Gerçek kullanıcılarla çalışacak mobil ürün için hangi kod tabanı daha gelişmiş; diğerinden hangi özellikler alınabilir? Kullanıcı bir yayın tarihi veya bütçe sınırı belirtmedi. İnceleme kaynak kod, şema, servis bağlantıları ve sınırlı yerel kontroller üzerinden yapıldı. Görsel tasarım kalitesi, cihaz davranışı veya canlı GitHub dağıtımı karşılaştırılmadı. Depodaki README iddiaları tek başına çalışan özellik kabul edilmedi.

## Sonuç

Yerel sürüm, mobil ürün altyapısı, gerçek hesaplar, sunucuda veri işleme, mahremiyet ve hata sonrası devam etme açısından daha ileride. GitHub sürümü, radar, bilimsel içerik panelleri ve farklı paylaşım biçimleri açısından daha geniş bir arayüz prototipi. Bilimsel panel sayısının fazla olması, kişiye ait nörolojik ölçümlerin yapıldığı anlamına gelmiyor: gösterilen birçok değer kodda sabit veya anahtar kelimeye göre seçiliyor.

## Özellik matrisi

| Alan | Yerel sürüm | GitHub sürümü | Değerlendirme |
|---|---|---|---|
| Platform | Expo / React Native, iOS + Android + web | React / Vite, mobil görünümlü web | Mobil uygulama temeli yerelde daha gelişmiş; cihaz testleri bekliyor |
| Hesap | Supabase e-posta/şifre, oturum yönetimi | LocalStorage içinde üretilen anonim kullanıcı ve sahte token | Yerel daha gelişmiş |
| Rüya deposu | Kullanıcıya bağlı Supabase kayıtları | LocalStorage; SQL şeması uygulama deposuna bağlı değil | Yerel daha gelişmiş; GitHub tarayıcı içinde kalıcılık sağlar |
| Ses | Expo Audio; 60 sn sınır; WAV dönüşümü; Whisper | MediaRecorder; başarısızlıkta simüle ses; Whisper çağrısı için servis kodu | Yerel daha kapsamlı; GitHub README'deki Web Speech API kodda bulunmadı |
| Yorum | Üç mercek; strict JSON Schema + sunucu doğrulaması | Üç yorum + scientificBasis; json_object, sonrasında JSON.parse | GitHub ek içerikte, yerel sözleşme doğrulamasında ileride |
| AI bağlantısı | OpenAI akışı; canlı/mock açık ayrımı | OpenAI/Fal Edge kodu; başarısızlıkta sessiz mock dönüşü | Yerel daha gelişmiş; README'deki Gemini anlatımı aktif Edge koduyla örtüşmüyor |
| Görsel | Üretim, özel bucket, kayıtlı dosya yolu | Fal isteği + stok görsel; ayrı promptOnly istemcisi endpoint ile uyumsuz | Yerel daha gelişmiş; GitHub canlı uçtan uca akışı doğrulanmadı |
| Tekrar deneme / maliyet | Kalıcı işlem kimliği, aşama önbelleği, DB kotası ve rezervasyon | Worker içi Map kotası, istemciden gelen userId, genel fetch retry | Yerel daha gelişmiş; rezervasyon gerçek faturada kesin üst sınır değil |
| Medya gizliliği | Özel ses/görsel bucket, 5 dk imzalı URL | Blob URL ve dış görsel URL'leri; gerçek upload kodu yok | Yerel daha gelişmiş |
| Silme | Storage temizliği + DB/Auth; hata sonrası tekrar | LocalStorage kayıt silme; boş arşivde örnekler yeniden oluşabilir | Yerel daha gelişmiş |
| İzinler | AI için ayrı onay; hesap + rüya sosyal izinleri varsayılan kapalı | Kayıt ve üretilen profilde sosyal izin varsayılan açık | Yerel daha gelişmiş |
| Kolektif istatistik | İzinli farklı kullanıcılar; 20 kişi ve 5/5 eşikleri; tarih/saat dilimi | Tarayıcıdaki demo/kullanıcı rüyaları; çalışan depoda saat filtresi uygulanmıyor | Yerel daha gelişmiş |
| Eşleşme | Supabase RPC, son 30 gün, anonim etiketler, iznin geri çekilmesi | Sabit üç aday; Jaccard sonucu 50–98 aralığına taşınıyor | Yerel gerçek çok kullanıcılı altyapıda ileride |
| Radar | Yok | 6 evrensel + 6 Jungiyen eksen, tıklayarak arşiv filtresi | GitHub'dan alınabilecek belirgin avantaj; sayısal sunum düzeltilmeli |
| Bilimsel içerik | Genel nörobilimsel mercek; özel literatür paneli yok | NeuroAnalysisPanel, DeepDive, bibliyografya, Europe PMC araması | GitHub'da kapsam daha geniş; kişiselleştirme ve atıf güvenilirliği ayrı çalışma istiyor |
| Gökyüzü bağlamı | Astronomy Engine ile tarihli gezegen konumları; sembolik etiket | Sabit ay fazı yazısı ve hesaplanmayan astrolojik metinler | Yerel hesaplama bakımından ileride |
| Paylaşım | Filigranlı tek kart; native/web dışa aktarım | Canvas, 4:5 post + 9:16 story, panoya kopyalama/indirme | GitHub biçim seçeneklerinde ileride; native cihaz doğrulaması ayrı |
| Dil | TR/EN, anahtar eşitliği testi | TR/EN context; bilimsel panellerde ve kontrollerde sabit Türkçe metinler | İkisinde de altyapı var; yerelde daha tutarlı doğrulama |
| Oyunlaştırma | Puan/seri/rozet sistemi yok | İşlevsel puan/seri/rozet sistemi bulunmadı | İkisinde de eksik |
| Test | Servis, AI, SQL ve backend test kaynakları | Test betiği veya test dosyası bulunmadı | Yerel daha gelişmiş |
| Yayın | Yerel geliştirme; mağaza ve uzak Supabase yayını belgelerde yok | Kaynak var; canlı dağıtım ve mağaza yayını doğrulanmadı | İkisi için de yayın hazır sonucu çıkarılamaz |

## Somut GitHub bulguları

1. **Arşiv verisi kaybı riski:** DreamRepository constructor'ı, depodaki kayıt sayısı 8'den azsa tüm rüya listesini başlangıç örnekleriyle değiştiriyor. Tek gerçek kayıt içeren bellek içi LocalStorage ile yeniden üretildi; gerçek kayıt kayboldu. Kullanıcının gerçek tarayıcı verisine dokunulmadı. [Kod, satır 15–19](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/db/DreamRepository.ts#L15).
2. **Canlı AI başarısızlığında örnek sonuç:** LiveEdgeFunctionService üç aşamada hataları yutup mock servis döndürüyor. Mikrofon izni alınamayınca da simüle ses veriliyor. Kullanıcı gerçek analizle demo sonucu ayırmakta zorlanabilir. [AI servis kodu](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/ai/live/LiveEdgeFunctionService.ts), [ses servisi](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/audio/AudioRecorderService.ts).
3. **Görsel endpoint sözleşmesi uyumsuz:** İstemci `{promptOnly:true,prompt}` gönderiyor; Edge bunu ayrı bir eylem olarak ele almıyor ve `transcript` boş olduğundan 400 döndüren dala giriyor. İstemci sonuçta stok/mock görsele düşüyor. Ayrıca ses çağrısı zaten bütün analizi çalıştırırken istemci dönen analiz/görseli kullanmayıp yeniden analiz istiyor. [İstemci](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/ai/live/LiveEdgeFunctionService.ts), [Edge](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/supabase/functions/analyze-dream/index.ts).
4. **Kimlik ve kota:** Edge kodu doğrulanmış JWT'den kullanıcı çıkarmıyor; body/form içindeki userId'yi veya `anonymous` değerini kullanıyor. İstemci Authorization bearer göndermiyor. Worker içi Map kalıcı kota sağlamıyor. Platform JWT denetiminin dağıtımda nasıl ayarlandığı bilinmediği için herkese açık erişim kesinleşmiş bir bulgu değildir; uygulama kodunda kullanıcı bazlı yetkilendirme eksiktir. [Edge kodu](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/supabase/functions/analyze-dream/index.ts).
5. **Nörolojik metrikler:** `6.4x`, `165 Hz`, `%91.8 / %87.4`, `-%18.6`, `5.8 Hz` değerleri sabit stringler; konsolidasyon yüzdesi birkaç sözcük bulunmasına göre seçiliyor. Kodda EEG veya biyolojik sensör ölçüm girdisi yok. Bunlar kişisel ölçüm sonucu olarak sunulmamalı. [Metriklerin tanımı, satır 80](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/components/neuro/GrimoireNeuroDetailSection.tsx#L80).
6. **Radar ve eşleşme sayıları:** Boş arşivin altı radar ekseninde de yoğunluk 15. `düşündüm` ifadesi alt dize `düş` nedeniyle düşme temasına eşleşiyor. Eşleşmede 1/4 Jaccard=%25 iken görünen sonuç %62. Üçü de izole çalıştırmayla doğrulandı. [Tema motoru](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/utils/themeAnalyzer.ts), [eşleşme motoru](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/synastry/MatchingEngine.ts).
7. **İstatistik kapsamı:** Çalışan repository `timeWindowHours` değerini kayıtlara filtre olarak uygulamıyor; demo rüyalarını da dahil ediyor. SQL'deki ayrı RPC zaman filtresi içeriyor ama UI o RPC'yi çağırmıyor. Hesap izinlerini ve küçük grup gizlilik eşiklerini de uygulamıyor. [Repository, satır 376](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/db/DreamRepository.ts#L376).
8. **Literatür servisi sınırı:** Europe PMC için gerçek fetch kodu mevcut; sorgu rüya metninden bağımsız sabit bir arama. Gelen makalelere aynı bulgu ve `Experimental EEG/fMRI` etiketi atanıyor. Bu, makaleyi okuyup rüyayla ilgili kanıtı doğrulayan bir sistem değil. Atıfların bibliyografik doğruluğu bu incelemede tek tek doğrulanmadı. [PubMedService](https://github.com/canerduru/SomniSync/blob/c76589e4af3f59d349e8ca97bdf1732d9e20d6a4/src/services/science/PubMedService.ts).

## Yerel sürümde kalan işler

- GitHub'daki radar/etkileşimli filtre, kaynak paneli ve iki paylaşım oranı yerelde bulunmuyor.
- Bilimsel açıklama, kanıt düzeyi ve sembolik yorumların ayrımı daha ileri geliştirilebilir. Mevcut AI açıklamalarının bilimsel doğruluğu test sayısıyla kanıtlanmış değildir.
- Puan, seri, rozet ve kalite odaklı oyunlaştırma henüz uygulanmadı.
- Fiziksel iOS/Android mikrofon, M4A, SecureStore ve paylaşım testleri bekliyor.
- Mevcut belgelerde bağımlılık güvenlik uyarıları raporlanıyor; bu incelemede yeni dependency audit yapılmadı.
- Başarısız AI işlerini boşta temizleyen zamanlanmış işlem yok; temizlik sonraki yetkili istekte tetikleniyor.
- Kapsamlı gizlilik/kalite incelemesi ve mağaza yayını bekliyor.

## Karar ve duyarlılık

Gerçek mobil ürün için mevcut yerel temeli korumak ve GitHub'daki yararlı arayüz fikirlerini kontrollü taşımak daha uygun. Sayısal puanlar ölçüm değil, kod incelemesine dayalı editoryal tahminlerdir. Yayına hazırlık ve veri güvenilirliği öncelikli varsayımıyla ağırlıklar önceden şu şekilde ele alındı: backend/veri güvenilirliği %50, mobil altyapı %30, keşif/raporlama arayüzü %20.

| Ölçüt | Yerel (1–5, tahmini) | GitHub (1–5, tahmini) | Dayanak |
|---|---:|---:|---|
| Backend/veri güvenilirliği (%50) | 4 | 1 | Gerçek Auth/DB, özel medya ve kalıcı işler karşısında local demo depolama |
| Mobil altyapı (%30) | 4 | 2 | Native Expo hedefleri karşısında web; ikisinde de cihaz doğrulaması eksik |
| Keşif/raporlama arayüzü (%20) | 2 | 4 | GitHub radar, detay panelleri ve iki kart biçimi içeriyor |
| Ağırlıklı sonuç | 3.6 | 1.9 | Bu bir kalite ölçümü veya yayın sertifikası değildir |

En yüksek ağırlığı %50'den %40'a indirip arayüzü %30'a yükseltmek sonucu değiştirmiyor: yerel 3.4, GitHub 2.2. Öncelik yalnızca web arayüzü demosuysa tercih değişebilir; arayüz ölçütünün ağırlığı kabaca %60–65'in üstüne çıkarsa GitHub öne geçebilir. Bu eşik diğer iki ağırlığın nasıl dağıtıldığına bağlıdır. Gerçek Auth/DB ve doğru sayı gösterimi zorunluysa GitHub mevcut haliyle bu koşulları karşılamıyor.

Arayüz fikirlerini tek tek taşımak geri alınabilir bir tercih. Tüm kod tabanını değiştirmek React web → React Native uyarlaması, veri modeli dönüşümü ve yeniden doğrulama maliyeti getirir. Saat veya parasal tahmin için yeterli kapsam yok. Bu inceleme hiçbir uygulama kaynak dosyasını değiştirmedi.

## Bu turdaki kontroller

- Yerel `npm test`: 11/11 geçti.
- Yerel `npm run typecheck`: çıkış kodu 0.
- GitHub kodundan TypeScript derleyicisiyle izole yüklenen modüllerde beş kontrol doğrulandı: boş radar, alt dize tema hatası, şişirilmiş eşleşme, başlangıçta veri değiştirme ve zaman filtresi uygulanmaması. Bunlar uçtan uca tarayıcı veya production testleri değildir.
- GitHub bağımlılıkları kurulmadı; `npm run build` / `npm run lint` çalıştırılmadı. Derlenmiyor veya çalışıyor iddiası yok.
- Canlı AI çağrısı, ücretli API isteği, gerçek kullanıcı verisi değişikliği, DB sıfırlama ve deployment yapılmadı.
- Yerel belgelerdeki eski 19 AI, 62 SQL ve 44 backend kontrolü bu turda tekrar çalıştırılmadı; güncel geçmiş başarı olarak sunulmadı.
