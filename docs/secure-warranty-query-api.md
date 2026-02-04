# Güvenli Garanti Sorgulama API Değişiklikleri

Bu dokümantasyon, garanti sorgulama akışındaki güvenlik açığını gidermek için gerekli backend API değişikliklerini tanımlar.

## Problem

Mevcut sistemde herhangi biri, herhangi bir seri numarasına ait garanti bilgilerini kendi iletişim bilgileriyle OTP doğrulaması yaparak görüntüleyebilir.

## Çözüm

OTP, kullanıcının girdiği iletişim bilgisine değil, cihazın kayıt sırasında kullanılan iletişim bilgisine gönderilmeli.

---

## Yeni Endpoint

### `GET /warranties/:serialNumber/auth-info`

Cihazın kayıtlı iletişim bilgilerini maskelenmiş olarak döndürür.

**Özellikler:**
- Public endpoint (authentication gerektirmez)
- Cihaz bulunamazsa 404 döner

**Request:**
```http
GET /api/v1/public/warranties/ABC123/auth-info
```

**Response (200 OK):**
```json
{
  "serialNumber": "ABC123",
  "maskedPhone": "053****45",
  "maskedEmail": "al***@gmail.com",
  "hasPhone": true,
  "hasEmail": true
}
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Garanti kaydı bulunamadı",
  "error": "Not Found"
}
```

---

## Değiştirilen Endpointler

### `POST /otp` (warranty_query için)

**Eski Format:**
```json
{
  "identifier": "5551234567",
  "identifierType": "phone",
  "purpose": "warranty_query"
}
```

**Yeni Format (warranty_query için):**
```json
{
  "serialNumber": "ABC123",
  "identifierType": "phone",
  "purpose": "warranty_query"
}
```

> **Not:** `warranty_register` purpose'u için eski format korunur.

**Response:**
```json
{
  "message": "Doğrulama kodu gönderildi",
  "maskedIdentifier": "053****45",
  "expiresInMinutes": 5
}
```

---

### `POST /sessions` (warranty_query için)

**Eski Format:**
```json
{
  "identifier": "5551234567",
  "identifierType": "phone",
  "otpCode": "123456",
  "purpose": "warranty_query"
}
```

**Yeni Format (warranty_query için):**
```json
{
  "serialNumber": "ABC123",
  "otpCode": "123456",
  "purpose": "warranty_query"
}
```

> **Not:** `warranty_register` purpose'u için eski format korunur.

**Response (değişiklik yok):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

## Backend Uygulama Notları

### Maskeleme Kuralları

**Telefon:**
- İlk 3 ve son 2 hane gösterilir
- Örnek: `5551234567` → `055****67`

**E-posta:**
- @ öncesi: ilk 2 karakter + `***`
- @ sonrası: tam gösterilir
- Örnek: `ali.yilmaz@gmail.com` → `al***@gmail.com`

### Güvenlik Kontrolü

OTP gönderimi ve doğrulaması sırasında:
1. `serialNumber` ile cihaz bulunur
2. `identifierType`'a göre kayıtlı telefon veya email alınır
3. OTP bu kayıtlı bilgiye gönderilir
4. Kullanıcı kendi bilgisini giremez

### Hata Durumları

| Durum | HTTP Kodu | Mesaj |
|-------|-----------|-------|
| Cihaz bulunamadı | 404 | "Garanti kaydı bulunamadı" |
| Seçilen iletişim bilgisi kayıtlı değil | 400 | "Bu cihazda kayıtlı telefon/e-posta bulunmamaktadır" |
| OTP yanlış | 401 | "Geçersiz doğrulama kodu" |
| OTP süresi dolmuş | 401 | "Doğrulama kodunun süresi dolmuş" |
