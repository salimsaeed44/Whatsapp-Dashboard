# 🚀 دليل النشر على Render - Frontend Deployment Guide

## 📋 المتطلبات / Requirements

1. حساب على [Render.com](https://render.com)
2. مشروع Frontend جاهز للبناء
3. Backend منشور على Render (للحصول على URL)

---

## 🎯 الخطوة 1: إعداد متغيرات البيئة

### 1.1 إنشاء ملف `.env.production`

في مجلد `frontend/`، أنشئ ملف `.env.production`:

```env
VITE_API_URL=https://whatsapp-dashboard-encw.onrender.com/api
VITE_NODE_ENV=production
```

**ملاحظة**: استبدل `whatsapp-dashboard-encw.onrender.com` برابط Backend الفعلي على Render.

### 1.2 التحقق من ملف `api.js`

تأكد من أن ملف `frontend/src/services/api.js` يستخدم متغير البيئة:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://whatsapp-dashboard-encw.onrender.com/api' 
    : 'http://localhost:3000/api');
```

---

## 🎯 الخطوة 2: النشر على Render

### 2.1 إنشاء Static Site جديد

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اضغط على **New +** → **Static Site**
3. اربط المستودع (Repository) الخاص بك
4. اختر الفرع (Branch): `main` أو `feature/whatsapp-integration`

### 2.2 إعداد Build Configuration

**Name**: `whatsapp-dashboard-frontend`

**Branch**: `main` (أو الفرع الذي تريد نشره)

**Root Directory**: `frontend` (إذا كان Frontend في مجلد منفصل)

**Build Command**:
```bash
npm install && npm run build
```

**Publish Directory**:
```
dist
```

### 2.3 إعداد Environment Variables

في قسم **Environment Variables**، أضف:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://whatsapp-dashboard-encw.onrender.com/api` |
| `VITE_NODE_ENV` | `production` |

**ملاحظة**: استبدل `whatsapp-dashboard-encw.onrender.com` برابط Backend الفعلي.

### 2.4 النشر

1. اضغط على **Create Static Site**
2. انتظر حتى يكتمل البناء (Build)
3. بعد اكتمال البناء، ستحصل على رابط مثل: `https://whatsapp-dashboard-frontend.onrender.com`

---

## 🎯 الخطوة 3: التحقق من النشر

### 3.1 فتح الرابط

افتح الرابط الذي حصلت عليه من Render في المتصفح.

### 3.2 اختبار الاتصال بالـ Backend

1. افتح Developer Tools (F12)
2. اذهب إلى Console
3. حاول تسجيل الدخول
4. تحقق من أن الطلبات (Requests) تُرسل إلى Backend URL الصحيح

### 3.3 التحقق من Network Requests

في Developer Tools → Network:
- تأكد من أن جميع API requests تذهب إلى `https://whatsapp-dashboard-encw.onrender.com/api`
- تأكد من عدم وجود أخطاء CORS

---

## 🔧 حل المشاكل الشائعة

### المشكلة: CORS Errors

**الحل**:
1. تأكد من أن Backend على Render يدعم CORS
2. تحقق من `CORS_ORIGIN` في Backend `.env`:
   ```env
   CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com
   ```

### المشكلة: API URL غير صحيح

**الحل**:
1. تحقق من `VITE_API_URL` في Render Environment Variables
2. تأكد من أن الرابط يبدأ بـ `https://` وليس `http://`
3. تأكد من أن الرابط ينتهي بـ `/api`

### المشكلة: Build فشل

**الحل**:
1. تحقق من Console في Render Dashboard
2. تأكد من أن جميع Dependencies مثبتة
3. تأكد من أن `package.json` يحتوي على `build` script
4. تحقق من أن `vite.config.js` صحيح

### المشكلة: الصفحة فارغة بعد النشر

**الحل**:
1. تحقق من `Publish Directory` - يجب أن يكون `dist`
2. تأكد من أن Build نجح
3. تحقق من Console في المتصفح للأخطاء

---

## 📝 ملاحظات مهمة

### 1. Environment Variables

- في Vite، جميع متغيرات البيئة يجب أن تبدأ بـ `VITE_`
- متغيرات البيئة تُقرأ فقط أثناء البناء (Build time)
- بعد تغيير متغيرات البيئة، يجب إعادة البناء

### 2. API URL

- تأكد من استخدام `https://` في Production
- تأكد من أن Backend URL صحيح ومنشور على Render
- تأكد من أن Backend يعمل قبل نشر Frontend

### 3. CORS

- تأكد من أن Backend يدعم CORS للـ Frontend URL
- أضف Frontend URL إلى `CORS_ORIGIN` في Backend

### 4. Build Optimization

- Vite يقوم بتحسين البناء تلقائياً
- حجم الملفات بعد البناء يجب أن يكون صغيراً
- استخدم `npm run build` محلياً للتحقق من البناء

---

## 🎯 الخطوة 4: ربط Webhook مع Meta

بعد نشر Frontend و Backend:

### 4.1 افتح Meta Developer Console

1. اذهب إلى [Meta for Developers](https://developers.facebook.com)
2. اختر تطبيق WhatsApp Business
3. اذهب إلى **WhatsApp** → **Configuration** → **Webhooks**

### 4.2 إعداد Webhook

**Webhook URL**:
```
https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook
```

**Verify Token**: 
```
12345
```
(أو أي token اخترته في Backend)

**Webhook Fields**: اختر:
- `messages`
- `message_status`

### 4.3 التحقق من Webhook

1. اضغط على **Verify and Save**
2. Meta سترسل طلب GET للتحقق من Webhook
3. Backend يجب أن يرد بـ 200 OK

---

## 🧪 اختبار الربط الكامل

### 1. اختبار Frontend

1. افتح Frontend URL على Render
2. سجّل الدخول
3. تحقق من أن البيانات تصل من Backend

### 2. اختبار Webhook

1. أرسل رسالة إلى رقم WhatsApp Sandbox
2. تحقق من Logs في Render Dashboard
3. تحقق من أن الرسالة تظهر في Frontend

### 3. اختبار إرسال الرسائل

1. من Frontend، حاول إرسال رسالة
2. تحقق من أن الرسالة تُرسل عبر WhatsApp API
3. تحقق من أن الرسالة تظهر في المحادثة

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من Render Logs
2. تحقق من Browser Console
3. تحقق من Network Requests
4. راجع هذا الدليل مرة أخرى

---

**آخر تحديث / Last Updated**: 2025-01-17

