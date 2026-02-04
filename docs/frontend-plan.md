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

#### Garanti Kayıt için (warranty_register)

```http
POST /otp
Content-Type: application/json

{
  "identifier": "5551234567",
  "identifierType": "phone",      // "phone" | "email"
  "purpose": "warranty_register"
}
```

#### Garanti Sorgulama için (warranty_query)

> **Güvenlik:** OTP, kullanıcının girdiği bilgiye değil, cihazın kayıtlı iletişim bilgisine gönderilir.

```http
POST /otp
Content-Type: application/json

{
  "serialNumber": "SN123456789",
  "identifierType": "phone",      // "phone" | "email" - kayıtlı bilgilerden hangisine gönderilsin
  "purpose": "warranty_query"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully",
  "maskedIdentifier": "053****45",  // warranty_query için döner
  "expiresInMinutes": 5
}
```

### 2. OTP Doğrula (Session Al)

#### Garanti Kayıt için (warranty_register)

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

#### Garanti Sorgulama için (warranty_query)

```http
POST /sessions
Content-Type: application/json

{
  "serialNumber": "SN123456789",
  "otpCode": "123456",
  "purpose": "warranty_query"
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

> **Not:** Bu endpoint `multipart/form-data` formatı kullanır. Fatura görseli **zorunludur**.
> Garanti süresi otomatik **24 ay**, başlangıç tarihi **bugün** olarak ayarlanır.

```http
POST /warranties
Authorization: Bearer <token>
Content-Type: multipart/form-data

serialNumber: SN123456789
deviceModel: iPhone 15 Pro           (opsiyonel)
firstName: Ali
lastName: Yılmaz
identityNumber: 12345678901          (opsiyonel, 11 hane)
email: ali@example.com
phone: 5551234567
sourceReference: ORD-123             (opsiyonel)
invoiceImage: [FILE]                 (ZORUNLU - PNG, JPEG veya PDF, max 5MB)
```

**cURL Örneği:**
```bash
curl -X POST http://localhost:3000/api/v1/public/warranties \
  -H "Authorization: Bearer <token>" \
  -F "serialNumber=SN123456789" \
  -F "firstName=Ali" \
  -F "lastName=Yılmaz" \
  -F "email=ali@example.com" \
  -F "phone=5551234567" \
  -F "invoiceImage=@/path/to/invoice.pdf"
```

**Response (201):**
```json
{
  "id": "1",
  "serialNumber": "SN123456789",
  "status": "active",
  "warrantyStartDate": "2024-01-15",
  "warrantyEndDate": "2026-01-15",
  "warrantyDurationMonths": 24,
  "invoiceImageUrl": "http://minio:9000/invoices/abc123.pdf",
  ...
}
```

**Hata Yanıtları:**
- `400` - Fatura görseli eksik: `"Fatura görseli zorunludur"`
- `400` - Geçersiz dosya tipi: `"Geçersiz dosya tipi. İzin verilen tipler: image/png, image/jpeg, application/pdf"`
- `400` - Dosya çok büyük: `"Dosya boyutu çok büyük. Maksimum: 5 MB"`

### 4. Garanti Auth Bilgisi (Maskelenmiş)

> **Not:** Bu endpoint public'tir ve OTP akışı başlamadan önce çağrılır.

```http
GET /warranties/:serialNumber/auth-info
```

**Response (200):**
```json
{
  "serialNumber": "SN123456789",
  "maskedPhone": "053****45",
  "maskedEmail": "al***@example.com",
  "hasPhone": true,
  "hasEmail": true
}
```

**Response (404):**
```json
{
  "statusCode": 404,
  "message": "Garanti kaydı bulunamadı"
}
```

### 5. Garanti Sorgula

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

// Garanti auth bilgisi (maskelenmiş)
interface WarrantyAuthInfo {
  serialNumber: string;
  maskedPhone: string | null;
  maskedEmail: string | null;
  hasPhone: boolean;
  hasEmail: boolean;
}

// warranty_register için OTP talebi
interface RequestOtpForRegisterDto {
  identifier: string;
  identifierType: IdentifierType;
  purpose: 'warranty_register';
}

// warranty_query için OTP talebi (serialNumber ile)
interface RequestOtpForQueryDto {
  serialNumber: string;
  identifierType: IdentifierType;
  purpose: 'warranty_query';
}

type RequestOtpDto = RequestOtpForRegisterDto | RequestOtpForQueryDto;

interface OtpResponse {
  message: string;
  expiresInMinutes: number;
  maskedIdentifier?: string; // warranty_query için döner
}

// warranty_register için OTP doğrulama
interface VerifyOtpForRegisterDto {
  identifier: string;
  identifierType: IdentifierType;
  otpCode: string;
  purpose: 'warranty_register';
}

// warranty_query için OTP doğrulama (serialNumber ile)
interface VerifyOtpForQueryDto {
  serialNumber: string;
  otpCode: string;
  purpose: 'warranty_query';
}

type VerifyOtpDto = VerifyOtpForRegisterDto | VerifyOtpForQueryDto;

interface SessionResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

// Public API - multipart/form-data olarak gönderilir
interface CreateWarrantyPublicDto {
  serialNumber: string;
  deviceModel?: string;
  firstName: string;
  lastName: string;
  identityNumber?: string;
  email: string;
  phone: string;
  sourceReference?: string;
  // invoiceImage: File - form-data ile gönderilir (ZORUNLU)
  // NOT: warrantyStartDate ve warrantyDurationMonths API tarafından otomatik ayarlanır
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
- **Garanti kaydı için fatura görseli zorunludur** (PNG, JPEG veya PDF, max 5MB)
- Garanti süresi sabit **24 ay**, başlangıç tarihi otomatik **bugün** olarak ayarlanır
- Garanti kaydı `multipart/form-data` formatında gönderilmelidir
