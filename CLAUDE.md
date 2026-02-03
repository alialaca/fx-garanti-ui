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
│   └── useTheme.ts         # Tema yönetimi
├── stores/
│   ├── auth.ts             # Auth state, session yönetimi
│   └── warranty.ts         # Garanti state
├── pages/
│   ├── index.vue           # Anasayfa - sorgulama + kapsam bilgileri
│   ├── kayit.vue           # Garanti kayıt formu
│   └── garanti/
│       └── [serialNumber].vue  # Garanti detay sayfası
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

## Tema

Dark/Light/System tema desteği mevcut. Default: System preference.

## Renk Paleti

- **Primary:** #193F78
- **Accent:** #2563EB
- **Fonts:** Instrument Serif (display), DM Sans (body)
