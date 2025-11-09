# Config Directory

## نظرة عامة / Overview

هذا المجلد يحتوي على ملفات الإعدادات والتكوين.

This directory contains configuration and setup files.

## الملفات / Files

### database.js
PostgreSQL database connection pool:
- `pool` - Connection pool instance
- `query(text, params)` - Execute a query
- `getClient()` - Get a client from the pool for transactions
- `transaction(callback)` - Execute a transaction
- `testConnection()` - Test database connection
- `close()` - Close the connection pool

### jwt.config.js
JWT configuration utilities:
- `generateAccessToken(payload)` - إنشاء access token
- `generateRefreshToken(payload)` - إنشاء refresh token
- `verifyToken(token, secret)` - التحقق من token
- `decodeToken(token)` - فك تشفير token (بدون تحقق)

## الاستخدام / Usage

### Database

```javascript
const { query, testConnection, transaction } = require('./config/database');

// Test connection
await testConnection();

// Execute a simple query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Execute a transaction
await transaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO messages ...');
});
```

### JWT

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

### Database Configuration
- `DB_HOST` - Database host (default: 'localhost')
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` or `POSTGRES_DB` - Database name (default: 'whatsapp_db')
- `DB_USER` or `POSTGRES_USER` - Database user (default: 'postgres')
- `DB_PASSWORD` or `POSTGRES_PASSWORD` - Database password (default: 'postgres')
- `DB_POOL_MAX` - Maximum number of clients in the pool (default: 20)
- `DB_POOL_IDLE_TIMEOUT` - Idle timeout in milliseconds (default: 30000)
- `DB_POOL_CONNECTION_TIMEOUT` - Connection timeout in milliseconds (default: 2000)

### JWT Configuration
- `JWT_SECRET` - Secret key for signing JWT tokens
- `JWT_EXPIRES_IN` - Access token expiration time (default: '24h')
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens (optional, defaults to JWT_SECRET)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration time (default: '7d')

## ملاحظات / Notes

### Database
- Connection pool يتم إنشاؤه تلقائياً عند استيراد الملف
- يُنصح باختبار الاتصال عند بدء التطبيق
- Transaction support متوفر للعمليات المعقدة
- Slow queries يتم تسجيلها في بيئة التطوير (أكثر من 1 ثانية)

### JWT
- جميع functions حالياً تحتوي على placeholders
- يجب إعداد JWT_SECRET في environment variables
- يوصى باستخدام secrets مختلفة للإنتاج والتطوير





