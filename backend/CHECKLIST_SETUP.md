# ✅ Checklist إعداد المشروع - Project Setup Checklist

## 📋 الملاحظات المهمة / Important Notes

### 1. قاعدة البيانات PostgreSQL 🗄️

#### التحقق من أن PostgreSQL يعمل:

**الطريقة 1: استخدام Docker (موصى بها)**
```bash
# تشغيل PostgreSQL باستخدام Docker Compose
docker-compose up -d db

# التحقق من أن Container يعمل
docker ps

# يجب أن ترى container باسم "whatsapp-db"
```

**الطريقة 2: PostgreSQL محلي**
```bash
# في Windows (PowerShell)
Get-Service -Name postgresql*

# أو التحقق من Process
Get-Process -Name postgres -ErrorAction SilentlyContinue

# في Linux/Mac
sudo systemctl status postgresql
# أو
pg_isready
```

#### إنشاء قاعدة البيانات:

```sql
-- الاتصال بـ PostgreSQL
psql -U postgres

-- إنشاء قاعدة البيانات
CREATE DATABASE whatsapp_db;

-- التحقق من إنشاء قاعدة البيانات
\l

-- الخروج
\q
```

#### تطبيق Migrations:

```bash
# تطبيق جميع migrations بالترتيب
cd backend/migrations

# Migration 1: Users Table
psql -U postgres -d whatsapp_db -f 001_create_users_table.sql

# Migration 2: Messages Table
psql -U postgres -d whatsapp_db -f 002_create_messages_table.sql

# Migration 3: Conversations Table
psql -U postgres -d whatsapp_db -f 003_create_conversations_table.sql

# Migration 4: Templates Table
psql -U postgres -d whatsapp_db -f 004_create_templates_table.sql

# Migration 5: Broadcasts Table
psql -U postgres -d whatsapp_db -f 005_create_broadcasts_table.sql

# Migration 6: Assignments Table
psql -U postgres -d whatsapp_db -f 006_create_assignments_table.sql

# Migration 7: Notifications Table
psql -U postgres -d whatsapp_db -f 007_create_notifications_table.sql

# Migration 8: Update Users Roles
psql -U postgres -d whatsapp_db -f 008_update_users_roles.sql
```

**أو استخدام script واحد:**
```bash
# في Windows (PowerShell)
$migrations = @(
    "001_create_users_table.sql",
    "002_create_messages_table.sql",
    "003_create_conversations_table.sql",
    "004_create_templates_table.sql",
    "005_create_broadcasts_table.sql",
    "006_create_assignments_table.sql",
    "007_create_notifications_table.sql",
    "008_update_users_roles.sql"
)

foreach ($migration in $migrations) {
    Write-Host "Applying $migration..."
    psql -U postgres -d whatsapp_db -f "backend/migrations/$migration"
}
```

---

### 2. متغيرات البيئة (Environment Variables) 🔐

#### إنشاء ملف `.env` في مجلد `backend/`:

```bash
# في backend/.env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_db
DB_USER=postgres
DB_PASSWORD=postgres

# أو استخدام Docker Compose variables
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=whatsapp_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# WhatsApp Business Cloud API
WHATSAPP_PHONE_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_SECRET=your-webhook-secret
WHATSAPP_API_VERSION=v18.0

# Botpress (Optional)
BOTPRESS_URL=http://localhost:3001
BOTPRESS_API_KEY=your-botpress-api-key

# Database Pool Configuration (Optional)
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

#### التحقق من ملف `.env`:

```bash
# في PowerShell
Test-Path backend/.env

# يجب أن يرجع True
# إذا كان False، أنشئ الملف من .env.example
Copy-Item backend/.env.example backend/.env

# ثم عدّل القيم حسب إعداداتك
```

#### ملاحظات أمنية:

1. **لا ترفع ملف `.env` إلى Git** - تأكد من أن `.gitignore` يحتوي على `.env`
2. **استخدم قيم مختلفة في Production** - خاصة `JWT_SECRET` و `DB_PASSWORD`
3. **احفظ `.env` في مكان آمن** - لا تشاركه مع أحد

---

### 3. Port 3000 🔌

#### التحقق من أن Port 3000 غير مستخدم:

**في Windows (PowerShell):**
```powershell
# التحقق من Port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# إذا وجدت اتصال، شوف Process ID
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# أو استخدم netstat
netstat -ano | findstr :3000
```

**في Linux/Mac:**
```bash
# التحقق من Port 3000
lsof -i :3000

# أو
netstat -tuln | grep 3000
```

#### تغيير Port إذا كان مستخدم:

**الطريقة 1: تغيير في `.env`**
```bash
PORT=3001
```

**الطريقة 2: تغيير في `server.js`**
```javascript
const PORT = process.env.PORT || 3001; // غير 3000 إلى 3001
```

**الطريقة 3: إيقاف العملية المستخدمة للـ Port**
```powershell
# في Windows
# ابحث عن Process ID من netstat
netstat -ano | findstr :3000

# أوقف العملية (استبدل PID برقم العملية)
taskkill /PID <PID> /F
```

---

### 4. Dependencies (التبعيات) 📦

#### تثبيت Dependencies:

```bash
cd backend
npm install
```

#### التحقق من التبعيات المثبتة:

```bash
# التحقق من node_modules
Test-Path backend/node_modules

# يجب أن يرجع True

# التحقق من package-lock.json
Test-Path backend/package-lock.json

# يجب أن يرجع True
```

#### التبعيات المطلوبة:

- `express` - Web framework
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `axios` - HTTP client
- `bcrypt` - Password hashing

#### في حالة وجود أخطاء في التثبيت:

```bash
# حذف node_modules و package-lock.json
Remove-Item -Recurse -Force backend/node_modules
Remove-Item -Force backend/package-lock.json

# تثبيت مرة أخرى
cd backend
npm install
```

---

### 5. اختبار الاتصال بقاعدة البيانات 🧪

#### اختبار الاتصال:

```bash
# شغل السيرفر
cd backend
npm run dev

# يجب أن ترى في Console:
# ✅ Database connection successful: [timestamp]
# 🚀 Server is running on port 3000
```

#### في حالة فشل الاتصال:

**الخطأ: `connection refused`**
- تأكد من أن PostgreSQL يعمل
- تحقق من `DB_HOST` و `DB_PORT` في `.env`
- تأكد من أن Firewall لا يمنع الاتصال

**الخطأ: `authentication failed`**
- تحقق من `DB_USER` و `DB_PASSWORD` في `.env`
- تأكد من أن المستخدم موجود في PostgreSQL
- جرب الاتصال يدوياً: `psql -U postgres -d whatsapp_db`

**الخطأ: `database does not exist`**
- أنشئ قاعدة البيانات: `CREATE DATABASE whatsapp_db;`
- تحقق من `DB_NAME` في `.env`

---

### 6. اختبار السيرفر 🚀

#### اختبار Health Check:

```powershell
# في PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing

# يجب أن ترى:
# StatusCode: 200
# Content: {"status":"OK","message":"WhatsApp Dashboard Backend is running",...}
```

#### اختبار API Endpoints:

```powershell
# Root endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api" -UseBasicParsing

# يجب أن ترى قائمة بجميع endpoints
```

#### استخدام Postman أو curl:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

---

## ✅ Checklist السريع / Quick Checklist

قبل تشغيل السيرفر، تأكد من:

- [ ] PostgreSQL يعمل (`docker ps` أو `pg_isready`)
- [ ] قاعدة البيانات `whatsapp_db` موجودة
- [ ] جميع Migrations تم تطبيقها (8 migrations)
- [ ] ملف `.env` موجود في `backend/` و يحتوي على جميع المتغيرات المطلوبة
- [ ] `node_modules` موجود (تم تشغيل `npm install`)
- [ ] Port 3000 غير مستخدم
- [ ] السيرفر يعمل (`npm run dev`)
- [ ] Health check يعمل (`http://localhost:3000/health`)
- [ ] الاتصال بقاعدة البيانات ناجح (يظهر ✅ في Console)

---

## 🆘 حل المشاكل الشائعة / Troubleshooting

### المشكلة: السيرفر لا يعمل
**الحل:**
1. تحقق من أن Port 3000 غير مستخدم
2. تحقق من أن جميع Dependencies مثبتة
3. تحقق من ملف `.env`
4. شوف Console للأخطاء

### المشكلة: فشل الاتصال بقاعدة البيانات
**الحل:**
1. تأكد من أن PostgreSQL يعمل
2. تحقق من `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` في `.env`
3. تأكد من أن قاعدة البيانات موجودة
4. جرب الاتصال يدوياً: `psql -U postgres -d whatsapp_db`

### المشكلة: Migrations فشلت
**الحل:**
1. تأكد من أن قاعدة البيانات موجودة
2. تحقق من أن المستخدم لديه صلاحيات CREATE TABLE
3. تأكد من تطبيق Migrations بالترتيب الصحيح
4. تحقق من أن `uuid-ossp` extension مثبت: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### المشكلة: JWT errors
**الحل:**
1. تأكد من أن `JWT_SECRET` موجود في `.env`
2. تأكد من أن `JWT_SECRET` ليس فارغاً
3. استخدم قيمة قوية لـ `JWT_SECRET` (على الأقل 32 حرف)

---

## 📞 الدعم / Support

إذا واجهت أي مشاكل:
1. راجع Console للأخطاء
2. تحقق من ملف `.env`
3. تحقق من أن جميع المتطلبات مثبتة
4. راجع هذا الدليل مرة أخرى

---

**آخر تحديث / Last Updated**: 2025-01-17

