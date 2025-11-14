# دليل البدء السريع / Quick Start Guide

## اختبار WhatsApp Integration

### الخطوة 1: التحقق من ملف .env

تأكد من وجود ملف `.env` في مجلد `backend/` مع القيم التالية:

```env
META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763
PORT=3000
```

### الخطوة 2: تثبيت Dependencies

```bash
cd backend
npm install
```

### الخطوة 3: تشغيل السيرفر

```bash
# Development mode (with auto-reload)
npm run dev

# أو Production mode
node server.js
```

يجب أن ترى:
```
🚀 Server is running on port 3000
📍 Environment: development
🔗 Health check: http://localhost:3000/health
```

### الخطوة 4: اختبار Webhook Verification محلياً

افتح terminal جديد واختبار:

```bash
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST_CHALLENGE"
```

يجب أن يعيد: `TEST_CHALLENGE`

### الخطوة 5: إعداد Webhook في Meta Developer Console

1. **استخدم ngrok للعمل المحلي**:
   ```bash
   ngrok http 3000
   ```
   سيعطيك رابط مثل: `https://abc123.ngrok.io`

2. **في Meta Developer Console**:
   - اذهب إلى WhatsApp > Configuration
   - اضغط "Edit" بجانب Webhook
   - Callback URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
   - Verify Token: `12345`
   - Subscribe to: `messages`, `message_status`
   - اضغط "Verify and Save"

### الخطوة 6: اختبار إرسال الرسائل

#### استخدام Test Script:

```bash
node test-send-message.js
```

#### أو استخدام cURL:

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "967773812563",
    "message": "رسالة اختبار من النظام - سالم سعيد",
    "type": "text"
  }'
```

**ملاحظة**: endpoint `/api/whatsapp/send` يتطلب authentication. يمكنك تعطيله مؤقتاً للاختبار أو استخدام JWT token.

### الخطوة 7: مراقبة الأحداث

راقب التيرمينال لرؤية:
- ✅ Webhook verification messages
- 📨 Incoming messages
- 📊 Status updates
- ❌ Errors

---

## استكشاف الأخطاء

### Webhook verification fails
- تأكد من تطابق `META_VERIFY_TOKEN` في `.env` مع Meta Console
- تأكد من أن السيرفر يعمل

### Cannot send messages
- تحقق من صلاحية `META_ACCESS_TOKEN`
- تأكد من صحة `WHATSAPP_PHONE_ID`
- تأكد من أن الرقم المستخدم مسموح به في Meta Console

### Webhook not receiving events
- تأكد من أن ngrok يعمل
- تحقق من Webhook URL في Meta Console
- تأكد من الاشتراك في events المطلوبة









