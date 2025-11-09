# 🔐 إنشاء مستخدم Admin - Create Admin User

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إنشاء مستخدم Admin للدخول إلى النظام.

## ✅ الطريقة 1: استخدام Script (موصى به)

### الخطوات:

1. **تأكد من أن قاعدة البيانات جاهزة**:
   ```bash
   # تأكد من أن PostgreSQL يعمل
   # تأكد من تطبيق migrations
   ```

2. **شغّل Script**:
   ```bash
   cd backend
   npm run create-admin
   ```

3. **ستحصل على**:
   ```
   ✅ Admin user created successfully!
   📧 Email: admin@whatsapp-dashboard.com
   👤 Username: admin
   🔑 Password: admin123456
   👑 Role: admin
   ```

### بيانات الدخول الافتراضية:

| الحقل | القيمة |
|-------|--------|
| **Email** | `admin@whatsapp-dashboard.com` |
| **Password** | `admin123456` |
| **Username** | `admin` |
| **Role** | `admin` |

---

## ✅ الطريقة 2: استخدام API (Register)

### الخطوات:

1. **افتح Postman أو أي API client**

2. **أرسل Request**:
   ```
   POST http://localhost:3000/api/auth/register
   Content-Type: application/json

   {
     "email": "admin@whatsapp-dashboard.com",
     "password": "admin123456",
     "username": "admin",
     "full_name": "System Administrator",
     "role": "admin"
   }
   ```

3. **سجّل الدخول**:
   ```
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@whatsapp-dashboard.com",
     "password": "admin123456"
   }
   ```

---

## ✅ الطريقة 3: إنشاء مستخدم يدوياً في قاعدة البيانات

### الخطوات:

1. **توليد Password Hash**:
   ```javascript
   // في Node.js console
   const bcrypt = require('bcrypt');
   bcrypt.hash('admin123456', 10).then(hash => console.log(hash));
   ```

2. **إدراج المستخدم في قاعدة البيانات**:
   ```sql
   INSERT INTO users (email, username, password, role, full_name, is_active)
   VALUES (
       'admin@whatsapp-dashboard.com',
       'admin',
       '$2b$10$YOUR_HASHED_PASSWORD_HERE',
       'admin',
       'System Administrator',
       true
   );
   ```

---

## 🔒 تغيير كلمة المرور

بعد تسجيل الدخول الأول، **يُنصح بشدة** بتغيير كلمة المرور:

### عبر API:

```
PUT http://localhost:3000/api/users/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "password": "new_secure_password_123"
}
```

### عبر قاعدة البيانات:

```sql
-- توليد hash جديد لكلمة المرور الجديدة
UPDATE users 
SET password = '$2b$10$NEW_HASHED_PASSWORD_HERE'
WHERE email = 'admin@whatsapp-dashboard.com';
```

---

## ⚠️ ملاحظات أمنية مهمة

1. **غيّر كلمة المرور الافتراضية فوراً** بعد أول تسجيل دخول
2. **لا تستخدم كلمات مرور ضعيفة** في Production
3. **استخدم كلمات مرور قوية** (8 أحرف على الأقل، مزيج من أحرف وأرقام ورموز)
4. **لا تشارك بيانات الدخول** مع أي شخص
5. **في Production**، استخدم كلمة مرور قوية جداً

---

## 🧪 اختبار الدخول

### عبر Frontend:

1. افتح Frontend: `http://localhost:5173`
2. اذهب إلى صفحة Login
3. أدخل:
   - Email: `admin@whatsapp-dashboard.com`
   - Password: `admin123456`
4. اضغط "تسجيل الدخول"

### عبر API:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@whatsapp-dashboard.com",
    "password": "admin123456"
  }'
```

---

## 📝 بيانات الدخول النهائية

بعد إنشاء المستخدم باستخدام أي من الطرق أعلاه:

**Email:** `admin@whatsapp-dashboard.com`  
**Password:** `admin123456`  
**Username:** `admin`  
**Role:** `admin`

---

**آخر تحديث / Last Updated**: 2025-01-17

