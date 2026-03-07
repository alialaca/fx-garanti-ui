# Cihaz Garanti Yönetim Sistemi - Frontend

Cihaz garanti kayıt ve sorgulama işlemlerini yönetmek için Nuxt 4 tabanlı SSR frontend uygulaması.

## Teknoloji Stack

- **Framework:** Nuxt 4 (SSR)
- **Styling:** TailwindCSS
- **HTTP Client:** Axios
- **State Management:** Pinia
- **Package Manager:** pnpm

## Kurulum

```bash
pnpm install
pnpm dev
```

## Proje Yapısı

```
app/
├── assets/css/main.css     # Global stiller, Tailwind config
├── components/
│   ├── AppHeader.vue       # Site header, navigasyon
│   ├── ThemeToggle.vue     # Dark/Light/System tema seçici
│   └── OtpVerification.vue # OTP doğrulama komponenti
├── composables/
│   ├── useApi.ts           # Axios wrapper, API metodları
│   ├── useAdminApi.ts      # Admin API metodları
│   ├── useTheme.ts         # Tema yönetimi
│   └── useTracking.ts      # Umami analytics event tracking
├── plugins/
│   └── umami.client.ts     # Umami script injection (client-only)
├── stores/
│   ├── auth.ts             # Auth state, session yönetimi
│   ├── admin.ts            # Admin auth state
│   └── warranty.ts         # Garanti state
├── layouts/
│   ├── default.vue         # Default layout
│   └── admin.vue           # Admin panel layout
├── pages/
│   ├── index.vue           # Anasayfa - sorgulama + kapsam bilgileri
│   ├── kayit.vue           # Garanti kayıt formu
│   ├── garanti/
│   │   └── [serialNumber].vue  # Garanti detay sayfası
│   └── kontrol/
│       ├── giris.vue       # Admin giriş sayfası
│       └── index.vue       # Admin garanti yönetim paneli
└── types/index.ts          # TypeScript type definitions
```

## Backend API

- **Base URL:** `http://localhost:3000/api/v1/public`
- **Docs:** `/docs/frontend-plan.md`

### Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/otp` | OTP kodu gönder |
| POST | `/sessions` | OTP doğrula, token al |
| POST | `/warranties` | Garanti kaydı oluştur |
| GET | `/warranties/:serialNumber` | Garanti sorgula |
| GET | `/warranties/:serialNumber/auth-info` | Maskelenmiş iletişim bilgileri |

> **Not:** Garanti sorgulama için güvenli OTP akışı kullanılır. Detaylar için `docs/secure-warranty-query-api.md` dosyasına bakın.

## Tema

Dark/Light/System tema desteği mevcut. Default: System preference.

## Renk Paleti

- **Primary:** #193F78
- **Accent:** #2563EB
- **Fonts:** Instrument Serif (display), DM Sans (body)

## Deploy

Multi-stage Docker build ile CapRover'a deploy edilir. Build production sunucuda yapılır.

```bash
pnpm deploy   # git archive → caprover deploy
```

**Akış:** `git archive HEAD` → commit'li dosyaları tar'lar → CapRover tar'ı alır → Dockerfile ile multi-stage build → production image

**Dosyalar:** `Dockerfile` (multi-stage), `captain-definition`, `.dockerignore`

## Analytics (Umami)

Self-hosted Umami entegrasyonu. Tüm sayfalarda (public + admin) aktif.

**Env değişkenleri** (`NUXT_PUBLIC_` prefix zorunlu):
```
NUXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.example.com/script.js
NUXT_PUBLIC_UMAMI_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Mimari:** `umami.client.ts` plugin scripti inject eder → `useTracking.ts` composable type-safe `trackEvent()` sağlar.

**İzlenen olaylar:**

| Olay | Sayfa | Veri |
|------|-------|------|
| `search` | Anasayfa | `{ type: 'serial' }` |
| `exclusions-view` | Anasayfa | IntersectionObserver, 1 kez |
| `footer-link-click` | Anasayfa | `{ url, label }` |
| `registration-start` | Kayıt | onMounted |
| `registration-otp-request` | Kayıt | form submit |
| `registration-complete` | Kayıt | `{ device_model }` |
| `warranty-view` | Garanti detay | `{ status }` |
| `theme-change` | ThemeToggle | `{ theme: 'dark'\|'light'\|'system' }` |
| `admin-login-success` | Admin giriş | - |
| `admin-login-fail` | Admin giriş | `{ reason: 'invalid_credentials'\|'server_error' }` |
| `admin-search` | Admin panel | `{ type: 'serial'\|'phone'\|'identity' }` |
| `admin-filter` | Admin panel | `{ status }` |
