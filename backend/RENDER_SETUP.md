# دليل إعداد Render / Render Setup Guide

## 🌐 معلومات الاستضافة

**URL**: https://whatsapp-dashboard-encw.onrender.com

**Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook

---

## 📋 خطوات الإعداد على Render

### 1️⃣ إعداد Environment Variables في Render

في Render Dashboard، أضف المتغيرات التالية:

```env
NODE_ENV=production
PORT=10000

# Database
DATABASE_URL=your_database_url_here
POSTGRES_URL=your_postgres_url_here

# JWT
JWT_SECRET=your_production_jwt_secret_here
JWT_EXPIRES_IN=24h

# WhatsApp API
META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763

# Alternative WhatsApp Config (for backward compatibility)
WHATSAPP_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_WEBHOOK_SECRET=12345
WHATSAPP_PHONE_NUMBER_ID=898585676675763

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Botpress (if applicable)
BOTPRESS_URL=https://your-botpress-instance.com
BOTPRESS_API_KEY=your_botpress_api_key_here
```

### 2️⃣ إعداد Build Command

في Render Dashboard → Settings → Build Command:
```bash
cd backend && npm install
```

### 3️⃣ إعداد Start Command

في Render Dashboard → Settings → Start Command:
```bash
cd backend && npm start
```

أو:
```bash
cd backend && node server.js
```

### 4️⃣ إعداد Root Directory

في Render Dashboard → Settings → Root Directory:
```
backend
```

---

## 🔗 إعداد Webhook في Meta Developer Console

### الخطوات:

1. **الذهاب إلى Meta Developer Console**:
   - https://developers.facebook.com/
   - WhatsApp > Configuration

2. **إعداد Webhook**:
   - **Callback URL**: `https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook`
   - **Verify Token**: `12345` (قيمة `META_VERIFY_TOKEN` في Render)
   - **Subscribe to**: `messages`

3. **التحقق**:
   - اضغط "Verify and Save"
   - يجب أن يظهر ✅ إذا كان التحقق ناجحاً

---

## 🧪 اختبار الاستضافة

### 1. اختبار Health Check

```bash
curl https://whatsapp-dashboard-encw.onrender.com/health
```

**النتيجة المتوقعة**:
```json
{
  "status": "OK",
  "message": "WhatsApp Dashboard Backend is running",
  "timestamp": "2025-11-06T..."
}
```

### 2. اختبار Webhook Verification

```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

**النتيجة المتوقعة**: `TEST`

### 3. اختبار API Root

```bash
curl https://whatsapp-dashboard-encw.onrender.com/
```

**النتيجة المتوقعة**:
```json
{
  "message": "WhatsApp Dashboard Backend API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "api": "/api"
  }
}
```

### 4. اختبار إرسال الرسائل

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

## ⚙️ إعدادات Render الموصى بها

### Instance Type
- **Free Tier**: مناسب للاختبار والتطوير
- **Starter**: مناسب للإنتاج (موصى به)

### Auto-Deploy
- ✅ Enable auto-deploy from GitHub
- ✅ Deploy on every push to `main` branch

### Health Check Path
- Path: `/health`
- Interval: 30 seconds

### Environment
- **Node Version**: 18.x أو أحدث

---

## 🔒 الأمان

### 1. Environment Variables
- ✅ لا تضع أي secrets في الكود
- ✅ استخدم Environment Variables في Render
- ✅ استخدم JWT secrets قوية في الإنتاج

### 2. CORS
- ✅ قم بتحديث `CORS_ORIGIN` ليشمل فقط domain الـ frontend
- ✅ لا تستخدم `*` في الإنتاج

### 3. Rate Limiting
- ⚠️ فكر في إضافة rate limiting للـ endpoints
- ⚠️ خاصة endpoints العامة مثل `/api/whatsapp/webhook`

---

## 📊 Monitoring

### Render Logs
- يمكنك رؤية logs في Render Dashboard
- مفيد لـ debugging ومتابعة الأخطاء

### Health Checks
- Render يتحقق تلقائياً من `/health` endpoint
- إذا فشل Health Check، Render يعيد تشغيل الـ service

---

## 🔍 استكشاف الأخطاء

### المشكلة: Service لا يعمل
- ✅ تحقق من Build Command
- ✅ تحقق من Start Command
- ✅ تحقق من Environment Variables
- ✅ تحقق من Logs في Render Dashboard

### المشكلة: Webhook verification fails
- ✅ تأكد من تطابق `META_VERIFY_TOKEN` في Render مع Meta Console
- ✅ تأكد من أن Service يعمل
- ✅ تحقق من Logs في Render

### المشكلة: Cannot send messages
- ✅ تحقق من صلاحية `META_ACCESS_TOKEN`
- ✅ تأكد من صحة `WHATSAPP_PHONE_ID`
- ✅ تحقق من Logs للأخطاء من WhatsApp API

---

## 📝 Checklist

- [ ] Environment Variables مُعدة في Render
- [ ] Build Command صحيح
- [ ] Start Command صحيح
- [ ] Root Directory مُعد (backend)
- [ ] Health Check يعمل
- [ ] Webhook verification يعمل
- [ ] Webhook مُعد في Meta Developer Console
- [ ] تم اختبار إرسال الرسائل

---

## 🔗 الروابط المفيدة

- **Render Dashboard**: https://dashboard.render.com/
- **Meta Developer Console**: https://developers.facebook.com/
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp

---

## 💡 نصائح

1. **استخدم Environment Variables**: لا تضع secrets في الكود
2. **راقب Logs**: Render Dashboard يوفر logs مفصلة
3. **Health Checks**: تأكد من أن `/health` endpoint يعمل
4. **Auto-Deploy**: فعّل auto-deploy من GitHub لتحديثات تلقائية
5. **Backup**: احتفظ بنسخة من Environment Variables في مكان آمن




