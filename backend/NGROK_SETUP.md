# دليل إعداد ngrok / ngrok Setup Guide

## 📥 تحميل ngrok

### الخطوة 1: التحميل
1. اذهب إلى: https://ngrok.com/download
2. اختر **Windows** version
3. حمّل الملف المضغوط (ZIP)

### الخطوة 2: فك الضغط
1. فك ضغط الملف `ngrok.zip`
2. ستجد ملف `ngrok.exe` داخل المجلد

### الخطوة 3: نقل ngrok إلى مجلد دائم
أنقل `ngrok.exe` إلى مجلد دائم، مثل:
```
C:\ngrok\ngrok.exe
```

### الخطوة 4: إضافة ngrok إلى PATH (اختياري لكن موصى به)

#### الطريقة 1: عبر واجهة Windows
1. اضغط `Win + R`
2. اكتب `sysdm.cpl` واضغط Enter
3. اذهب إلى **Advanced** → **Environment Variables**
4. في القسم **System variables** ابحث عن `Path`
5. اضغط **Edit** → **New**
6. أضف: `C:\ngrok`
7. اضغط **OK** لحفظ التغييرات

#### الطريقة 2: عبر PowerShell (كمسؤول)
```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ngrok", "Machine")
```

**ملاحظة**: بعد إضافة ngrok إلى PATH، أغلق وافتح Terminal جديد.

---

## 🚀 تشغيل ngrok

### الطريقة 1: تشغيل مباشر
```bash
ngrok http 3000
```

### الطريقة 2: تشغيل مع ملف تكوين (موصى به)

#### إنشاء ملف تكوين:
1. أنشئ ملف `ngrok.yml` في `C:\ngrok\` أو في مجلد المشروع
2. أضف المحتوى التالي:

```yaml
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN
tunnels:
  whatsapp:
    addr: 3000
    proto: http
    hostname: your-custom-domain.ngrok.io  # Optional: if you have paid plan
```

#### الحصول على Auth Token:
1. سجّل في: https://dashboard.ngrok.com/signup
2. اذهب إلى: https://dashboard.ngrok.com/get-started/your-authtoken
3. انسخ الـ Auth Token

#### تشغيل مع التكوين:
```bash
ngrok start --config=ngrok.yml whatsapp
```

---

## 📋 استخدام ngrok مع WhatsApp Backend

### الخطوة 1: تشغيل Backend Server
```bash
cd backend
npm run dev
```

### الخطوة 2: تشغيل ngrok (في terminal جديد)
```bash
ngrok http 3000
```

ستحصل على رابط مثل:
```
Forwarding    https://abcd1234.ngrok.io -> http://localhost:3000
```

### الخطوة 3: استخدام الرابط في Meta Developer Console

1. انسخ رابط HTTPS (مثل: `https://abcd1234.ngrok.io`)
2. في Meta Developer Console:
   - **Callback URL**: `https://abcd1234.ngrok.io/api/whatsapp/webhook`
   - **Verify Token**: `12345`
   - **Subscribe to**: `messages`

---

## 🔧 نصائح مهمة

### 1. الرابط يتغير في النسخة المجانية
- في النسخة المجانية، الرابط يتغير في كل مرة تشغّل ngrok
- يجب تحديث Webhook URL في Meta Console عند كل تغيير
- الحل: استخدم خطة مدفوعة للحصول على رابط ثابت

### 2. ngrok Web Interface
- عند تشغيل ngrok، يمكنك فتح: http://localhost:4040
- سترى جميع الطلبات الواردة والاستجابات
- مفيد جداً للـ debugging

### 3. Authentication (لخطة مجانية)
- لا تحتاج authentication للاستخدام الأساسي
- لكن التسجيل مجاني ويعطيك:
  - Auth Token
  - إحصائيات الاستخدام
  - رابط ثابت (في الخطط المدفوعة)

### 4. Security
- ngrok رابط عام - أي شخص يمكنه الوصول إليه
- استخدم HTTPS دائماً
- لا تضع معلومات حساسة في logs

---

## 🧪 اختبار ngrok

### بعد تشغيل ngrok:
```bash
# اختبار Webhook verification
curl "https://your-ngrok-url.ngrok.io/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"

# يجب أن يعيد: TEST
```

---

## 📝 ملفات مساعدة

تم إنشاء الملفات التالية:
- `START_NGROK.bat` - لتشغيل ngrok بسهولة
- `START_SERVER_AND_NGROK.bat` - لتشغيل السيرفر و ngrok معاً

---

## 🔍 استكشاف الأخطاء

### ngrok not found
- تأكد من أن ngrok.exe موجود في PATH
- أو استخدم المسار الكامل: `C:\ngrok\ngrok.exe http 3000`

### Port already in use
- تأكد من أن المنفذ 3000 غير مستخدم
- أو استخدم منفذ آخر: `ngrok http 3001`

### Webhook verification fails
- تأكد من أن ngrok يعمل
- تأكد من أن Backend server يعمل
- تحقق من أن URL صحيح في Meta Console






