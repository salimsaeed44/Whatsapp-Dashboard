# دليل النشر / Deployment Guide

## 🌐 الاستضافة الحالية

**Production URL**: https://whatsapp-dashboard-encw.onrender.com

**Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook

---

## 📋 إعداد Render

### Environment Variables المطلوبة في Render

أضف المتغيرات التالية في Render Dashboard → Environment:

```env
# Server
NODE_ENV=production
PORT=10000

# WhatsApp API
META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763

# JWT
JWT_SECRET=your_production_jwt_secret_here
JWT_EXPIRES_IN=24h

# Database (when ready)
DATABASE_URL=your_database_url_here

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build & Start Commands

**Build Command**:
```bash
cd backend && npm install
```

**Start Command**:
```bash
cd backend && npm start
```

**Root Directory**: `backend`

---

## 🔗 إعداد Webhook في Meta Developer Console

### استخدام Render URL (الإنتاج)

1. اذهب إلى: https://developers.facebook.com/
2. WhatsApp > Configuration > Webhook
3. أدخل:
   - **Callback URL**: `https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook`
   - **Verify Token**: `12345`
   - **Subscribe to**: `messages`
4. اضغط "Verify and Save"

### التحقق من Webhook

```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

يجب أن يعيد: `TEST`

---

## 🧪 اختبار الاستضافة

### اختبار Health Check
```bash
curl https://whatsapp-dashboard-encw.onrender.com/health
```

### اختبار Webhook
```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

### اختبار إرسال الرسائل
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
3. اختر Branch: `main` (أو الفرع المطلوب)
4. عند كل push إلى `main`، Render سيقوم بـ:
   - Pull آخر changes
   - Build المشروع
   - Restart الـ service

---

## 📊 Monitoring & Logs

### عرض Logs في Render
- اذهب إلى Render Dashboard
- اختر Service
- اضغط على "Logs"
- ستظهر جميع logs في الوقت الفعلي

### Health Checks
- Render يتحقق تلقائياً من `/health` endpoint
- إذا فشل، Render يعيد تشغيل الـ service

---

## 🔒 الأمان في الإنتاج

### 1. Environment Variables
- ✅ استخدم secrets قوية في الإنتاج
- ✅ لا تضع secrets في الكود
- ✅ استخدم Render Secrets Manager

### 2. CORS
- ✅ قم بتحديث `CORS_ORIGIN` ليشمل فقط frontend domain
- ✅ لا تستخدم `*` في الإنتاج

### 3. Authentication
- ✅ فعّل authentication على جميع endpoints المحمية
- ✅ استخدم JWT tokens آمنة

---

## 🔍 استكشاف الأخطاء

### Service لا يعمل
1. تحقق من Build Command
2. تحقق من Start Command
3. تحقق من Environment Variables
4. تحقق من Logs

### Webhook لا يعمل
1. تحقق من `META_VERIFY_TOKEN` في Render
2. تحقق من Webhook URL في Meta Console
3. تحقق من Logs في Render

### Cannot send messages
1. تحقق من `META_ACCESS_TOKEN`
2. تحقق من `WHATSAPP_PHONE_ID`
3. تحقق من Logs للأخطاء

---

## 📝 Checklist النشر

- [ ] Environment Variables مُعدة في Render
- [ ] Build Command صحيح
- [ ] Start Command صحيح
- [ ] Root Directory مُعد (`backend`)
- [ ] Health Check يعمل
- [ ] Webhook verification يعمل
- [ ] Webhook مُعد في Meta Console
- [ ] تم اختبار إرسال الرسائل
- [ ] Auto-Deploy مفعّل
- [ ] Logs تعمل

---

## 🔗 روابط مفيدة

- **Render Dashboard**: https://dashboard.render.com/
- **Production URL**: https://whatsapp-dashboard-encw.onrender.com
- **Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook
- **Meta Developer Console**: https://developers.facebook.com/




