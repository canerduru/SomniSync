# SomniSync — uygulama ve doğrulama kaydı

Tarih: 12 Ekim 2026. Çalışma alanı: `/Users/caner/Documents/ChatGPT/SomniSync`.

## Teslim edilen davranış

- Rüyadaki gözlemler birebir metin alıntısı ve transkript revizyonuyla saklanıyor. Olumsuzluk, belirsizlik, uyanık yaşam ve başkasına ait deneyim için ayrı alanlar var. Kullanıcı gözlemi dışlayıp geri alabiliyor.
- Metin düzeltmesi eski analiz, etiket ve görsel bağlantılarını geçersiz kılıyor. Yeniden analiz ayrı işlem; eski revizyon sonuçları kaydı ezemiyor.
- Bilimsel açıklamalar üç gözden geçirilmiş yayınlık ortak katalogdan seçiliyor. Kaynak, çalışma türü ve sınırlılık gösteriliyor. Sembolik yorumlar ayrı etiketleniyor. Bu sürüm otomatik literatür taraması veya kapsamlı RAG değildir.
- İsteğe bağlı günlük uyku süresi, uyku kalitesi, stres, duygu ve tekrar bilgisi topluyor. Boş cevap sıfırdan ayrılıyor; bunlar kullanıcı beyanı, fizyolojik ölçüm veya doğrulanmış klinik ölçek değildir.
- Özet ve radar güncel raporları kullanıyor; demo/canlı kayıtlar ayrılıyor. Olası kopyalar kullanıcı ayrı olay olarak onaylayana kadar dışlanıyor. Aynı rüyanın farklı günlerde tekrarı korunuyor.
- Türkçe ve İngilizce arayüz güncellendi. Var olan kullanıcı sahipliği, özel medya, onay ve silme akışları korundu.

## Çalıştırılan doğrulama

| Kontrol | Sonuç |
| --- | --- |
| `npm test` | 58 test geçti |
| `npm run typecheck` | Geçti |
| `npm run typecheck:edge` | Geçti; son create idempotency düzeltmesi dahil |
| `npm run format:check` | Geçti |
| `supabase test db` | 3 dosyada 75 kontrol geçti |
| `npm run test:backend` | Son tekrar dahil 55 assertion geçti |
| Expo web/iOS/Android export | Üç platformun derlemesi geçti |
| Bağımsız kod incelemesi | Önemli bulgular düzeltildi; [rapor](grounded-science-review.md) |

Backend kontrolleri yerel Supabase üzerinde gerçek kimlik doğrulama, kullanıcılar arası erişim reddi, özel dosya erişimi, günlük, gözlem reddetme, revizyon çakışması, tekrar deneme ve hesap/medya silme akışlarını içeriyor. Canlı ücretli model çağrısı yapılmadı.

Tarayıcıda günlük kaydetme, gözlem çıkarma, metin düzeltme ve yeniden analiz denendi. “Korkmadım. Beni biri kovalıyordu.” örneğinin demo yeniden analizinde takip teması kaldı, korku etiketi üretilmedi; günlük korundu. Sonrasında önizleme başlangıç demo verilerine döndürüldü. [Ekran görüntüsü](previews/grounded-evidence.png).

## Yerel çalışma ve yayınlama

Yerel veritabanına `20261012001100_grounded_science.sql` ve `20261012001200_grounded_hardening.sql` migration'ları uygulandı. Edge Functions yeni çalışma alanından sunuluyor. Web önizleme `http://127.0.0.1:8098/grimoire` adresinde demo modunda güncel export'u gösteriyor.

Uzak Supabase veya GitHub'a yayın yapılmadı. Uzak ortama geçerken önce migration'lar uygulanmalı, ardından `dreams-api` yeni paylaşılan modülleriyle deploy edilmeli ve istemci derlemesi güncellenmelidir. Canlı modda mevcut sunucu API anahtarı ve açık işleme onayı gerekir; anahtar istemciye konulmamalıdır. Mevcut eski kayıtlar yeni dayanak raporuna sahip olmak için yeniden analiz edilebilir.

## Ölçülmeyenler ve sınırlar

58 test, model doğruluk yüzdesi değildir. Birebir alıntı doğrulaması alıntının anlamının doğru çözümlendiğini tek başına kanıtlamaz. Demo çıkarımı muhafazakâr kurallarla çalışır; geçerli gözlemleri atlayabilir. Canlı LLM anlamsal doğruluğu için bağımsız insan etiketli Türkçe değerlendirme ve gerçek provider ölçümü gerekir.

Fiziksel iOS/Android cihaz testi yapılmadı; export başarısı cihaz testi yerine geçmez. Klinik doğrulama, kişisel teşhis ve nedensellik iddiası yoktur. Yeni model eğitimi veya gizli araştırma verisi toplama akışı eklenmedi.
