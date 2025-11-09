# إعداد Webhook على Render / Render Webhook Setup

## 🌐 معلومات الاستضافة

**Production URL**: https://whatsapp-dashboard-encw.onrender.com

**Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook

---

## ✅ الخطوات السريعة

### 1️⃣ التأكد من Environment Variables في Render

في Render Dashboard → Environment Variables، تأكد من وجود:

```env
META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763
PORT=10000
NODE_ENV=production
```

### 2️⃣ إعداد Webhook في Meta Developer Console

1. اذهب إلى: https://developers.facebook.com/
2. اختر تطبيقك WhatsApp
3. اذهب إلى **WhatsApp** → **Configuration**
4. في قسم **Webhook**، اضغط **Edit**
5. أدخل:
   - **Callback URL**: `https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook`
   - **Verify Token**: `12345`
6. اضغط **Verify and Save**
7. بعد التحقق الناجح، اختر **Subscribe to field**: `messages`
8. اضغط **Save**

### 3️⃣ اختبار Webhook

#### اختبار التحقق:
```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

**يجب أن يعيد**: `TEST`

#### اختبار Health Check:
```bash
curl https://whatsapp-dashboard-encw.onrender.com/health
```

---

## 🔍 التحقق من الإعداد

### 1. تحقق من أن Service يعمل
- ✅ افتح: https://whatsapp-dashboard-encw.onrender.com/
- ✅ يجب أن ترى: `{"message":"WhatsApp Dashboard Backend API",...}`

### 2. تحقق من Webhook
- ✅ افتح: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST
- ✅ يجب أن ترى: `TEST`

### 3. تحقق من Meta Console
- ✅ اذهب إلى Meta Developer Console
- ✅ تحقق من أن Webhook Status: ✅ **Subscribed**

---

## 📝 ملاحظات مهمة

### Environment Variables في Render
- تأكد من أن جميع المتغيرات موجودة
- تأكد من أن القيم صحيحة
- بعد تغيير Environment Variables، Render سيعيد تشغيل Service تلقائياً

### Webhook URL
- يجب أن يكون رابط HTTPS (Render يوفر HTTPS تلقائياً)
- يجب أن ينتهي بـ `/api/whatsapp/webhook`
- لا يجب أن يحتوي على trailing slash

### Verify Token
- يجب أن يطابق `META_VERIFY_TOKEN` في Render
- حالياً: `12345`
- يمكنك تغييره لكن يجب أن يطابق في Meta Console

---

## 🧪 اختبار كامل

### 1. اختبار Health Check
```bash
curl https://whatsapp-dashboard-encw.onrender.com/health
```

### 2. اختبار Webhook Verification
```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

### 3. اختبار إرسال الرسائل
```bash
curl -X POST https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "967773812563",
    "message": "رسالة اختبار من Render",
    "type": "text"
  }'
```

---

## 🔄 Auto-Deploy من GitHub

### إعداد Auto-Deploy في Render

1. في Render Dashboard → Settings
2. Enable **Auto-Deploy**
3. اختر Branch: `main`
4. عند كل push إلى `main`:
   - Render سيقوم بـ Pull
   - Build المشروع
   - Restart Service

---

## 📊 Monitoring

### عرض Logs
- Render Dashboard → Service → Logs
- يمكنك رؤية جميع logs في الوقت الفعلي
- مفيد لـ debugging ومتابعة Webhook events

### Health Checks
- Render يتحقق تلقائياً من `/health`
- إذا فشل، Render يعيد تشغيل Service

---

## 🔒 الأمان

### Environment Variables
- ✅ لا تضع secrets في الكود
- ✅ استخدم Render Environment Variables
- ✅ استخدم JWT secrets قوية في الإنتاج

### CORS
- ✅ حدّث `CORS_ORIGIN` ليشمل فقط frontend domain
- ✅ لا تستخدم `*` في الإنتاج

---

## 🎯 Checklist

- [ ] Environment Variables مُعدة في Render
- [ ] Service يعمل على Render
- [ ] Health Check يعمل
- [ ] Webhook verification يعمل
- [ ] Webhook مُعد في Meta Developer Console
- [ ] Webhook Status: ✅ Subscribed
- [ ] تم اختبار إرسال الرسائل
- [ ] Auto-Deploy مفعّل (اختياري)

---

## 🔗 الروابط

- **Render Dashboard**: https://dashboard.render.com/
- **Production URL**: https://whatsapp-dashboard-encw.onrender.com
- **Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook
- **Meta Developer Console**: https://developers.facebook.com/




