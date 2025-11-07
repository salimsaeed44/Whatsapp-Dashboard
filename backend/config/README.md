# Config Directory

## نظرة عامة / Overview

هذا المجلد يحتوي على ملفات الإعدادات والتكوين.

This directory contains configuration and setup files.

## الملفات / Files

### jwt.config.js
JWT configuration utilities:
- `generateAccessToken(payload)` - إنشاء access token
- `generateRefreshToken(payload)` - إنشاء refresh token
- `verifyToken(token, secret)` - التحقق من token
- `decodeToken(token)` - فك تشفير token (بدون تحقق)

## الاستخدام / Usage

```javascript
const { generateAccessToken, verifyToken } = require('./config/jwt.config');

// Generate token
const token = generateAccessToken({
  id: user.id,
  email: user.email,
  role: user.role
});

// Verify token
const decoded = verifyToken(token);
```

## Environment Variables

Required environment variables:
- `JWT_SECRET` - Secret key for signing JWT tokens
- `JWT_EXPIRES_IN` - Access token expiration time (default: '24h')
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (optional, defaults to JWT_SECRET)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration time (default: '7d')

## ملاحظات / Notes

- جميع functions حالياً تحتوي على placeholders
- يجب إعداد JWT_SECRET في environment variables
- يوصى باستخدام secrets مختلفة للإنتاج والتطوير

