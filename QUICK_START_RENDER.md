# 🚀 دليل البدء السريع - Render Deployment Quick Start

## 📋 نظرة عامة

هذا الدليل السريع يوضح الخطوات الأساسية لنشر المشروع على Render وربطه مع Meta WhatsApp Business API.

---

## ✅ الخطوة 1: ربط Frontend بالBackend

### تم التحديث ✅

- ✅ ملف `frontend/src/services/api.js` محدث ليدعم Render URL
- ✅ يستخدم `VITE_API_URL` environment variable
- ✅ Fallback إلى Render URL في Production

### ما تحتاج فعله:

1. **في Render Dashboard → Frontend Service → Environment Variables**:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   VITE_NODE_ENV=production
   ```

2. **استبدل `YOUR-BACKEND-URL`** برابط Backend الفعلي على Render

---

## ✅ الخطوة 2: نشر Frontend على Render

### الإعداد:

1. **Render Dashboard** → **New +** → **Static Site**
2. **ربط Repository** → اختر GitHub repo
3. **Branch**: `main` أو `feature/whatsapp-integration`
4. **Root Directory**: `frontend` (إذا كان في مجلد منفصل)

### Build Configuration:

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api`
  - `VITE_NODE_ENV=production`

### النشر:

1. اضغط **Create Static Site**
2. انتظر اكتمال البناء
3. احصل على الرابط: `https://YOUR-FRONTEND-URL.onrender.com`

---

## ✅ الخطوة 3: تحديث CORS في Backend

### في Render Dashboard → Backend Service → Environment Variables:

أضف/حدّث:
```
CORS_ORIGIN=https://YOUR-FRONTEND-URL.onrender.com
```

### إعادة تشغيل Backend:

1. Manual Deploy في Render
2. أو انتظر Auto-deploy

---

## ✅ الخطوة 4: ربط Webhook مع Meta

### Meta Developer Console:

1. اذهب إلى [Meta for Developers](https://developers.facebook.com)
2. اختر **WhatsApp Business App**
3. **WhatsApp** → **Configuration** → **Webhooks**

### Webhook Configuration:

- **Callback URL**: `https://YOUR-BACKEND-URL.onrender.com/api/whatsapp/webhook`
- **Verify Token**: `12345` (أو القيمة في Backend `.env`)
- **Subscribe to**:
  - ✅ `messages`
  - ✅ `message_status`

### التحقق:

1. اضغط **Verify and Save**
2. يجب أن يظهر ✅ Verified
3. Webhook Status: ✅ Subscribed

---

## 🧪 الخطوة 5: الاختبار

### اختبار Frontend:

1. افتح: `https://YOUR-FRONTEND-URL.onrender.com`
2. سجّل الدخول
3. تحقق من Console (F12) - لا توجد أخطاء CORS
4. تحقق من Network - Requests تذهب إلى Backend URL

### اختبار Webhook:

1. أرسل رسالة إلى WhatsApp Sandbox Number
2. تحقق من Render Logs
3. يجب أن ترى: ✅ Message received, ✅ Saved to database

### اختبار إرسال الرسائل:

1. من Frontend، أرسل رسالة
2. تحقق من أن الرسالة تُرسل عبر WhatsApp API
3. تحقق من أن الرسالة تظهر في المحادثة

---

## 📝 Checklist السريع

- [ ] Backend منشور على Render ويعمل
- [ ] Frontend منشور على Render ويعمل
- [ ] `VITE_API_URL` محدث في Frontend Environment Variables
- [ ] `CORS_ORIGIN` محدث في Backend Environment Variables
- [ ] Webhook مربوط في Meta Developer Console
- [ ] Webhook verified و subscribed
- [ ] يمكن تسجيل الدخول في Frontend
- [ ] يمكن استقبال الرسائل
- [ ] يمكن إرسال الرسائل

---

## 🔗 الملفات المرجعية

للمزيد من التفاصيل، راجع:

1. **`DEPLOYMENT_CHECKLIST.md`** - Checklist شامل
2. **`RENDER_SETUP_COMPLETE.md`** - دليل مفصل
3. **`frontend/RENDER_DEPLOYMENT.md`** - دليل نشر Frontend
4. **`backend/UPDATE_CORS_FOR_FRONTEND.md`** - إعداد CORS
5. **`backend/CORS_SETUP.md`** - إعداد CORS متقدم

---

## 🆘 المشاكل الشائعة

### CORS Errors:

**الحل**: تأكد من تحديث `CORS_ORIGIN` في Backend Environment Variables

### API Requests تفشل:

**الحل**: تحقق من `VITE_API_URL` في Frontend Environment Variables

### Webhook لا يعمل:

**الحل**: تحقق من Webhook URL و Verify Token في Meta Developer Console

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع Logs في Render Dashboard
2. راجع Browser Console
3. راجع Network Requests
4. راجع الملفات المرجعية أعلاه

---

**آخر تحديث / Last Updated**: 2025-01-17

**الحالة / Status**: ✅ جاهز للاستخدام / Ready to Use

