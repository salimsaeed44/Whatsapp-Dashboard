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
3. `003_create_conversations_table.sql` - إنشاء جدول المحادثات
4. `004_create_templates_table.sql` - إنشاء جدول القوالب
5. `005_create_broadcasts_table.sql` - إنشاء جدول البثوص
6. `006_create_assignments_table.sql` - إنشاء جدول التوزيعات
7. `007_create_notifications_table.sql` - إنشاء جدول الإشعارات
8. `008_update_users_roles.sql` - تحديث أدوار المستخدمين

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

### 003_create_conversations_table.sql
ينشئ جدول المحادثات (`conversations`) مع:
- إدارة حالة المحادثات (open, closed, pending, assigned)
- توزيع المحادثات على الموظفين
- أولويات المحادثات
- عدد الرسائل غير المقروءة

### 004_create_templates_table.sql
ينشئ جدول القوالب (`templates`) مع:
- إدارة قوالب الرسائل
- دعم متغيرات القوالب
- موافقة على القوالب
- ربط مع WhatsApp templates

### 005_create_broadcasts_table.sql
ينشئ جدول البثوص (`broadcasts`) مع:
- إدارة حملات البث
- تتبع حالة البث
- إحصائيات البث (sent, delivered, read, failed)
- جدول recipients لتتبع المستلمين

### 006_create_assignments_table.sql
ينشئ جدول التوزيعات (`assignments`) مع:
- تتبع توزيع المحادثات
- أنواع التوزيع (manual, auto, round_robin, load_balance)
- تحويل المحادثات بين الموظفين
- سجل التوزيعات

### 007_create_notifications_table.sql
ينشئ جدول الإشعارات (`notifications`) مع:
- إشعارات المستخدمين
- أنواع الإشعارات (message, assignment, transfer, broadcast, system, alert, reminder)
- أولويات الإشعارات
- تتبع حالة القراءة

### 008_update_users_roles.sql
يحدث جدول المستخدمين (`users`) لدعم:
- أدوار جديدة (supervisor, employee)
- تحديث constraint للأدوار

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





