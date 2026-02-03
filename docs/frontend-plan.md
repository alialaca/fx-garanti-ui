# Frontend Entegrasyon Rehberi (Nuxt.js)

fx-garanti API'si ile entegrasyon için gerekli bilgiler.

## Base URL

```
http://localhost:3000/api/v1/public
```

## Authentication Flow

```
1. POST /otp          → OTP kodu gönderilir (SMS/Email)
2. POST /sessions     → OTP doğrulanır, JWT token alınır
3. Diğer istekler     → Authorization: Bearer <token>
```

## API Endpoints

### 1. OTP İste

```http
POST /otp
Content-Type: application/json

{
  "identifier": "5551234567",
  "identifierType": "phone",      // "phone" | "email"
  "purpose": "warranty_register"  // "warranty_register" | "warranty_query"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully",
  "expiresInMinutes": 5
}
```

### 2. OTP Doğrula (Session Al)

```http
POST /sessions
Content-Type: application/json

{
  "identifier": "5551234567",
  "identifierType": "phone",
  "otpCode": "123456",
  "purpose": "warranty_register"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### 3. Garanti Kaydı Oluştur

```http
POST /warranties
Authorization: Bearer <token>
Content-Type: application/json

{
  "serialNumber": "SN123456789",
  "deviceModel": "iPhone 15 Pro",
  "firstName": "Ali",
  "lastName": "Yılmaz",
  "identityNumber": "12345678901",  // opsiyonel, 11 hane
  "email": "ali@example.com",
  "phone": "5551234567",
  "invoiceImageUrl": "https://...",  // opsiyonel
  "invoiceDate": "2024-01-15",       // opsiyonel
  "invoiceNumber": "INV-001",        // opsiyonel
  "warrantyStartDate": "2024-01-15",
  "warrantyDurationMonths": 24       // opsiyonel, default: 24
}
```

**Response (201):**
```json
{
  "id": "1",
  "serialNumber": "SN123456789",
  "status": "active",
  "warrantyStartDate": "2024-01-15",
  "warrantyEndDate": "2026-01-15",
  ...
}
```

### 4. Garanti Sorgula

```http
GET /warranties/:serialNumber
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "1",
  "serialNumber": "SN123456789",
  "deviceModel": "iPhone 15 Pro",
  "firstName": "Ali",
  "lastName": "Yılmaz",
  "status": "active",
  "warrantyStartDate": "2024-01-15",
  "warrantyEndDate": "2026-01-15",
  "warrantyDurationMonths": 24
}
```

## HTTP Status Codes

| Code | Anlam |
|------|-------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek (validation hatası) |
| 401 | Yetkisiz (token yok/geçersiz/süresi dolmuş) |
| 404 | Bulunamadı |
| 409 | Çakışma (seri no zaten kayıtlı) |
| 429 | Rate limit aşıldı |

## TypeScript Types

```typescript
type IdentifierType = 'phone' | 'email';
type OtpPurpose = 'warranty_register' | 'warranty_query';
type WarrantyStatus = 'active' | 'expired' | 'voided' | 'out_of_warranty';

interface RequestOtpDto {
  identifier: string;
  identifierType: IdentifierType;
  purpose: OtpPurpose;
}

interface VerifyOtpDto {
  identifier: string;
  identifierType: IdentifierType;
  otpCode: string;
  purpose: OtpPurpose;
}

interface SessionResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

interface CreateWarrantyDto {
  serialNumber: string;
  deviceModel?: string;
  firstName: string;
  lastName: string;
  identityNumber?: string;
  email: string;
  phone: string;
  invoiceImageUrl?: string;
  invoiceDate?: string;
  invoiceNumber?: string;
  warrantyStartDate: string;
  warrantyDurationMonths?: number;
}

interface WarrantyResponse {
  id: string;
  serialNumber: string;
  deviceModel: string | null;
  firstName: string;
  lastName: string;
  identityNumber: string | null;
  email: string;
  phone: string;
  status: WarrantyStatus;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyDurationMonths: number;
  createdAt: string;
}
```

## Notlar

- OTP 5 dakika geçerli, maksimum 3 deneme hakkı
- Session token 15 dakika geçerli
- `identityNumber` 11 haneli TC Kimlik numarası (sadece rakam)
- Tarihler ISO 8601 formatında (`YYYY-MM-DD`)
