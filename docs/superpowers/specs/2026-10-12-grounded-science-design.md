# SomniSync: dayanaklı analiz ve kişisel günlük

Kullanıcı tasarım, planlama ve uygulama kararlarını 12 Ekim 2026'da devretti. Bu belge ondan ek onay istemeden ilerlemek için alınan uygulama kararlarını kaydeder.

## Amaç ve sınır

Denetlenebilir içerik çıkarımı, düzeltilebilir transkript, isteğe bağlı günlük ve kaynak kapsamı açık eğitim. Klinik tanı, gizli anlamın doğrulandığı iddiası, metinden EEG/nörotransmitter tahmini yok. Sembolik yorumlar ayrı kalır. Yeni araştırma/eğitim veri toplama hattı açılmaz; günlük yalnızca hizmet içi kişisel kullanımdır.

## Akış

Rüya → gözlem adayları → sunucuda biçim ve birebir alıntı denetimi → açık/literal/olumlu gözlemlerden etiket → kullanıcı incelemesi → kişisel sayım. LLM semantik doğruluğu alıntı eşleşmesiyle garanti edilmez; bu sınır ekranda açık kalır. Kısa anlatıda sıfır etiket geçerlidir. Olumsuz, mecaz, belirsiz veya uyanık bağlamlı adaylar etikete dönüşmez. Kovalanma için anlatıcı hedef olmalıdır. Duygu sadece açık beyan ise kabul edilir.

Gözlem: sabit kategori, alıntı, UTF-16 start/end, polarity, literal, context, experiencer, kullanıcı reddi. Rapor: schemaVersion=1, revision, extractor, model, promptVersion, catalogVersion. Sunucu alıntıyı birebir bulur; belirsiz birden fazla aynı alıntıyı kabul etmez. Onaylanmış kaynak id'leri koddan seçilir, model URL/DOI üretmez.

## Düzeltme ve sürüm

Transkript kaydı expectedRevision ile korunur. Değişiklik revision artırır, etiket/yorum/rapor/görsel referansını temizler, sosyal izinleri kapatır; yeniden analiz ayrı düğmedir. Yeni rapor aynı revision ile kaydedilir. Eski raporlar bilimsel katmanda kullanılmaz. Kullanıcı reddi revision'a bağlıdır ve etiketler yeniden türetilir. Ham geçmiş transkript arşivi oluşturulmaz; yalnızca güncel metin ve revizyon sayacı tutulur.

## Günlük ve istatistik

Her rüyaya bağlı tek güncel JSON: sleepHours 0–24/null, sleepQuality 1–5/null, stressBeforeSleep 0–4/null, dreamEmotion sabit enum/null, wakingMood sabit enum/null, recurring boolean/null, capturedAt ISO UTC, sleepDate YYYY-MM-DD, timezone. Stres sorusu açıkça ilgili uyku öncesine ilişkindir; capturedAt doldurma zamanını korur. Zaman çelişkisi veya rüya tarihinden farklı sleepDate varsa eşleşmiş sayımdan dışlanır. Cevap vermemek sıfır değildir. Günlük sürümleri otomatik eğitim verisi olmaz.

İlk sürüm yalnızca betimleyici sayım: kaydedilmiş uygun rüyalar, dayanaklı analizi bulunanlar, günlük cevabı olanlar, eksik/çelişkili kayıt sayıları; stres cevabı bulunan kayıtlarda tema sayısı. Nedensellik/korelasyon anlamlılığı/kişisel risk puanı üretmez. Aynı id tek sayılır. Aynı tarih+aynı metin olası kopya işaretlenir, kullanıcı karar verene kadar karşılaştırmadan dışlanır; farklı tarihlerde aynı metin gerçek tekrar olabilir ve korunur. Demo ile canlı veri tek sayımda karıştırılmaz.

## Bilimsel kaynak katmanı

Mevcut üç doğrulanmış künyeye bağlı, bize ait kısa TR/EN açıklama ve sınırlılık kataloğu. Tema → izinli eğitim kartı seçimi; kişisel nörobiyolojik açıklama üretimi yok. Bu sınırlı katalog erişimi tam literatür taraması veya bağımsız bilimsel validasyon olarak sunulmaz. Kaynaklar active/inactive durumuyla devreden çıkarılabilir; catalogVersion görünür. Model tarafından yazılmış eski neuroscience metni bilimsel açıklama olarak gösterilmez. Dış veri seti veya telifli makale metni kopyalanmaz.

## Platform ve geçiş

Expo/React Native + TypeScript, Supabase RLS ve mevcut Edge job akışı korunur. Yeni bağımlılık yok. TR/EN ekranlar. Eski kayıtlar açıkça dayanaklı analiz yok durumundadır; yeni etiket gibi kabul edilmez. Demo kurallı çıkarım olarak açıkça etiketlenir, canlı LLM başarısı gibi sunulmaz. Migration dosyası hazırlanır; uzak projeye yayın ayrıca yapılmış gibi iddia edilmez.

## Kabul koşulları

16 adversarial vakanın çalıştırılabilir sözleşme testleri; ilaveten eski rapor, düzeltme çatışması, reddedilen gözlem ve kaynak allowlist testleri. Testler sahte provider çıktılarının denetimini ve deterministik demo davranışını ölçer, LLM doğruluk yüzdesi değildir. TypeScript, mevcut testler, web/native export; mümkünse yerel DB SQL/RLS testleri. Üretim LLM/insan benchmark sonucu yoksa açıkça belirtilir.
