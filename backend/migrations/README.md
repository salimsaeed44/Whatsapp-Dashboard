# Database Migrations

## نظرة عامة / Overview

هذا المجلد يحتوي على ملفات SQL migrations لإعداد قاعدة البيانات.

This directory contains SQL migration files for database setup.

## الاستخدام / Usage

### تطبيق Migrations

```bash
# تطبيق جميع migrations
psql -U postgres -d whatsapp_db -f migrations/001_create_users_table.sql
psql -U postgres -d whatsapp_db -f migrations/002_create_messages_table.sql

# أو باستخدام Docker
docker exec -i whatsapp-db psql -U postgres -d whatsapp_db < migrations/001_create_users_table.sql
```

### ترتيب Migrations

يجب تطبيق migrations بالترتيب حسب الأرقام:
1. `001_create_users_table.sql` - إنشاء جدول المستخدمين
2. `002_create_messages_table.sql` - إنشاء جدول الرسائل

## الملفات / Files

### 001_create_users_table.sql
ينشئ جدول المستخدمين (`users`) مع:
- حقول المستخدم الأساسية (email, username, password, role)
- Indexes للأداء
- Trigger لتحديث `updated_at` تلقائياً
- مستخدم admin افتراضي

### 002_create_messages_table.sql
ينشئ جدول الرسائل (`messages`) مع:
- حقول الرسالة الأساسية
- ربط مع جدول المستخدمين
- Indexes للأداء
- دعم metadata كـ JSONB

## ملاحظات مهمة / Important Notes

1. **الأمان**: تأكد من تغيير كلمة مرور المستخدم الافتراضي admin بعد أول تسجيل دخول
2. **الترتيب**: التزم بترتيب تطبيق migrations
3. **النسخ الاحتياطي**: قم بعمل backup قبل تطبيق migrations على قاعدة بيانات الإنتاج

## Migration Tools

يمكن استخدام أدوات مثل:
- `node-pg-migrate`
- `knex.js`
- `sequelize-cli`

أو تطبيق الملفات يدوياً باستخدام `psql`.

