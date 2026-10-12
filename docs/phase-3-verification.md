# Phase 3 doğrulaması

Yerel Supabase üzerinde 11 Ekim 2026 tarihinde tamamlandı. Uzak proje veya AI sağlayıcısı kullanılmadı.

| Kontrol | Sonuç |
| --- | --- |
| Servis testleri | 11 / 11 geçti |
| Gerçek Postgres RLS testleri | 37 / 37 geçti |
| Auth, Edge, PostgREST ve Storage uçtan uca kontrolleri | 44 / 44 geçti |
| Strict TypeScript | Geçti |
| Deno Edge Function tür kontrolü | Geçti |
| Prettier | Geçti |
| Supabase şema lint | Hata / uyarı yok |
| Expo SDK bağımlılık uyumu | Geçti |
| iOS / Android Hermes ve web paketlemesi | Geçti |
| Tarayıcıdan giriş, kayıt, yenileme, paylaşım önizleme ve çıkış | Geçti; konsol hatası yok |

Backend kontrolleri; iki kullanıcı arasında profil/rüya/görsel yalıtımı, public görsel erişiminin reddi, normalize Türkçe temalar, türetilmiş alanların korunması, atomik metin/tema güncellemesi, aynı kayıt kimliğiyle tekrar deneme, özel ses yükleme, doğrudan medya yazma/silme engeli, eşzamanlı işlem kilidi, 19 ve 20 farklı katılımcı sınırı, küçük grupların bastırılması, anonim eşleşme ve izin geri çekmeyi kapsar.

Silme kontrolleri; tek rüyanın dosyaları, tüm arşiv, hesap, Auth ilişkileri ve eski JWT'nin reddini kapsar. Test hesabına özel bir Storage hata tetikleyicisiyle dosya temizliği kasıtlı olarak başarısız kılındı. API başarı bildirmedi, Auth kimliği tekrar deneme için korundu, veriler kullanıma kapandı; hata kaldırılınca silme tamamlandı. Geçici hesaplar, dosyalar ve hata tetikleyicisi temizlendi. Sohbette verilen yerel önizleme hesabı korundu.

Tarayıcı kontrolü ayrı bir geçici hesap ve sekmede yapıldı. Metinle kaydedilen rüya sayfa yenilemesinden sonra yeniden yüklendi. Private PNG görsel paylaşım kartına geldi ve web PNG oluşturma işlemi başarı durumu verdi. Tarayıcının dosyayı diske kaydetmesi ayrıca doğrulanmadı. Kullanıcının açık sekmesi ve rüyaları değiştirilmedi.

Deno bu ortamda npm üzerinden çalıştırıldı; `npm run functions:check` için Deno CLI gerekir. Çalıştırılan kontrol:

```sh
deno check --no-config --node-modules-dir=none --no-lock supabase/functions/dreams-api/index.ts
```

## Sınırlar

- Ses kaydı / mikrofon izinleri, SecureStore ve native paylaşım fiziksel cihazda henüz denenmedi.
- Native JavaScript paketlemesi APK, IPA veya mağaza derlemesi değildir.
- Auth e-posta doğrulaması yerel geliştirmede kapalıdır; üretim SMTP ve e-posta doğrulaması yapılandırılmadı.
- Medya URL'leri beş dakika geçerlidir. Uzun süre açık kalan ekranda yeni indirme için arşiv yenilemesi gerekebilir.
- Yorumlar ve görseller mock'tur; Whisper, GPT ve görsel API bağlantıları yoktur.
- Astrolojik transit kaynağı yoktur; sembolik örnek olduğu açıklanır.
- Bağımlılık ağında 31 npm audit bulgusu sürüyor. Yayın öncesi Phase 5 değerlendirmesi gerekir.
- Per-user AI limitleri, maliyet koruması ve sağlayıcı tekrar denemeleri Phase 4 kapsamındadır.
- Kapsamlı gizlilik / çıkarım riski değerlendirmesi ve içerik içermeyen analitik Phase 5 kapsamındadır.
