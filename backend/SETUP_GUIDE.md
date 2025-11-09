# دليل الإعداد السريع / Quick Setup Guide

## الخطوات السريعة

### 1️⃣ إنشاء ملف .env

أنشئ ملف `.env` في مجلد `backend/` وأضف المحتوى التالي:

```env
# Server
NODE_ENV=development
PORT=3000

# WhatsApp API
META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763

# JWT (for testing)
JWT_SECRET=test_secret_key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2️⃣ تثبيت Dependencies

```bash
cd backend
npm install
```

### 3️⃣ تشغيل السيرفر

#### Windows:
```bash
START_SERVER.bat
```

#### أو يدوياً:
```bash
npm run dev
```

السيرفر سيعمل على: `http://localhost:3000`

### 4️⃣ اختبار Webhook Verification

#### Windows:
```bash
TEST_WEBHOOK.bat
```

#### أو يدوياً:
```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

**يجب أن ترى**: `TEST`

### 5️⃣ إعداد ngrok

#### تحميل وتثبيت ngrok:
1. اذهب إلى: https://ngrok.com/download
2. حمّل نسخة Windows
3. فك الضغط وأنقل `ngrok.exe` إلى `C:\ngrok\`
4. (اختياري) أضف `C:\ngrok` إلى PATH

#### تشغيل ngrok:
**Windows:**
```bash
START_NGROK.bat
```

**أو يدوياً:**
```bash
ngrok http 3000
```

ستحصل على رابط مثل: `https://abcd1234.ngrok.io`

**ملاحظة**: يمكنك فتح http://localhost:4040 لرؤية ngrok web interface

### 6️⃣ إعداد Webhook في Meta Developer Console

#### إذا كنت تستخدم Render (الإنتاج):

1. اذهب إلى: https://developers.facebook.com/
2. WhatsApp > Configuration > Webhook
3. أدخل:
   - **Callback URL**: `https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook`
   - **Verify Token**: `12345` (يجب أن يطابق `META_VERIFY_TOKEN` في Render)
   - **Subscribe to**: `messages`
4. اضغط "Verify and Save"

#### إذا كنت تستخدم ngrok (التطوير المحلي):

1. شغّل ngrok: `ngrok http 3000`
2. انسخ رابط HTTPS من ngrok
3. في Meta Developer Console:
   - **Callback URL**: `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`
   - **Verify Token**: `12345`
   - **Subscribe to**: `messages`
4. اضغط "Verify and Save"

### 7️⃣ اختبار إرسال الرسائل

#### Windows:
```bash
TEST_SEND_MESSAGE.bat
```

#### أو يدوياً:
```bash
node test-send-message.js
```

#### أو باستخدام cURL:
```bash
curl -X POST http://localhost:3000/api/whatsapp/send -H "Content-Type: application/json" -d "{\"phoneNumber\": \"967773812563\", \"message\": \"رسالة اختبار\", \"type\": \"text\"}"
```

## ملاحظات

- تأكد من أن السيرفر يعمل قبل اختبار Webhook
- تأكد من أن ngrok يعمل قبل إعداد Webhook في Meta
- الرقم المستخدم للاختبار يجب أن يكون مسموحاً به في Meta Console

