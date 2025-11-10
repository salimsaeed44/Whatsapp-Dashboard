# 🔧 إصلاح مشكلة اتصال Supabase

## المشكلة

خطأ `ECONNREFUSED` عند محاولة الاتصال بقاعدة البيانات على Supabase:
```
Error: connect ECONNREFUSED 52.47.148.215:5432
Error: connect ECONNREFUSED 35.181.159.10:5432
```

## الأسباب المحتملة

1. **Connection String غير صحيح أو منتهي الصلاحية**
2. **SSL Configuration غير صحيح**
3. **Supabase Pooler غير متاح أو تم تغيير الإعدادات**
4. **Firewall أو Network restrictions**

## الحلول

### 1. التحقق من DATABASE_URL

تأكد من أن `DATABASE_URL` في Render Environment Variables صحيح:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].pooler.supabase.com:5432/postgres?pgbouncer=true
```

أو للاتصال المباشر:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].pooler.supabase.com:6543/postgres
```

### 2. استخدام Connection Pooler (المُوصى به)

Supabase يوفر Connection Pooler على المنفذ **6543** بدلاً من **5432**.

إذا كان `DATABASE_URL` يستخدم المنفذ 5432، قم بتغييره إلى 6543:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].pooler.supabase.com:6543/postgres
```

### 3. التحقق من SSL Settings

Supabase يتطلب SSL. تأكد من أن `DATABASE_URL` يحتوي على `?sslmode=require`:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].pooler.supabase.com:6543/postgres?sslmode=require
```

### 4. الحصول على Connection String الجديد من Supabase

1. افتح Supabase Dashboard
2. اذهب إلى **Settings** > **Database**
3. ابحث عن **Connection String** أو **Connection Pooling**
4. انسخ **Connection Pooling** string (يستخدم المنفذ 6543)
5. استبدل `[YOUR-PASSWORD]` بكلمة المرور الصحيحة
6. أضف `?sslmode=require` في النهاية
7. حدّث `DATABASE_URL` في Render Environment Variables

### 5. التحقق من Supabase Settings

1. تأكد من أن **Connection Pooling** مفعّل في Supabase
2. تأكد من أن **Database** نشط وليس paused
3. تحقق من **Network Restrictions** (يجب أن تسمح بالاتصالات من Render)

### 6. استخدام Direct Connection (بدون Pooler)

إذا كان Pooler لا يعمل، جرب الاتصال المباشر:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].supabase.co:5432/postgres?sslmode=require
```

**ملاحظة:** الاتصال المباشر محدود بعدد الاتصالات المتزامنة.

## خطوات الإصلاح على Render

### الخطوة 1: تحديث DATABASE_URL

1. افتح Render Dashboard
2. اذهب إلى Backend Service
3. افتح **Environment** tab
4. ابحث عن `DATABASE_URL`
5. حدّث القيمة بـ Connection String الجديد من Supabase
6. احفظ التغييرات
7. انتظر إعادة النشر التلقائي

### الخطوة 2: التحقق من Environment Variables الأخرى

تأكد من وجود المتغيرات التالية:

- `DATABASE_URL` - Connection string من Supabase
- `NODE_ENV=production`
- `JWT_SECRET` - موجود وصحيح
- `WHATSAPP_PHONE_ID` - موجود وصحيح
- `WHATSAPP_ACCESS_TOKEN` - موجود وصحيح

### الخطوة 3: مراقبة Logs

بعد إعادة النشر، راجع Logs للتحقق من:

```
📊 Using DATABASE_URL for database connection
🔐 Supabase connection detected - SSL enabled
📡 Using optimized connection pool settings for Supabase
🔗 Connection type: Pooler
📍 Database host: aws-[REGION]-[NUMBER].pooler.supabase.com
📍 Database port: 6543
✅ Database connection successful: [timestamp]
```

إذا رأيت `✅ Database connection successful`، فالاتصال ناجح!

## اختبار الاتصال محلياً

يمكنك اختبار الاتصال محلياً:

```bash
# اختبار الاتصال باستخدام psql
psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].pooler.supabase.com:6543/postgres?sslmode=require"

# أو استخدام Node.js
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION]-[NUMBER].pooler.supabase.com:6543/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(res => {
  console.log('✅ Connected:', res.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
```

## ملاحظات إضافية

1. **Connection Pooling**: Supabase Pooler محدود بعدد معين من الاتصالات. تأكد من استخدام Pooler بدلاً من Direct Connection في Production.

2. **SSL Mode**: Supabase يتطلب SSL. استخدم `sslmode=require` أو `?ssl=true`.

3. **Timeout Settings**: إذا كانت الاتصالات بطيئة، قم بزيادة `connectionTimeoutMillis` في `database.js`.

4. **Pool Size**: Supabase يوصي بعدد اتصالات صغير (10-20). تجنب استخدام pool كبير.

5. **Retry Logic**: الكود الآن يحتوي على retry logic تلقائي. إذا فشل الاتصال، سيحاول مرة أخرى تلقائياً.

## إذا استمرت المشكلة

1. تحقق من Supabase Status Page
2. راجع Supabase Logs
3. تحقق من Network Restrictions في Supabase
4. جرب إنشاء Connection String جديد
5. تحقق من أن Password صحيح وغير منتهي الصلاحية

