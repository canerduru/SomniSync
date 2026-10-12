# Arşiv keşif ve paylaşım ekleri — doğrulama

11 Ekim 2026. Kullanıcının GitHub karşılaştırması sonrası onayladığı radar, kaynaklı açıklama ve paylaşım biçimleri mevcut Expo uygulamasına uyarlandı.

## Sonuçlar

| Kontrol | Sonuç |
|---|---|
| Servis + yeni özellik testleri (`npm test`) | 17/17 geçti |
| TypeScript (`npm run typecheck`) | Çıkış kodu 0 |
| Biçim (`npm run format:check`) | Geçti |
| Expo web/iOS/Android export | Üçü de tamamlandı; native Hermes paketleri üretildi |
| Tarayıcı: Su radar filtresi | Üç örnekten yalnız su rüyası kaldı |
| Radar + metin arama kesişimi | Su filtresi + “aynadaki” araması sıfır sonuç; Temizle sonrası üç kayıt |
| Sembolik harita | Altı farklı grup, doğru etiket sayıları ve açıklama |
| Bilimsel panel | Aç/kapat ve Plastisite sekmesi; doğru PMID/DOI ve hipotez etiketi |
| Post PNG | Tarayıcıdan indirildi; `sips`: 1080×1350 |
| Story PNG | Tarayıcıdan indirildi; `sips`: 1080×1920 |
| 320px ve 1024px arşiv | DOM belge genişliği viewport ile aynı; yatay taşma yok |
| İngilizce | Yeni radar düğmeleri/açıklamaları/tema isimleri çevrildi; anahtar eşitliği testi geçti |

Testler boş arşiv, sıfır yüzdeler, hazır olmayan/silinmekte olan rüyalar, yinelenen kayıt ve etiketler, eşit baskın temalar, alt dize kaynaklı yanlış eşleşme, kesin kart boyutları, uzun metin sınırları, XML kaçışları ve özel içeriklerin dışarı çıkmamasını kapsar. Arşiv zaman/arama filtreleri haritadan bağımsız tam arşiv paydasını değiştirmez; liste filtreleri kesişir.

Bilimsel katalog PubMed üzerinden doğrulanan üç kayıt kullanır:

- [Stickgold & Walker, 2013 — PMID 23354387](https://pubmed.ncbi.nlm.nih.gov/23354387/) — derleme/kuramsal sentez.
- [van der Helm et al., 2011 — PMID 22119526](https://pubmed.ncbi.nlm.nih.gov/22119526/) — deneysel insan EEG/fMRI çalışması.
- [Tononi & Cirelli, 2014 — PMID 24411729](https://pubmed.ncbi.nlm.nih.gov/24411729/) — hipotez/perspektif yazısı.

Genel eğitim içeriği ve kişisel çağrışım soruları birbirinden ayrılır. Makaleler tek bir rüya yorumunun doğruluğuna kanıt olarak sunulmaz. Kişisel EEG, nörotransmitter veya sinaptik budama değerleri hesaplanmaz.

## Çalışma alanı ve sınırlar

Kaynaklar yeni çalışma alanına kopyalandı; eski kaynak ve veritabanı değiştirilmedi. `node_modules` yerelde önceki kurulu bağımlılıklara bağlantıdır ve Git dışında tutulur; bağımsız kurulum için `npm ci` gerekir. `.env.local` yalnızca eski public Supabase istemci ayarlarının izin verilen alanlarını içerir; Git dışında tutulur. Edge API secret dosyası kopyalanmadı. Yeni özelliklerde yeni paket veya servis yok.

Tarayıcı testleri bellek içi demo arşivinde yapıldı. Gerçek kullanıcı rüyaları, mikrofon izinleri, canlı AI, ücretli API çağrıları, veritabanı sıfırlaması veya dağıtım kullanılmadı. Mevcut backend/SQL/AI testleri tekrar çalıştırılmadı; backend sözleşmesi ve şema değişmedi.

Native kayıt/paylaşım fiziksel cihazda çalıştırılmadı; iOS/Android paketlenmesi cihaz testi değildir. Native kart ve web serializer ortak geometri kullanır; farklı sistemlerde font çizimi küçük farklılıklar gösterebilir. Bilimsel kaynaklar sabit, gözden geçirilmiş katalogdur; güncel otomatik literatür taraması değildir. Radar etiketlerden oluşur, rüya anlatısının tamamını veya klinik bir ölçümü temsil etmez.

`docs/previews/` altında demo PNG çıktıları ve mobil/geniş ekran görüntüleri bulunur. Önizleme `http://127.0.0.1:8098/` adresinde çalışır; kök sayfadan arşive ilerlenir. Statik sunucu alt adreslerde sayfa yenileme için SPA fallback sağlamaz.

Oyunlaştırma, fiziksel cihaz doğrulaması, gizlilik/bağımlılık incelemesi ve mağaza yayını bu çalışmada yapılmadı.
