# دليل الاختبار / Testing Guide

## اختبار WhatsApp Integration

### 1️⃣ التحقق من البيئة

تأكد من وجود ملف `.env` في مجلد `backend/` مع القيم التالية:

```env
META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763
```

### 2️⃣ تثبيت Dependencies

```bash
cd backend
npm install
```

### 3️⃣ اختبار Webhook Verification

#### الطريقة 1: استخدام Test Server

```bash
node test-webhook.js
```

ثم في terminal آخر:

```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST_CHALLENGE"
```

يجب أن يعيد `TEST_CHALLENGE` إذا كان التحقق ناجحاً.

#### الطريقة 2: استخدام Server الرئيسي

```bash
node server.js
```

ثم اختبار Webhook بنفس الطريقة.

### 4️⃣ إعداد Webhook في Meta Developer Console

1. افتح [Meta Developer Console](https://developers.facebook.com/)
2. اذهب إلى WhatsApp > Configuration
3. اضغط على "Edit" بجانب Webhook
4. أدخل:
   - **Callback URL**: `https://your-domain.com/api/whatsapp/webhook`
     - إذا كنت تعمل محلياً، استخدم ngrok:
       ```bash
       ngrok http 3000
       ```
     - ثم استخدم الرابط الذي يعطيه ngrok
   - **Verify Token**: `12345` (قيمة META_VERIFY_TOKEN)
5. Subscribe to events:
   - ✅ `messages`
   - ✅ `message_status`
6. اضغط "Verify and Save"

### 5️⃣ اختبار إرسال الرسائل

#### الطريقة 1: استخدام Test Script

```bash
node test-send-message.js
```

#### الطريقة 2: استخدام cURL

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phoneNumber": "967773812563",
    "message": "رسالة اختبار من النظام",
    "type": "text"
  }'
```

#### الطريقة 3: استخدام Postman

1. Method: POST
2. URL: `http://localhost:3000/api/whatsapp/send`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body (JSON):
```json
{
  "phoneNumber": "967773812563",
  "message": "رسالة اختبار من النظام - سالم سعيد",
  "type": "text"
}
```

### 6️⃣ مراقبة Logs

راقب التيرمينال لرؤية:
- ✅ رسائل النجاح
- ❌ رسائل الأخطاء
- 📨 الرسائل الواردة من WhatsApp

### 7️⃣ استكشاف الأخطاء

#### مشكلة: Webhook verification fails
- تأكد من أن `META_VERIFY_TOKEN` في `.env` يطابق Token في Meta Console
- تأكد من أن السيرفر يعمل ويمكن الوصول إليه

#### مشكلة: Cannot send messages
- تأكد من أن `META_ACCESS_TOKEN` صحيح وليس منتهي الصلاحية
- تأكد من أن `WHATSAPP_PHONE_ID` صحيح
- تحقق من صلاحيات Access Token

#### مشكلة: Webhook not receiving events
- تأكد من أن Webhook URL متاح من الإنترنت (استخدم ngrok محلياً)
- تأكد من أنك مشترك في events المطلوبة
- تحقق من logs السيرفر

### 8️⃣ استخدام ngrok للعمل المحلي

```bash
# تثبيت ngrok (إذا لم يكن مثبتاً)
# Windows: choco install ngrok
# أو حمّل من https://ngrok.com/

# تشغيل ngrok
ngrok http 3000

# استخدم الرابط HTTPS الذي يعطيه ngrok في Meta Console
# مثال: https://abc123.ngrok.io/api/whatsapp/webhook
```

### 9️⃣ نصائح إضافية

- تأكد من أن رقم الهاتف المستخدم للاختبار مسموح به في Meta Developer Console
- في مرحلة التطوير، يمكنك إرسال رسائل فقط للأرقام المضافة في Meta Console
- استخدم رقم اختبار حقيقي لتجربة الاستقبال والإرسال






