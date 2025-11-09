# 🚀 دليل إكمال الإعداد على Render - Complete Render Setup Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إكمال ربط Frontend و Backend على Render وربطهما مع Meta WhatsApp Business API.

---

## ✅ الخطوة 1: ربط Frontend بالBackend على Render

### 1.1 تحديث API URL في Frontend

تم تحديث ملف `frontend/src/services/api.js` ليدعم:
- ✅ Environment variables (`VITE_API_URL`)
- ✅ Production URL (Render Backend)
- ✅ Development URL (localhost)

### 1.2 ملفات تم إنشاؤها

- ✅ `frontend/.env.example` - مثال على متغيرات البيئة
- ✅ `frontend/.env.production` - متغيرات البيئة للإنتاج
- ✅ `frontend/render.yaml` - إعدادات Render
- ✅ `frontend/RENDER_DEPLOYMENT.md` - دليل النشر المفصل

### 1.3 الخطوات المطلوبة

1. **استبدل Backend URL** في `frontend/.env.production`:
   ```env
   VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```

2. **في Render Dashboard** → Frontend Service → Environment Variables:
   - أضف `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
   - أضف `VITE_NODE_ENV` = `production`

---

## ✅ الخطوة 2: نشر Frontend على Render

### 2.1 إنشاء Static Site

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط **New +** → **Static Site**
3. اربط المستودع (Repository)
4. اختر الفرع: `main` أو `feature/whatsapp-integration`

### 2.2 إعداد Build

**Name**: `whatsapp-dashboard-frontend`

**Branch**: `main`

**Root Directory**: `frontend` (إذا كان Frontend في مجلد منفصل)

**Build Command**:
```bash
npm install && npm run build
```

**Publish Directory**:
```
dist
```

### 2.3 Environment Variables

أضف في Render:
- `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
- `VITE_NODE_ENV` = `production`

### 2.4 النشر

1. اضغط **Create Static Site**
2. انتظر اكتمال البناء
3. احصل على الرابط: `https://whatsapp-dashboard-frontend.onrender.com`

---

## ✅ الخطوة 3: ربط Webhook مع Meta

### 3.1 إعداد Webhook في Meta Developer Console

1. اذهب إلى [Meta for Developers](https://developers.facebook.com)
2. اختر تطبيق WhatsApp Business
3. اذهب إلى **WhatsApp** → **Configuration** → **Webhooks**

### 3.2 إعداد Webhook URL

**Webhook URL**:
```
https://YOUR-BACKEND-URL.onrender.com/api/whatsapp/webhook
```

**Verify Token**: 
```
12345
```
(أو أي token موجود في Backend `.env`)

### 3.3 Webhook Fields

اختر الحقول المطلوبة:
- ✅ `messages` - للرسائل الواردة
- ✅ `message_status` - لحالة الرسائل

### 3.4 التحقق من Webhook

1. اضغط **Verify and Save**
2. Meta سترسل طلب GET للتحقق
3. Backend يجب أن يرد بـ 200 OK مع `hub.challenge`

---

## ✅ الخطوة 4: اختبار الربط الكامل

### 4.1 اختبار Frontend

1. افتح Frontend URL: `https://whatsapp-dashboard-frontend.onrender.com`
2. سجّل الدخول
3. تحقق من أن البيانات تصل من Backend:
   - افتح Developer Tools (F12)
   - اذهب إلى Network
   - تحقق من أن Requests تذهب إلى Backend URL

### 4.2 اختبار Webhook

1. أرسل رسالة إلى رقم WhatsApp Sandbox
2. تحقق من Logs في Render Dashboard (Backend Service)
3. يجب أن ترى:
   - ✅ Webhook request received
   - ✅ Message saved to database
   - ✅ Conversation created/updated

### 4.3 اختبار إرسال الرسائل

1. من Frontend، حاول إرسال رسالة
2. تحقق من أن الرسالة تُرسل عبر WhatsApp API
3. تحقق من أن الرسالة تظهر في المحادثة

---

## 🔧 تحديث Backend CORS

### تحديث CORS_ORIGIN في Backend

في Backend `.env` على Render، أضف/حدّث:

```env
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com
```

أو لعدة domains:

```env
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com,http://localhost:5173
```

**ملاحظة**: بعد تحديث `.env`، يجب إعادة تشغيل Backend Service في Render.

---

## 📝 Checklist النهائي

قبل اعتبار الإعداد مكتملاً، تأكد من:

### Backend ✅
- [ ] Backend منشور على Render ويعمل
- [ ] Health check يعمل: `https://YOUR-BACKEND-URL.onrender.com/health`
- [ ] API endpoints تعمل
- [ ] Database متصل ويعمل
- [ ] CORS_ORIGIN محدث في `.env`
- [ ] Webhook endpoint جاهز: `/api/whatsapp/webhook`

### Frontend ✅
- [ ] Frontend منشور على Render ويعمل
- [ ] `VITE_API_URL` محدث في Environment Variables
- [ ] API requests تذهب إلى Backend URL الصحيح
- [ ] لا توجد أخطاء CORS
- [ ] تسجيل الدخول يعمل
- [ ] البيانات تظهر في Frontend

### Meta WhatsApp ✅
- [ ] Webhook مربوط في Meta Developer Console
- [ ] Verify Token صحيح
- [ ] Webhook Fields محددة (messages, message_status)
- [ ] Webhook verified (حالة verified)

### الاختبار ✅
- [ ] يمكن إرسال رسائل من Frontend
- [ ] يمكن استقبال رسائل من WhatsApp
- [ ] الرسائل تُحفظ في Database
- [ ] المحادثات تظهر في Frontend
- [ ] الإشعارات تعمل

---

## 🆘 حل المشاكل

### المشكلة: CORS Errors

**الحل**:
1. تحقق من `CORS_ORIGIN` في Backend `.env`
2. أضف Frontend URL إلى `CORS_ORIGIN`
3. أعد تشغيل Backend Service

### المشكلة: Webhook لا يعمل

**الحل**:
1. تحقق من Webhook URL في Meta Developer Console
2. تحقق من Verify Token
3. تحقق من Logs في Render Dashboard
4. تأكد من أن Backend يستجيب لـ GET request من Meta

### المشكلة: API Requests تفشل

**الحل**:
1. تحقق من `VITE_API_URL` في Frontend Environment Variables
2. تحقق من أن Backend URL صحيح
3. تحقق من Network tab في Browser Console
4. تحقق من أن Backend يعمل (Health check)

### المشكلة: الرسائل لا تظهر

**الحل**:
1. تحقق من Database connection
2. تحقق من Logs في Backend
3. تحقق من أن Webhook يستقبل الرسائل
4. تحقق من أن Messages تُحفظ في Database

---

## 📞 الخطوات التالية

بعد إكمال الإعداد:

1. ✅ اختبر جميع الميزات
2. ✅ تحقق من Logs بانتظام
3. ✅ راقب الأداء
4. ✅ أضف Monitoring (اختياري)
5. ✅ أضف Error Tracking (اختياري)

---

## 🎯 روابط مفيدة

- [Render Dashboard](https://dashboard.render.com)
- [Meta for Developers](https://developers.facebook.com)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Render Documentation](https://render.com/docs)

---

**آخر تحديث / Last Updated**: 2025-01-17

**الحالة / Status**: ✅ جاهز للنشر / Ready for Deployment

