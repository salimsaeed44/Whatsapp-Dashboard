# 🚀 تشغيل Migrations على Render / Running Migrations on Render

## 🎯 المشكلة

الجداول غير موجودة في قاعدة البيانات (`relation "conversations" does not exist`, `relation "messages" does not exist`).

هذا يعني أن migrations لم يتم تشغيلها على قاعدة البيانات على Render/Supabase.

---

## ✅ الحل: تشغيل Migrations على Render

### الطريقة 1: استخدام Render Shell (موصى به)

1. **في Render Dashboard** → **Backend Service** → **Shell**
2. شغل الأوامر التالية:

```bash
cd backend
npm install
npm run migrate
```

### الطريقة 2: استخدام Render Build Command

يمكنك إضافة migrations إلى Build Command في Render:

1. **في Render Dashboard** → **Backend Service** → **Settings** → **Build Command**
2. غيّر Build Command إلى:
   ```bash
   npm install && npm run migrate && npm start
   ```

**⚠️ ملاحظة**: هذه الطريقة ستشغل migrations في كل deploy. استخدمها فقط إذا كنت متأكداً.

### الطريقة 3: استخدام Script يدوي

1. **في Render Dashboard** → **Backend Service** → **Shell**
2. شغل الأوامر:

```bash
cd backend
node scripts/run-migrations.js
```

---

## 📋 خطوات تفصيلية

### 1️⃣ التحقق من الاتصال بقاعدة البيانات

قبل تشغيل migrations، تأكد من أن Backend Service متصل بقاعدة البيانات:

1. **في Render Dashboard** → **Backend Service** → **Logs**
2. ابحث عن:
   ```
   📊 Using DATABASE_URL for database connection
   🔐 Supabase connection detected - SSL enabled
   ✅ Database connection successful: 2025-01-17T...
   ```

إذا رأيت `❌ Database connection failed`، تحقق من:
- `DATABASE_URL` موجود في Environment Variables
- `DATABASE_URL` صحيح ومكتمل
- قاعدة البيانات نشطة على Supabase

### 2️⃣ تشغيل Migrations

في **Render Dashboard** → **Backend Service** → **Shell**:

```bash
# الانتقال إلى مجلد backend
cd backend

# تثبيت dependencies (إذا لم تكن مثبتة)
npm install

# تشغيل migrations
npm run migrate
```

### 3️⃣ التحقق من النتائج

بعد تشغيل migrations، يجب أن ترى:

```
🚀 Starting database migrations...
📊 Using DATABASE_URL for database connection
🔐 Supabase connection detected - SSL enabled
✅ Database connection successful: 2025-01-17T...
📦 Found 8 migration file(s)
📄 Running migration: 001_create_users_table.sql
✅ Migration completed: 001_create_users_table.sql
📄 Running migration: 002_create_messages_table.sql
✅ Migration completed: 002_create_messages_table.sql
📄 Running migration: 003_create_conversations_table.sql
✅ Migration completed: 003_create_conversations_table.sql
📄 Running migration: 004_create_templates_table.sql
✅ Migration completed: 004_create_templates_table.sql
📄 Running migration: 005_create_broadcasts_table.sql
✅ Migration completed: 005_create_broadcasts_table.sql
📄 Running migration: 006_create_assignments_table.sql
✅ Migration completed: 006_create_assignments_table.sql
📄 Running migration: 007_create_notifications_table.sql
✅ Migration completed: 007_create_notifications_table.sql
📄 Running migration: 008_update_users_roles.sql
✅ Migration completed: 008_update_users_roles.sql
✅ All migrations completed successfully!
✅ Database connection pool closed
```

### 4️⃣ التحقق من الجداول

للتحقق من أن الجداول تم إنشاؤها:

1. **في Supabase Dashboard** → **Table Editor**
2. يجب أن ترى الجداول التالية:
   - `users`
   - `messages`
   - `conversations`
   - `templates`
   - `broadcasts`
   - `assignments`
   - `notifications`

أو استخدم SQL Query في Supabase:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 🔍 حل المشاكل الشائعة

### المشكلة 1: Migration failed - relation already exists

**السبب**: الجدول موجود بالفعل

**الحل**:
- Migrations تستخدم `CREATE TABLE IF NOT EXISTS`، لذا لا داعي للقلق
- إذا أردت إعادة تشغيل migrations، استخدم `DROP TABLE` أولاً (⚠️ سيحذف البيانات)

### المشكلة 2: Migration failed - permission denied

**السبب**: المستخدم لا يملك صلاحيات كافية

**الحل**:
- تحقق من أن `DATABASE_URL` يحتوي على مستخدم بصلاحيات كاملة
- في Supabase، استخدم `postgres` user أو user بصلاحيات `SUPERUSER`

### المشكلة 3: Migration failed - syntax error

**السبب**: خطأ في SQL syntax

**الحل**:
- تحقق من ملفات migrations
- تأكد من أن جميع الـ SQL statements صحيحة
- تحقق من Logs للحصول على تفاصيل الخطأ

### المشكلة 4: Migration failed - foreign key constraint

**السبب**: محاولة إنشاء foreign key قبل إنشاء الجدول المرجعي

**الحل**:
- Migrations مرتبة بالترتيب الصحيح (001 → 008)
- تأكد من تشغيل جميع migrations بالترتيب

---

## 📝 Checklist

- [ ] `DATABASE_URL` موجود في Backend Environment Variables
- [ ] قاعدة البيانات متصلة (✅ Database connection successful)
- [ ] Migrations تم تشغيلها (`npm run migrate`)
- [ ] جميع migrations تمت بنجاح (✅ All migrations completed successfully!)
- [ ] الجداول موجودة في Supabase (users, messages, conversations, etc.)
- [ ] Backend Service يعمل بدون أخطاء
- [ ] يمكن الوصول إلى Dashboard بدون أخطاء

---

## 🎯 بعد تشغيل Migrations

بعد تشغيل migrations بنجاح:

1. **إنشاء مستخدم Admin**:
   ```bash
   npm run create-admin
   ```

2. **إعادة تشغيل Backend Service**:
   - في Render Dashboard → Backend Service → Manual Deploy
   - أو انتظر Auto-deploy

3. **اختبار النظام**:
   - سجّل الدخول في Frontend
   - تحقق من أن Dashboard يعمل
   - جرب إرسال رسالة

---

## 📚 مراجع

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Migrations](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Render Shell Documentation](https://render.com/docs/ssh)

---

**آخر تحديث / Last Updated**: 2025-01-17

**الحالة / Status**: ✅ جاهز للاستخدام / Ready to Use

