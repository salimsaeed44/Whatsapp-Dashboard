# دليل الإعداد الكامل / Complete Setup Guide

## 📋 قائمة الملفات المساعدة

### ملفات التشغيل (Windows Batch Files)
- ✅ `CHECK_SETUP.bat` - فحص الإعدادات والبيئة
- ✅ `START_SERVER.bat` - تشغيل Backend Server
- ✅ `START_NGROK.bat` - تشغيل ngrok Tunnel
- ✅ `START_SERVER_AND_NGROK.bat` - تشغيل Server و ngrok معاً
- ✅ `TEST_WEBHOOK.bat` - اختبار Webhook Verification
- ✅ `TEST_SEND_MESSAGE.bat` - اختبار إرسال الرسائل

### ملفات التوثيق
- ✅ `SETUP_GUIDE.md` - دليل الإعداد السريع
- ✅ `NGROK_SETUP.md` - دليل إعداد ngrok بالتفصيل
- ✅ `README_TESTING.md` - دليل الاختبار الشامل
- ✅ `QUICK_START.md` - بدء سريع

### ملفات الاختبار
- ✅ `test-webhook.js` - سكريبت اختبار Webhook
- ✅ `test-send-message.js` - سكريبت اختبار الإرسال

---

## 🚀 خطوات الإعداد الكاملة

### الخطوة 1: فحص الإعدادات

```bash
CHECK_SETUP.bat
```

سيقوم بفحص:
- ✅ Node.js
- ✅ npm
- ✅ ملف .env
- ✅ node_modules
- ✅ ngrok

### الخطوة 2: إنشاء ملف .env

أنشئ ملف `.env` في مجلد `backend/`:

```env
NODE_ENV=development
PORT=3000

META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763

JWT_SECRET=test_secret_key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
```

### الخطوة 3: تثبيت Dependencies

```bash
npm install
```

### الخطوة 4: تثبيت ngrok

1. **تحميل ngrok**:
   - اذهب إلى: https://ngrok.com/download
   - حمّل نسخة Windows

2. **تثبيت ngrok**:
   - فك الضغط عن الملف
   - أنقل `ngrok.exe` إلى `C:\ngrok\`

3. **إضافة إلى PATH (اختياري)**:
   - `Win + R` → `sysdm.cpl`
   - Advanced → Environment Variables
   - Path → Edit → New → `C:\ngrok`

4. **اختبار ngrok**:
   ```bash
   ngrok version
   ```

### الخطوة 5: تشغيل Backend Server

#### الطريقة 1: استخدام Batch File
```bash
START_SERVER.bat
```

#### الطريقة 2: يدوياً
```bash
npm run dev
```

**السيرفر سيعمل على**: `http://localhost:3000`

### الخطوة 6: اختبار Webhook Verification محلياً

```bash
TEST_WEBHOOK.bat
```

أو:
```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

**النتيجة المتوقعة**: `TEST`

### الخطوة 7: تشغيل ngrok

#### الطريقة 1: استخدام Batch File
```bash
START_NGROK.bat
```

#### الطريقة 2: يدوياً
```bash
ngrok http 3000
```

**ستحصل على**:
- رابط HTTPS: `https://abcd1234.ngrok.io`
- Dashboard: `http://localhost:4040`

### الخطوة 8: إعداد Webhook في Meta Developer Console

1. **الذهاب إلى Meta Developer Console**:
   - https://developers.facebook.com/
   - WhatsApp > Configuration

2. **إعداد Webhook**:
   - Callback URL: `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`
   - Verify Token: `12345`
   - Subscribe to: `messages`

3. **التحقق**:
   - اضغط "Verify and Save"
   - يجب أن يظهر ✅ إذا كان التحقق ناجحاً

### الخطوة 9: اختبار إرسال الرسائل

#### الطريقة 1: استخدام Batch File
```bash
TEST_SEND_MESSAGE.bat
```

#### الطريقة 2: استخدام Test Script
```bash
node test-send-message.js
```

#### الطريقة 3: استخدام cURL
```bash
curl -X POST http://localhost:3000/api/whatsapp/send -H "Content-Type: application/json" -d "{\"phoneNumber\": \"967773812563\", \"message\": \"رسالة اختبار\", \"type\": \"text\"}"
```

---

## 🔍 استكشاف الأخطاء

### مشكلة: Backend Server لا يعمل
- ✅ تأكد من أن `.env` موجود
- ✅ تأكد من تثبيت dependencies: `npm install`
- ✅ تحقق من المنفذ 3000 (قد يكون مستخدماً)

### مشكلة: Webhook verification fails
- ✅ تأكد من تطابق `META_VERIFY_TOKEN` في `.env` مع Meta Console
- ✅ تأكد من أن Backend Server يعمل
- ✅ تحقق من أن URL صحيح

### مشكلة: ngrok not found
- ✅ تأكد من تثبيت ngrok في `C:\ngrok\`
- ✅ أو أضفه إلى PATH
- ✅ أو استخدم المسار الكامل: `C:\ngrok\ngrok.exe http 3000`

### مشكلة: Cannot send messages
- ✅ تحقق من صلاحية `META_ACCESS_TOKEN`
- ✅ تأكد من صحة `WHATSAPP_PHONE_ID`
- ✅ تأكد من أن الرقم المستخدم مسموح به في Meta Console

### مشكلة: Webhook not receiving events
- ✅ تأكد من أن ngrok يعمل
- ✅ تأكد من أن Backend Server يعمل
- ✅ تحقق من Webhook URL في Meta Console
- ✅ تأكد من الاشتراك في events (`messages`)

---

## 📝 ملاحظات مهمة

1. **الرابط يتغير في ngrok المجاني**: يجب تحديث Webhook URL عند كل إعادة تشغيل ngrok
2. **ngrok Web Interface**: افتح http://localhost:4040 لرؤية جميع الطلبات
3. **Authentication**: تم تعطيل authentication مؤقتاً على `/api/whatsapp/send` للاختبار
4. **الرقم المسموح**: في مرحلة التطوير، يمكنك إرسال رسائل فقط للأرقام المضافة في Meta Console

---

## ✅ Checklist الإعداد

- [ ] Node.js مثبت
- [ ] npm مثبت
- [ ] ملف `.env` موجود ومملوء
- [ ] Dependencies مثبتة (`npm install`)
- [ ] Backend Server يعمل (`npm run dev`)
- [ ] Webhook verification يعمل محلياً
- [ ] ngrok مثبت ومُشغّل
- [ ] Webhook مُعد في Meta Developer Console
- [ ] تم اختبار إرسال الرسائل بنجاح

---

## 🎯 الخطوات التالية

بعد إكمال الإعداد:
1. ✅ ربط الخدمات مع قاعدة البيانات
2. ✅ إضافة logging للرسائل
3. ✅ تفعيل authentication على endpoints المحمية
4. ✅ إضافة error handling محسّن
5. ✅ إضافة rate limiting

---

## 📚 مراجع إضافية

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [ngrok Documentation](https://ngrok.com/docs)
- [Meta Developer Console](https://developers.facebook.com/)









