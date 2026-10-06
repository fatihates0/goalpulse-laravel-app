# GoalPulse - Canlı Skor ve İddaa Oran Platformu

> **Proje Durumu:** Bu proje henüz geliştirme aşamasında olup aktif olarak üzerinde çalışılmaktadır. Tüm modüller ve özellikler tamamlanmamıştır.

GoalPulse; futbol maçlarının skorlarını, maç detaylarını, canlı anlatımları ve iddaa oranlarını takip etmek için yazılmış bir web uygulaması ve REST API servisidir. Görme engelli kullanıcıların ekran okuyucular ve sesli bildirimlerle rahatlıkla kullanabilmesi odağıyla, Laravel 11, Inertia.js ve React ile hazırlanmıştır.

---

## Görme engelliler için erişilebilirlik

Uygulama, görme engelli bireylerin canlı maç takibini zahmetsizce yapabilmesi için tasarlanmıştır:

- **Ekran okuyucu uyumluluğu:** Tüm liste ögeleri, butonlar ve maç bilgileri ekran okuyucu yazılımların (NVDA, JAWS, VoiceOver) doğru okuyabileceği anlamsal HTML yapısı ve etiketlerle sunulur.
- **Sesli gol bildirimi:** Favoriye alınan maçlarda skor değiştiğinde Web Audio API altyapısı üzerinden sesli uyarı verilir.
- **Yüksek kontrastlı tema:** Metinler ve durum göstergeleri (canlı, bitmiş, ertelenmiş) okunabilirliği artıran renk kontrast oranlarıyla tasarlanmıştır.
- **Klavye gezintisi:** Tüm menülere ve arama alanına (⌘K kısayolu dahil) klavye üzerinden erişilebilir.

---

## Özellikler

- Maç dakikası, skorlar, kırmızı kartlar ve maç durumları veri çekildikçe güncellenir.
- Maç sonucu (MS1, MSX, MS2), Alt/Üst ve Karşılıklı Gol (KG) oranlarını gösterir.
- Türkiye Süper Lig ve ana Avrupa liglerini hiyerarşik olarak üst sırada listeler.
- Tarih seçici ile istenen güne ait maç programına ve geçmiş sonuçlara erişilir.
- Favoriye eklenen maçlarda gol olduğunda sesli uyarı verir.
- İstemciler ve mobil uygulamalar için `/api/v1` uç noktaları ve tarayıcı üzerinden çalışan test arayüzü sunar.
- Koyu ve açık tema seçenekleri bulunur.

---

## Kullanılan teknolojiler

| Katman | Teknoloji / Kütüphane |
| :--- | :--- |
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend adaptörü | Inertia.js |
| Arayüz | React 18 & Tailwind CSS |
| İkonlar | Lucide React |
| Veritabanı | MySQL / PostgreSQL / SQLite |
| Derleyici | Vite |

---

## Kurulum

### Gereksinimler

- PHP >= 8.2
- Composer
- Node.js >= 18.x ve NPM

### Adımlar

1. Bağımlılıkları yükleyin:
   ```bash
   composer install
   npm install
   ```

2. Ortam yapılandırma dosyasını oluşturun:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Veritabanı tablolarını oluşturun:
   ```bash
   php artisan migrate
   ```

4. Geliştirme sunucularını çalıştırın:
   ```bash
   # Vite asset derleyici
   npm run dev

   # Laravel arka plan sunucusu
   php artisan serve
   ```

---

## API uç noktaları

API yanıtları JSON biçiminde döner.

- `GET /api/v1/matches/live` - Güncel canlı maçları ve oranları verir.
- `GET /api/v1/matches/date/{date?}` - Belirtilen tarihe (`YYYY-MM-DD`) ait maçları getirir.
- `GET /api/v1/matches/{id}/details` - Maç detaylarını ve canlı anlatım verilerini döner.
- `GET /api/v1/leagues` - Kayıtlı tüm ligleri ve maç sayılarını verir.
- `POST /api/v1/subscribe` - Bildirim aboneliği ekler.
- `POST /api/v1/sync` - Veri senkronizasyonunu elle tetikler.

---

## Zamanlanmış görevler

Canlı skorların güncellenmesi için hazırlanan Artisan komutu:

```bash
php artisan misli:sync-live
```

Periyodik senkronizasyon için sunucuda Laravel zamanlayıcısı çalıştırılabilir:

```bash
php artisan schedule:run
```

---

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
