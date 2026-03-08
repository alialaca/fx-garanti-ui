<div align="center">

<img src="public/logo.png" alt="FxGaranti Logo" width="80" />

# FxGaranti

**Cihaz Garanti Yonetim Sistemi**

Seri numarasi ile garanti sorgulama, OTP dogrulamali kayit ve admin yonetim paneli sunan modern SSR web uygulamasi.

[![Nuxt](https://img.shields.io/badge/Nuxt_4-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=vue.js&logoColor=black)](https://pinia.vuejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[**servis.fixpro.com.tr**](https://servis.fixpro.com.tr)

</div>

---

## Ekran Goruntuleri

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/homepage.png" alt="Anasayfa" width="100%" />
      <br />
      <b>Anasayfa</b> — Garanti sorgulama ve kapsam bilgileri
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/registration.png" alt="Garanti Kayit" width="100%" />
      <br />
      <b>Garanti Kayit</b> — Cok adimli form ile garanti olusturma
    </td>
  </tr>
</table>

## Ozellikler

| | Ozellik | Aciklama |
|---|---------|----------|
| :mag: | **Garanti Sorgulama** | Seri numarasi ile aninda garanti durumu kontrolu |
| :shield: | **Guvenli Kayit** | OTP dogrulamali cok adimli garanti kayit formu |
| :lock: | **Admin Paneli** | Basvurulari yonetme, filtreleme ve coklu kriterde arama |
| :crescent_moon: | **Dark / Light Tema** | Sistem tercihine uyumlu otomatik tema destegi |
| :rocket: | **SSR** | Server-side rendering ile hizli yukleme ve SEO uyumluluk |
| :bar_chart: | **Analytics** | Self-hosted Umami entegrasyonu ile kullanici davranis takibi |
| :iphone: | **Responsive** | Mobil ve masaustu uyumlu tasarim |
| :framed_picture: | **Fatura Yukleme** | Gorsel ve PDF destekli fatura yukleme (maks. 5MB) |

## Mimari

```mermaid
flowchart LR
    subgraph Client
        A[Kullanici] -->|Seri No Girer| B[Nuxt SSR Frontend]
    end

    subgraph Server
        B -->|/api/v1/public/*| C[Nuxt Server Proxy]
        B -->|/api/v1/internal/*| C
        C -->|HTTP| D[Backend Garanti Servisi]
    end

    subgraph OTP Akisi
        B -->|1. Auth-info iste| C
        C -->|Maskelenmis bilgi| B
        B -->|2. OTP gonder| C
        C -->|SMS / E-posta| D
        B -->|3. OTP dogrula| C
        C -->|JWT Token| B
        B -->|4. Garanti getir| C
    end
```

## Tech Stack

<table>
  <tr>
    <td align="center"><b>Kategori</b></td>
    <td><b>Teknolojiler</b></td>
  </tr>
  <tr>
    <td align="center">Framework</td>
    <td>
      <img src="https://img.shields.io/badge/Nuxt_4-00DC82?style=flat-square&logo=nuxt.js&logoColor=white" alt="Nuxt" />
      <img src="https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue" />
      <img src="https://img.shields.io/badge/Node.js_22+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    </td>
  </tr>
  <tr>
    <td align="center">UI</td>
    <td>
      <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
      <img src="https://img.shields.io/badge/Instrument_Serif-333?style=flat-square&logo=googlefonts&logoColor=white" alt="Font" />
      <img src="https://img.shields.io/badge/DM_Sans-333?style=flat-square&logo=googlefonts&logoColor=white" alt="Font" />
    </td>
  </tr>
  <tr>
    <td align="center">State & HTTP</td>
    <td>
      <img src="https://img.shields.io/badge/Pinia-FFD859?style=flat-square&logo=vue.js&logoColor=black" alt="Pinia" />
      <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
    </td>
  </tr>
  <tr>
    <td align="center">Deploy</td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
      <img src="https://img.shields.io/badge/CapRover-0078D4?style=flat-square&logo=docker&logoColor=white" alt="CapRover" />
    </td>
  </tr>
  <tr>
    <td align="center">Analytics</td>
    <td>
      <img src="https://img.shields.io/badge/Umami-000?style=flat-square&logo=umami&logoColor=white" alt="Umami" />
    </td>
  </tr>
  <tr>
    <td align="center">Paket Yoneticisi</td>
    <td>
      <img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    </td>
  </tr>
</table>

## Hizli Baslatma

**1.** Repo'yu klonlayin

```bash
git clone https://github.com/user/fx-garanti-ui.git
cd fx-garanti-ui
```

**2.** Bagimliliklari yukleyin

```bash
pnpm install
```

**3.** Ortam degiskenlerini yapilandirin

Proje kokune `.env` dosyasi olusturun:

| Degisken | Zorunlu | Aciklama |
|----------|---------|----------|
| `WARRANTY_SERVICE_URL` | Evet | Backend API adresi (orn. `http://localhost:3001`) |
| `NUXT_PUBLIC_UMAMI_SCRIPT_URL` | Hayir | Umami analytics script URL |
| `NUXT_PUBLIC_UMAMI_WEBSITE_ID` | Hayir | Umami website ID |

**4.** Gelistirme sunucusunu baslatin

```bash
pnpm dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde calisir.

**5.** Production build

```bash
pnpm build
pnpm preview
```

<details>
<summary><b>Proje Yapisi</b></summary>

```
app/
├── components/              # Vue komponentleri
│   ├── AppHeader.vue            # Site header ve navigasyon
│   ├── ThemeToggle.vue          # Tema secici (Dark/Light/System)
│   └── OtpVerification.vue     # OTP dogrulama
├── composables/             # Vue composable'lar
│   ├── useApi.ts                # Public API istemcisi
│   ├── useAdminApi.ts           # Admin API istemcisi
│   ├── useTheme.ts              # Tema yonetimi
│   └── useTracking.ts          # Analytics event tracking
├── stores/                  # Pinia store'lar
│   ├── auth.ts                  # Kullanici oturum yonetimi
│   ├── admin.ts                 # Admin auth state
│   └── warranty.ts              # Garanti state
├── layouts/                 # Sayfa layout'lari
│   ├── default.vue              # Varsayilan layout
│   └── admin.vue                # Admin panel layout
├── pages/                   # Sayfalar (file-based routing)
│   ├── index.vue                # Anasayfa — sorgulama
│   ├── kayit.vue                # Garanti kayit formu
│   ├── garanti/
│   │   └── [serialNumber].vue   # Garanti detay
│   └── kontrol/
│       ├── giris.vue            # Admin giris
│       └── index.vue            # Admin panel
├── plugins/
│   └── umami.client.ts         # Umami script injection
└── types/index.ts           # TypeScript tanimlari

server/
├── routes/api/              # API proxy route'lari
└── middleware/               # Server middleware'leri
```

</details>

<details>
<summary><b>API Referansi</b></summary>

Uygulama, backend garanti servisine Nuxt server route'lari uzerinden proxy yapar:

### Public Endpoints

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| `GET` | `/api/v1/public/warranties/:sn/auth-info` | Maskelenmis iletisim bilgileri |
| `POST` | `/api/v1/public/otp` | OTP kodu gonder |
| `POST` | `/api/v1/public/sessions` | OTP dogrula, JWT token al |
| `GET` | `/api/v1/public/warranties/:sn` | Garanti detay sorgula (token gerekli) |
| `POST` | `/api/v1/public/warranties` | Garanti kaydi olustur (multipart/form-data) |

### Internal (Admin) Endpoints

Admin endpoint'leri `/api/v1/internal/*` uzerinden backend'e yonlendirilir. JWT Bearer token ile yetkilendirme gerektirir.

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| `POST` | `/api/v1/internal/auth/login` | Admin giris |
| `GET` | `/api/v1/internal/warranties` | Tum garantileri listele / filtrele / ara |
| `PATCH` | `/api/v1/internal/warranties/:id` | Garanti durumunu guncelle |

</details>

## Deploy

Multi-stage Docker build ile [CapRover](https://caprover.com/)'a deploy edilir.

```bash
# Tek komut ile deploy
pnpm deploy
```

> `git archive` ile commit'li dosyalar paketlenir ve CapRover'a gonderilir. Build production sunucuda gerceklesir.

### Docker ile Manuel Calistirma

```bash
docker build -t fx-garanti-ui .
docker run -p 3000:3000 \
  -e WARRANTY_SERVICE_URL=http://backend:3001 \
  fx-garanti-ui
```

## Lisans

Bu proje ozel kullanim icin gelistirilmistir. Tum haklari saklidir.
