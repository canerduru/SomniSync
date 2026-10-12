# SomniSync

Expo + TypeScript mobil MVP. Phase 1–4 ve arşiv keşif/paylaşım ekleri uygulandı. Phase 4: tek OpenAI hesabıyla gerçek AI bağlantıları eklendi; doğrulama ayrıntıları `docs/phase-4-verification.md` içinde.

## Yeni arşiv ve paylaşım özellikleri

- Grimoire içinde altı evrensel ve altı sembolik gruptan oluşan radar; gerçek kayıtlı etiket sayıları, tamamlanmış rüya paydası, eşit baskın temalar ve arama/tarih/etiket ile birlikte çalışan harita filtresi.
- Rüya detayında Bellek, Duygular, Plastisite ve Sembolik keşif bölümleri; doğrulanmış PubMed kaynakları, kanıt türleri ve kişisel düşünme soruları. Kişisel EEG veya biyolojik ölçüm üretilmez. Bu özellik harici AI çağrısı yapmaz.
- Post (1080×1350) ve Story (1080×1920) PNG kartları; native SVG önizlemesi ve web çıktısı ortak yerleşim kullanır. Başlık, tarih, görsel ve üç tema dışında rüya içeriği dışa aktarılmaz.
- Tüm yeni metinler TR/EN desteklidir. Doğrulama: `docs/phase-5-extras-verification.md`.

Bu çalışma alanı artık `/Users/caner/Documents/ChatGPT/SomniSync`. Eski kaynak klasörü ve veritabanı korunmuştur. Yerel `node_modules` önceki çalışma alanındaki kurulu bağımlılıklara bağlanır; bağımsız kurulum için `npm ci` kullan. Yalnızca mevcut public Supabase istemci ayarları `.env.local` içine alındı; sunucu AI anahtarları taşınmadı. Canlı AI sunucusu eski secret dosyasıyla çalışmaya devam edebilir; yeni klasörden başlatacaksan kendi yerel Edge secret yapılandırmanı kullan.

Yeni ekranların bu oturumdaki demosu: http://127.0.0.1:8098/ . `EXPO_PUBLIC_DATA_MODE=demo npx expo export --platform all` ile oluşturuldu; gerçek arşiv veya kullanıcı verisi kullanılmadı. Bu statik önizlemede kök sayfadan menülerle ilerle; doğrudan alt adresi yenilemek için SPA destekli bir sunucu gerekir.

## Yerel çalışma

Node.js 24 LTS, npm, Supabase CLI ve Docker gerekir.

```sh
npm ci
npm run db:start
supabase migration up --local
cp .env.example .env.local
supabase status
npm run functions:serve
```

`.env.local` içine yerel `anon key` değerini ekle. İkinci terminalde `npm start` çalıştır. `.env.local` ve Supabase servis anahtarları kaynak paketine dahil edilmez. Public anon/publishable key istemci içindir; `service_role` ve AI anahtarları asla `EXPO_PUBLIC_*` içine konmaz.

Bu oturumdaki web önizlemesi: http://127.0.0.1:8097/. Giriş hesabını sohbetten kullanabilirsin veya “Yeni hesap oluştur” ile yerel hesap açabilirsin. Önizleme statik Expo çıktısını sunar; kaynak değiştiğinde yeniden export ve sayfa yenilemesi gerekir. Uzak Supabase projesine dağıtım yapılmadı.

iOS/Android geliştirme için `npm start` kullanılabilir. Fiziksel telefonda `127.0.0.1` telefonun kendisini gösterir; `EXPO_PUBLIC_SUPABASE_URL` değerini bilgisayarın aynı ağdaki IP adresine ve `56321` portuna ayarla. Native modüller için SDK ile uyumlu Expo Go veya geliştirme derlemesi gerekir. App Store / Google Play yayını henüz yapılmadı; dağıtım notları `docs/mobile-distribution.md` içinde.

Yerel Auth yapılandırmasında e-posta doğrulaması kapalıdır. Üretimde doğrulanmış e-posta, SMTP ve doğru yönlendirme adresleri ayrıca yapılandırılmalıdır. Şifre alt sınırı uygulamada 8 karakterdir.

## Tamamlanan kapsam

- Türkçe varsayılan, İngilizce hazır i18n; hesapta dil tercihi.
- React Native / Expo Router, Reanimated, siyah-beyaz tema.
- E-posta/şifre ile kayıt ve giriş, oturum yenileme ve çıkış. Native token'lar SecureStore, web token'ları sekmeye bağlı sessionStorage içindedir. Rüya metinleri tarayıcı depolamasına yazılmaz.
- Kalıcı, özel rüya arşivi; tema, metin ve tarih araması; üç mercek; rüya/hesap bazlı ayrı sosyal izinler.
- Gerçek mikrofon kaydı: basılı tutma, en fazla 60 saniye; arka plana geçince durdurma. Kayıt onayında özel ses yükleme, 5 MiB sınırı. Whisper ile otomatik döküm; web kaydı süre doğrulaması için 16 kHz mono WAV biçimine dönüştürülür. Native M4A cihaz testi bekliyor.
- Sunucuda Whisper → GPT-4o-mini strict JSON → GPT Image 2 akışı. Türkçe varsayılan, İngilizce hazır. Görsel: düşük kalite, 1024×1536 PNG. Fal entegrasyonu kullanıcı tercihiyle kaldırıldı.
- Tarihli, geosentrik tropikal gezegen konumları Astronomy Engine ile hesaplanır. Astroloji merceği sembolik olarak etiketlenir; doğum haritası veya doğrulanmamış açılar uydurulmaz.
- Her yeni canlı AI kaydı için ayrı açık izin; sosyal izinler bağımsızdır. Eski örnek AI kayıtları `analysis_source=mock` olarak kalır.
- Kalıcı işlem kimliği, en fazla iki Whisper/GPT denemesi ve tek görsel isteği. Kullanıcı başına varsayılan 3 yeni işlem/gün ve en az 1 dakika aralık. Günlük genel bütçe varsayılan 2 USD; her yeni iş için ihtiyatlı 0,10 USD rezervasyon yapılır. Bu uygulama tahminidir, sağlayıcı faturası üzerinde kesin tavan değildir.
- Son gece için açık izinli farklı kullanıcı sayısına dayanan istatistikler: en az 20 kişi; temayı gören ve görmeyen gruplarda en az 5 kişi. Az veride yüzde gösterilmez.
- Son 30 gündeki izinli temalar üzerinden anonim eşleşmeler; kullanıcı UUID'si, e-posta, rüya metni ve medya sosyal yanıtta bulunmaz. İzin geri çekilince bağlantılar geçersizleşir.
- Özel PNG/ses bucket'ları ve beş dakikalık görsel URL'leri. Filigranlı paylaşım kartı yalnızca bilinçli dışa aktarma ile üretilir.
- Rüya silme, arşivi temizleme, hesap/veri silme; Storage API temizliği tamamlanmadan başarı bildirilmez. Hesap silme hatasında veri kullanımı durur ve işlem tekrar denenebilir.

`EXPO_PUBLIC_DATA_MODE=demo` ile eski bellek içi UI demosu da kullanılabilir. Bu modun örnek kayıtları ve kurgusal eşleşmesi açıkça etiketlidir. Supabase modunda kişisel arşive örnek kayıt eklenmez.

## Yapı

```text
app/                         Expo Router ekranları
src/components/ui/           Ortak görünüm ve tasarım bileşenleri
src/features/auth/           Oturum ve giriş sınırı
src/features/capture/        Mikrofon ve metinle kayıt
src/features/dreams/          Kullanıcıya bağlı arşiv durumu
src/features/sharing/         Yerel paylaşım kartı
src/features/synastry/        Sosyal sorgu durumu
src/i18n/                    TR / EN kaynakları
src/services/contracts/      Sağlayıcıdan bağımsız sözleşmeler
src/services/mock/           Bellek içi demo adaptörleri
src/services/supabase/       Kalıcı arşiv ve sosyal adaptörleri
src/theme/                   Tema ve hareket ayarları
src/types/                   Üretilmiş DB türleri
supabase/migrations/         Şema, RLS, işlemler ve sosyal RPC
supabase/functions/          Kimlik doğrulamalı AI / mock backend
supabase/tests/              Gerçek Postgres üzerinde RLS / AI kota testleri
tests/                       Servis ve backend testleri
```

## Doğrulama

```sh
npm test
npm run typecheck
npm run format:check
npm run db:test
supabase db lint --local --schema public,private
# Run only with a mock-mode Edge server:
npm run test:backend
npm run functions:check
npm run test:ai
npx expo install --check
npx expo export --platform all
```

Backend testi yalnızca `127.0.0.1:56321` üzerindeki SomniSync'e izin verir. Kendi geçici hesaplarını oluşturur ve temizler; silme hatası testindeki tetikleyici yalnızca test hesabının dosyalarını etkiler. Sosyal eşik testlerinin sabit beklentileri için ayrı, boş bir yerel geliştirme veritabanı önerilir. `db:reset` tüm yerel uygulama verilerini siler; mevcut test hesabını korumak istiyorsan kullanma.

11 servis testi, 37 RLS kontrolü, 44 backend kontrolü, Deno tür kontrolü ve iOS/Android/web JavaScript paketlemesi doğrulandı. Fiziksel cihazda mikrofon, SecureStore, native paylaşım ve mağaza derlemeleri henüz test edilmedi. Ayrıntılar `docs/phase-3-verification.md` içinde.

Bağımlılık taramasında 31 uyarı (19 high, 12 moderate) bulunuyor. Uyumsuz Expo düşürmesi uygulanmadı; yayın öncesi Phase 5'te sürüm ve etki değerlendirmesi gerekir.

Arşiv keşif ve paylaşım ekleri tamamlandı. Phase 5’in kalan kapsamı: hata/boş durumlarının kapsamlı incelemesi, gizlilik değerlendirmesi ve içerik içermeyen temel analitik.

## AI kurulumu

```sh
cp supabase/secrets.example supabase/.env.secrets
# Fill OPENAI_API_KEY in your local editor, then:
npm run functions:serve:ai
```

AI anahtarı yalnızca Edge ortamında okunur. `npm run functions:serve` varsayılan mock modunu çalıştırır; mock ve canlı sonuçlar arayüzde ayrı etiketlenir. Canlı modda anahtar eksikse örnek sonuca sessiz geçiş yapılmaz. Anahtar değişirse Edge sunucusunu yeniden başlat. Uzak projede aynı değerler Supabase Edge Function secrets olarak yapılandırılır; uzak dağıtım bu aşamada yapılmadı.

Tamamlanmamış işlerde hassas ara içerik yalnızca servis rolünün eriştiği `private.ai_jobs` içinde tutulur. Başarıda kopya içerik atomik olarak temizlenir. Sürdürme süresi 24 saattir; eski ara içerik sonraki kimlik doğrulamalı yetenek/kayıt isteğinde temizlenir. Boşta geçen sürede zamanlanmış temizlik yoktur. Rüya veya hesap silme iş kayıtlarını da kaldırır. OpenAI’ın kendi veri saklama politikası ayrıca geçerlidir.
