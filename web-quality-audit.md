# Web Quality Audit - fx-garanti-ui

## Faz 1 - Quick Wins

- [x] **#1 KRITIK** Devtools production'da kapat
  - `nuxt.config.ts:4` → `devtools: { enabled: process.env.NODE_ENV !== 'production' }`

- [x] **#2 KRITIK** Google Fonts render-blocking @import'u kaldir
  - `app/assets/css/main.css:1` → @import yerine nuxt.config.ts icinde preload link kullan

- [x] **#3 KRITIK** Gorsellere width/height ekle (CLS)
  - `app/pages/index.vue`, `app/pages/kayit.vue` → tum `<img>` etiketlerine explicit boyut

- [x] **#7 YUKSEK** Preconnect hint'leri ekle
  - `nuxt.config.ts` → fonts.googleapis.com, fonts.gstatic.com icin preconnect

- [x] **#8 YUKSEK** robots.txt doldur
  - `public/robots.txt` → admin sayfalari disallow, sitemap referansi

- [x] **#12 ORTA** prefers-reduced-motion destegi ekle
  - `app/assets/css/main.css` → animasyonlari hareket hassasiyeti icin devre disi birak

## Faz 2 - Guvenlik

- [x] **#4 KRITIK** Guvenlik header'lari middleware'i olustur
  - `server/middleware/security-headers.ts` → CSP, X-Frame-Options, HSTS, X-Content-Type-Options

- [x] **#6 YUKSEK** Admin token expiration kontrolu ekle
  - `app/stores/admin.ts:50-64` → hydrateFromStorage icinde expiration dogrula

- [x] **#17 ORTA** Proxy route'larda path validasyonu
  - `server/routes/api/v1/public/[...path].ts`, `admin/[...path].ts`, `internal/[...path].ts`

- [ ] **#18 ORTA** Admin server-side middleware
  - Kaldirildi - backend kendi auth kontrolunu yapiyor, frontend-side guard yeterli

## Faz 3 - SEO

- [x] **#10 YUKSEK** Sayfa bazli meta tags (OG, Twitter, canonical)
  - Tum sayfa dosyalari → `useHead()` ve `useSeoMeta()` ile

- [x] **#9 YUKSEK** Sitemap ekle
  - `@nuxtjs/sitemap` modulu veya statik `public/sitemap.xml`

- [x] **#14 ORTA** Heading hiyerarsisini duzelt
  - `app/pages/kayit.vue` (h1 eksik), `app/pages/kontrol/index.vue`

- [x] **#16 ORTA** Structured data (JSON-LD)
  - En azindan anasayfada Organization schema'si

## Faz 4 - Accessibility

- [x] **#11 YUKSEK** ARIA attribute'lari ekle
  - Modal: `role="dialog"`, `aria-modal="true"`
  - Hatalar: `role="alert"` veya `aria-live="polite"`
  - Progress: `aria-current="step"`
  - Spinner: `role="status"`, `aria-label`

- [x] **#13 ORTA** Skip-to-content link
  - `app/layouts/default.vue`, `app/layouts/admin.vue`

- [x] **#19 ORTA** Renk kontrast kontrolu
  - `text-gray-500`, badge renkleri WCAG AA dogrulamasi

## Sonraya Birakildi

- [ ] **#5 YUKSEK** Admin token localStorage → httpOnly cookie (backend degisikligi gerekir)
- [ ] **#15 ORTA** dayjs → Native Intl API gecisi
- [ ] **#20 DUSUK** Inline SVG optimizasyonu (icon sprite/component)
- [ ] **#21 DUSUK** Favicon ICO → SVG/PNG
- [ ] **#22 DUSUK** .env.example dosyasi olustur
- [ ] **#23 DUSUK** Server-side dosya upload validasyonu
- [ ] **#24 DUSUK** Nitro cache konfigurasyonu
- [ ] **#25 DUSUK** Code splitting / lazy loading

## Kategori Ozeti

| Kategori | Kritik | Yuksek | Orta | Dusuk | Toplam |
|----------|--------|--------|------|-------|--------|
| Performance | 2 | 1 | 1 | 3 | 7 |
| SEO | - | 3 | 2 | - | 5 |
| Accessibility | - | 1 | 4 | - | 5 |
| Security | 2 | 3 | 2 | 2 | 9 |
| **Toplam** | **4** | **8** | **9** | **5** | **26** |