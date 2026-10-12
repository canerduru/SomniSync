# Phase 4 doğrulaması

11 Ekim 2026 tarihinde yerel Supabase ve gerçek OpenAI API üzerinde yapıldı. Kullanıcı tek OpenAI hesabını seçti; Fal gereksinimi kaldırıldı. Uzak Supabase dağıtımı veya mağaza yayını yapılmadı.

| Kontrol | Sonuç |
| --- | --- |
| Servis ve i18n testleri | 11 / 11 |
| AI sağlayıcı / işlem testleri | 19 / 19; ağ izni olmadan sahte sağlayıcılarla |
| Gerçek Postgres testleri | 62 / 62; 37 RLS + 25 AI işlem/kota kontrolü |
| TypeScript, Edge tür kontrolü, Prettier | Geçti |
| Public/private şema lint | Hata yok |
| iOS / Android Hermes ve web export | Geçti |
| Gerçek metin → GPT-4o-mini → GPT Image 2 → private Storage / DB | Geçti |
| Gerçek ses → Whisper → Türkçe mercekler → görsel → private Storage / DB | Geçti |
| Gerçek işlem kimliğiyle tekrar deneme | Yeni işlem oluşturmadan hazır kayıt döndü |
| Test hesabı ve ses/görsel temizliği | Her başarılı denemeden sonra Edge üzerinden tamamlandı |
| Tarayıcıda canlı AI izin ekranı | Ayrı sekmede açıldı; izin varsayılan kapalı |

Kurgusal Türkçe deniz/uçuş rüyasıyla yapılan metin denemesi üç yorum, tarihli gökyüzü konumları, özel PNG ve AI izin zamanı üretti. Ses denemesi OpenAI Whisper deposundaki halka açık 11 saniyelik `tests/jfk.flac` örneğinin WAV dönüşümüyle yapıldı; kullanıcının sesleri veya rüyaları kullanılmadı. Türkçe locale ile döküm ve üç yorum üretildi. Bu örnek gerçek bir rüya olmadığından yorum anlam kalitesi için bir referans değildir. Üretilen metinler incelendikten sonra isteme, anlatıda olmayan sahneleri uydurmama ve eksik ayrıntıyı belirtme kuralı ayrıca güçlendirildi; bu son istem değişikliği için yeni ücretli görsel denemesi yapılmadı.

Canlı denemeler geçici Auth hesaplarında yapıldı. Başarılı örneklerde `status=ready`, `analysis_source=live`, AI izin zamanı, üç mercek, özel medya ve kapalı sosyal izinler doğrulandı. Hesaplar, işlem kayıtları ve uzaktaki yerel Storage dosyaları silindi. Kurgusal test görselleri inceleme için `outputs/` içinde saklandı. Önizleme hesabı ve kullanıcının rüyaları korundu. API anahtarı istemciye, kaynak ZIP'e veya test çıktısına eklenmedi.

AI testleri; strict JSON ve duplicate tag reddi, dil talimatları, iletişim bilgisi ayıklama, gerçek WAV süre sınırı, hesaplanan gökyüzü konumları, ses yükleme hatası sonrası Whisper'ı tekrar çağırmama, kaydedilmiş görsel sonrası DB hatasından sürdürme, belirsiz görsel yanıtında tekrar ücretli çağrı yapmama, iki deneme sınırı, açık izin, süre aşımı, sağlayıcı kotası ve güvenlik filtresini kapsar. Görsel yanıtında yalnızca boyut sınırına ve PNG imzasına uyan base64 veri kabul edilir; dış URL indirilmez.

DB testleri; özel işlem payload'larının yalıtımı, RPC yetkileri, kaynağın/izin zamanının istemciden değiştirilememesi, idempotency, kullanıcı/gün ve global bütçe rezervasyonu, kalıcı deneme sayaçları, atomik analiz/işlem tamamlama ve hesap silme cascade kontrollerini kapsar. Bütçe/kota testleri transaction içinde rollback edilir.

İlk pgTAP denemesinde, yetkisiz RPC çağrısını `throws_ok` içinde çalıştırmak yerel Postgres sürecinde çökme tetikledi. Bağlantı kurtuldu; uygulama verileri sıfırlanmadı. RPC yetkisi aynı kapsamda `has_function_privilege` ile denetlenerek test aracı yolu değiştirildi ve tüm 62 kontrol geçti. Bu yerel test-runtime sorunu uygulama düzeyinde giderilmiş bir Postgres hatası olarak sunulmaz.

Ayrıca authenticated istemciden iç `ai_get_dream_job` RPC çağrısı gerçek PostgREST üzerinden denendi: 403 döndü ve sunucu sonraki yetenek isteğine 200/live yanıtı verdi.

## Sınırlar

- Fiziksel iOS/Android kayıt, native M4A süre okuma, SecureStore ve native paylaşım henüz test edilmedi. Paketleme, cihazda çalışma testi yerine geçmez.
- Tarayıcı kayıt dönüşümü derlendi; gerçek mikrofon izni kullanıcı adına açılmadı. Whisper sunucu akışı dosya tabanlı test edildi.
- Türkçe/İngilizce kaynak anahtarları eşit; dil istemle yönlendirilir. Yorumların anlamı, uydurma ayrıntılar ve astrolojik anlatım için daha geniş kalite incelemesi Phase 5'e kalır.
- İşlem bütçesi tahmini rezervasyondur; sağlayıcı faturasının kesin üst sınırı değildir. Sağlayıcı hesabının kullanım kontrolleri ayrıca yönetilir.
- 24 saatlik başarısız iş temizliği sonraki kimlik doğrulamalı istekte tetiklenir; boşta çalışacak zamanlanmış temizlik yoktur.
- Sağlayıcının kendi veri saklama politikası geçerlidir. Ürün yayınından önce ayrıntılı gizlilik değerlendirmesi gerekir.
- Önceden raporlanan bağımlılık güvenlik uyarıları ve yayın hazırlığı Phase 5 kapsamındadır.
- Phase 3'ün 44 mock backend kontrolü bu turda canlı anahtarlı sunucu üzerinde tekrar çalıştırılmadı.

Phase 5'e geçiş için kullanıcı onayı beklenir.
