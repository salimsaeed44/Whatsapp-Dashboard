# إعداد Webhook في Meta Developer Console
# Meta Developer Console Webhook Setup

## 🔗 معلومات Webhook

**Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook

**Verify Token**: `12345`

**Subscribe to**: `messages`

---

## 📋 الخطوات التفصيلية

### 1️⃣ الذهاب إلى Meta Developer Console

1. افتح: https://developers.facebook.com/
2. سجّل الدخول بحسابك
3. اختر التطبيق WhatsApp الخاص بك

### 2️⃣ إعداد Webhook

1. اذهب إلى **WhatsApp** → **Configuration**
2. في قسم **Webhook**، اضغط على **Edit** أو **Add Callback URL**
3. أدخل:
   - **Callback URL**: `https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook`
   - **Verify Token**: `12345`
4. اضغط **Verify and Save**

### 3️⃣ الاشتراك في Events

بعد التحقق الناجح:
1. اختر **Subscribe to field**
2. اختر: `messages`
3. اضغط **Save**

---

## ✅ التحقق من الإعداد

### 1. تحقق من Webhook Status
- يجب أن يظهر: ✅ **Subscribed**
- يجب أن يكون Status: **Active**

### 2. اختبار Webhook
```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

**النتيجة المتوقعة**: `TEST`

### 3. اختبار استقبال الرسائل
- أرسل رسالة إلى رقم WhatsApp المرتبط
- تحقق من Logs في Render Dashboard
- يجب أن ترى log للرسالة الواردة

---

## 🔍 استكشاف الأخطاء

### Webhook verification fails
- ✅ تأكد من أن `META_VERIFY_TOKEN` في Render يطابق Verify Token في Meta Console
- ✅ تأكد من أن Service يعمل على Render
- ✅ تحقق من Logs في Render Dashboard

### Webhook not receiving events
- ✅ تأكد من أن Webhook Status: ✅ Subscribed
- ✅ تأكد من الاشتراك في `messages`
- ✅ تحقق من Logs في Render Dashboard

---

## 📝 ملاحظات

1. **Verify Token**: يجب أن يطابق `META_VERIFY_TOKEN` في Render Environment Variables
2. **Webhook URL**: يجب أن يكون رابط HTTPS صحيح
3. **Events**: حالياً نستخدم `messages` فقط

---

## 🔗 روابط مفيدة

- **Meta Developer Console**: https://developers.facebook.com/
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp
- **Render Dashboard**: https://dashboard.render.com/




