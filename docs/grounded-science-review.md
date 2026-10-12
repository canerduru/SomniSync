# Bağımsız uygulama incelemesi — 12 Ekim 2026

İnceleme, uygulamayı yazan agenttan ayrı bir reviewer tarafından tasarım ve planla karşılaştırılarak yapıldı. Ürün kodu değiştirilmedi. Bu belge bir kod incelemesidir; canlı LLM doğruluk ölçümü değildir.

## Düzeltilen bulgular

- **Eski metnin yeniden analizle geri yazılması:** İstemci analiz isteğine `expectedRevision` ekliyor. Canlı ve mock API güncel revizyonu ve metni karşılaştırıyor. Canlı job girdisi revizyonu taşıyor; `save_ai_dream` satırı kilitleyip revizyonu tekrar kontrol ediyor.
- **Kaynağın devreden çıkarılması:** Eski SciencePanel artık ortak kataloğun aktif konularını filtreliyor. Etkin olmayan konunun açıklaması ve künyesi gösterilmiyor.
- **Demoda başkasının sözünün anlatıcıya yazılması:** Kurallı çıkarım, alıntı ve bildirilen konuşma işaretlerini muhafazakâr biçimde dışlıyor. Bu yaklaşım bazı gerçek gözlemleri de atlayabilir; genel dil anlama garantisi değildir.
- **Eski etiketlerin radar sayımına katılması:** Radar güncel, birebir alıntısı doğrulanmış rapordan etiket türetiyor. Eski raporlar ve onaylanmamış olası kopyalar dışlanıyor; canlı ve demo kaynak seçimi ayrılıyor.
- **Kopyaların kalıcı olarak dışlanması:** Kullanıcıya kaydı ayrı bir olay olarak onaylama işlemi verildi. İşlem sahibi ve revizyon denetimli RPC kullanıyor; metin/tarih değişimi onayı sıfırlıyor.
- **Eksik günlük paydaları:** Stres cevabı bulunan kayıt sayısı ile hem cevap hem güncel analiz bulunan eşleşmiş kayıt sayısı ayrıldı.
- **Kaydedilen provider çıktısı:** Son kayıtta rapor tekrar doğrulanıyor; etiket ve genel eğitim metni sunucu tarafından yeniden türetiliyor.

## Son kontrolde iletilen küçük kenar durum

Canlı sesli `create` isteğinin tamamlandıktan sonra aynı id ile yinelenmesinde, ilk kayıttaki transkript revizyonunun artması `expectedRevision` üzerinden istek özetini değiştirebilir. Create için özetin revizyondan bağımsız/sabit tutulması, update için revizyonun özete dahil kalması önerildi. Normal istemcinin resume akışı bu durumu çoğunlukla önler; yine de idempotency sözleşmesi açısından ele alınmalıdır.

### Uygulama agentının kapanış notu

Yukarıdaki create tekrar deneme bulgusu düzeltildi: create iş girdisi `expectedRevision=1` kullanıyor; update güncel revizyonu taşımaya devam ediyor. Edge TypeScript kontrolü ve 55 backend assertion düzeltmeden sonra tekrar geçti. Bu kapanış notu uygulama agentına aittir; reviewer tarafından ayrıca doğrulanmış değildir.

## Doğrulama ve sınırlar

Reviewer tam test paketlerini veya ücretli provider çağrılarını çalıştırmadı. Tekil `tsx` çalıştırma girişimi sandbox IPC `EPERM` nedeniyle sonuç vermedi. Uygulama agentı frontend/Edge TypeScript, 58 Node testi, 75 SQL kontrolü ve 55 backend assertion geçtiğini bildirdi; bu sayılar reviewer tarafından bağımsız çalıştırılmış sonuçlar değildir.

İncelenen SQL yetkileri ve API akışlarında yeni bir çapraz kullanıcı erişimi veya authenticated-role mutasyon yetkisi atlaması görülmedi. Bu gözlem, kapsamlı penetrasyon testi olarak yorumlanmamalıdır.

Birebir alıntı eşleşmesi, alıntının model tarafından doğru yorumlandığını kanıtlamaz. Canlı anlamsal doğruluk için bağımsız insan etiketli Türkçe değerlendirme ve gerçek provider ölçümü hâlâ gereklidir. Mevcut deterministik testler bu doğruluk yüzdesini vermez.
