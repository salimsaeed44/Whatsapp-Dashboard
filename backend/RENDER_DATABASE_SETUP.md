# 🗄️ إعداد قاعدة البيانات على Render / Render Database Setup

## 📋 نظرة عامة

هذا الدليل يوضح كيفية إعداد قاعدة بيانات PostgreSQL على Render وربطها مع Backend.

---

## ✅ الخطوة 1: إنشاء قاعدة بيانات PostgreSQL على Render

### في Render Dashboard:

1. **اذهب إلى Dashboard** → **New +** → **PostgreSQL**
2. **اختر الاسم**: `whatsapp-database` (أو أي اسم تفضله)
3. **اختر Plan**: 
   - **Free**: للاختبار والتطوير
   - **Starter**: للإنتاج (مستحسن)
4. **اختر Region**: اختر أقرب region لك
5. **اضغط Create Database**

### بعد الإنشاء:

Render سيضيف تلقائيًا متغير البيئة `DATABASE_URL` إلى Backend Service إذا ربطتهم معًا.

---

## ✅ الخطوة 2: ربط قاعدة البيانات مع Backend Service

### الطريقة 1: ربط تلقائي (موصى به)

1. **في Render Dashboard** → **Backend Service** → **Environment**
2. **اضغط على "Link Database"** أو **"Add Database"**
3. **اختر قاعدة البيانات** التي أنشأتها
4. Render سيضيف تلقائيًا `DATABASE_URL` environment variable

### الطريقة 2: إضافة يدوي

إذا لم تربط قاعدة البيانات تلقائيًا:

1. **في Render Dashboard** → **Backend Service** → **Environment**
2. **اضغط "Add Environment Variable"**
3. **أضف**:
   ```
   DATABASE_URL=postgres://user:password@host:port/database
   ```
   (ستجد هذا الرابط في قاعدة البيانات → **Connections** → **Internal Database URL**)

---

## ✅ الخطوة 3: تشغيل Migrations

بعد ربط قاعدة البيانات، يجب تشغيل migrations لإنشاء الجداول.

### الطريقة 1: استخدام Render Shell

1. **في Render Dashboard** → **Backend Service** → **Shell**
2. **شغل الأوامر**:
   ```bash
   cd backend
   npm install
   # Run migrations manually
   psql $DATABASE_URL -f migrations/001_create_users_table.sql
   psql $DATABASE_URL -f migrations/002_create_messages_table.sql
   psql $DATABASE_URL -f migrations/003_create_conversations_table.sql
   psql $DATABASE_URL -f migrations/004_create_templates_table.sql
   psql $DATABASE_URL -f migrations/005_create_broadcasts_table.sql
   psql $DATABASE_URL -f migrations/006_create_assignments_table.sql
   psql $DATABASE_URL -f migrations/007_create_notifications_table.sql
   psql $DATABASE_URL -f migrations/008_update_users_roles.sql
   ```

### الطريقة 2: استخدام Script (موصى به)

أنشئ script في `backend/package.json`:

```json
{
  "scripts": {
    "migrate": "node scripts/run-migrations.js"
  }
}
```

ثم شغله في Render Shell:
```bash
npm run migrate
```

### الطريقة 3: استخدام Render Build Command

أضف migrations إلى Build Command في Render:

```
npm install && npm run migrate && npm start
```

---

## ✅ الخطوة 4: إنشاء مستخدم Admin

بعد تشغيل migrations، أنشئ مستخدم admin:

### في Render Shell:

```bash
cd backend
npm run create-admin
```

أو يدويًا:

```bash
node scripts/create-admin.js
```

### بيانات الدخول الافتراضية:

- **Email**: `admin@whatsapp-dashboard.com`
- **Password**: `admin123456`

**⚠️ مهم**: غير كلمة المرور بعد أول تسجيل دخول!

---

## 🔍 التحقق من الاتصال

### اختبار الاتصال:

1. **في Render Dashboard** → **Backend Service** → **Logs**
2. **ابحث عن**: `✅ Database connection successful`
3. **إذا رأيت**: `❌ Database connection failed`
   - تحقق من `DATABASE_URL` في Environment Variables
   - تحقق من أن قاعدة البيانات نشطة
   - تحقق من Logs في قاعدة البيانات

---

## 📝 متغيرات البيئة المطلوبة

### على Render (Production):

```env
DATABASE_URL=postgres://user:password@host:port/database
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_SECRET=your-webhook-secret
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### محليًا (Development):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whatsapp_db
DB_USER=postgres
DB_PASSWORD=postgres
# أو استخدام DATABASE_URL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/whatsapp_db
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_SECRET=your-webhook-secret
CORS_ORIGIN=http://localhost:5173
```

---

## 🆘 حل المشاكل الشائعة

### المشكلة 1: Database connection failed

**الأسباب المحتملة**:
- `DATABASE_URL` غير موجود في Environment Variables
- قاعدة البيانات غير نشطة
- بيانات الاتصال غير صحيحة

**الحل**:
1. تحقق من `DATABASE_URL` في Backend Service → Environment
2. تحقق من أن قاعدة البيانات نشطة في Render Dashboard
3. تحقق من Logs في قاعدة البيانات

### المشكلة 2: SSL connection error

**السبب**: Render يتطلب SSL connections

**الحل**: 
الكود يدعم SSL تلقائيًا في Production. تأكد من أن `NODE_ENV=production`

### المشكلة 3: Migrations لم تعمل

**الحل**:
1. شغل migrations يدويًا في Render Shell
2. أو أضف migrations إلى Build Command
3. أو استخدم script لتشغيل migrations

### المشكلة 4: الجداول غير موجودة

**الحل**:
1. تحقق من أن migrations تم تشغيلها
2. تحقق من Logs في Render
3. شغل migrations مرة أخرى إذا لزم الأمر

---

## 📚 مراجع إضافية

- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [pg Node.js Library](https://node-postgres.com/)

---

**آخر تحديث / Last Updated**: 2025-01-17

**الحالة / Status**: ✅ جاهز للاستخدام / Ready to Use

