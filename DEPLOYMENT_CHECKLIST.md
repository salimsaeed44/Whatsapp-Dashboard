# ✅ Checklist النشر الكامل - Complete Deployment Checklist

## 🎯 قبل البدء

- [ ] حساب على Render.com
- [ ] حساب على Meta for Developers
- [ ] WhatsApp Business API Account
- [ ] GitHub Repository مربوط

---

## 📦 الخطوة 1: نشر Backend على Render

### إعداد Backend Service

- [ ] إنشاء Web Service جديد في Render
- [ ] ربط GitHub Repository
- [ ] اختيار Branch: `main` أو `feature/whatsapp-integration`
- [ ] Root Directory: `backend`

### Environment Variables

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (أو أي port يحدده Render)
- [ ] `DB_HOST=...` (Database host)
- [ ] `DB_PORT=5432`
- [ ] `DB_NAME=whatsapp_db`
- [ ] `DB_USER=...`
- [ ] `DB_PASSWORD=...`
- [ ] `JWT_SECRET=...` (قيمة قوية)
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `WHATSAPP_PHONE_ID=...`
- [ ] `WHATSAPP_ACCESS_TOKEN=...`
- [ ] `WHATSAPP_WEBHOOK_SECRET=...`
- [ ] `CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com` (سيتم تحديثه لاحقاً)

### Build & Start Commands

- [ ] Build Command: `cd backend && npm install`
- [ ] Start Command: `cd backend && npm start`
- [ ] Root Directory: `backend`

### النشر

- [ ] Deploy Service
- [ ] انتظار اكتمال البناء
- [ ] التحقق من Health Check: `https://YOUR-BACKEND-URL.onrender.com/health`
- [ ] التحقق من API: `https://YOUR-BACKEND-URL.onrender.com/api`

---

## 🎨 الخطوة 2: نشر Frontend على Render

### إعداد Static Site

- [ ] إنشاء Static Site جديد في Render
- [ ] ربط GitHub Repository
- [ ] اختيار Branch: `main` أو `feature/whatsapp-integration`
- [ ] Root Directory: `frontend` (إذا كان في مجلد منفصل)

### Environment Variables

- [ ] `VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api`
- [ ] `VITE_NODE_ENV=production`

### Build Configuration

- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

### النشر

- [ ] Deploy Static Site
- [ ] انتظار اكتمال البناء
- [ ] الحصول على Frontend URL: `https://YOUR-FRONTEND-URL.onrender.com`

---

## 🔗 الخطوة 3: تحديث CORS في Backend

### تحديث Environment Variables

- [ ] تحديث `CORS_ORIGIN` في Backend Environment Variables:
  ```env
  CORS_ORIGIN=https://YOUR-FRONTEND-URL.onrender.com
  ```

### إعادة تشغيل Backend

- [ ] Manual Deploy في Render (أو انتظار Auto-deploy)
- [ ] التحقق من أن CORS يعمل (لا توجد أخطاء في Browser Console)

---

## 🔌 الخطوة 4: ربط Webhook مع Meta

### إعداد Webhook في Meta Developer Console

- [ ] الذهاب إلى [Meta for Developers](https://developers.facebook.com)
- [ ] اختيار WhatsApp Business App
- [ ] WhatsApp → Configuration → Webhooks

### Webhook Configuration

- [ ] Callback URL: `https://YOUR-BACKEND-URL.onrender.com/api/whatsapp/webhook`
- [ ] Verify Token: `12345` (أو القيمة في Backend)
- [ ] Subscribe to: `messages`
- [ ] Subscribe to: `message_status`

### التحقق من Webhook

- [ ] اضغط "Verify and Save"
- [ ] يجب أن يظهر ✅ Verified
- [ ] Webhook Status: ✅ Subscribed

---

## 🧪 الخطوة 5: الاختبار

### اختبار Backend

- [ ] Health Check: `https://YOUR-BACKEND-URL.onrender.com/health`
- [ ] API Info: `https://YOUR-BACKEND-URL.onrender.com/api`
- [ ] Webhook Verification: `https://YOUR-BACKEND-URL.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST`

### اختبار Frontend

- [ ] فتح Frontend URL: `https://YOUR-FRONTEND-URL.onrender.com`
- [ ] تسجيل الدخول
- [ ] التحقق من أن البيانات تظهر
- [ ] التحقق من Network Requests (تذهب إلى Backend URL الصحيح)
- [ ] التحقق من عدم وجود أخطاء CORS

### اختبار Webhook

- [ ] إرسال رسالة إلى WhatsApp Sandbox Number
- [ ] التحقق من Logs في Render Dashboard
- [ ] التحقق من أن الرسالة تُحفظ في Database
- [ ] التحقق من أن الرسالة تظهر في Frontend

### اختبار إرسال الرسائل

- [ ] من Frontend، إرسال رسالة
- [ ] التحقق من أن الرسالة تُرسل عبر WhatsApp API
- [ ] التحقق من أن الرسالة تظهر في المحادثة

---

## 📝 الخطوة 6: التوثيق

### تحديث الملفات

- [ ] تحديث `RENDER_CONFIG.md` بـ URLs الفعلية
- [ ] تحديث `frontend/.env.production` بـ Backend URL
- [ ] تحديث `backend/RENDER_CONFIG.md` بـ Frontend URL في CORS_ORIGIN

### حفظ الروابط

- [ ] Backend URL: `https://...`
- [ ] Frontend URL: `https://...`
- [ ] Webhook URL: `https://.../api/whatsapp/webhook`
- [ ] Meta Developer Console: `https://developers.facebook.com/...`

---

## ✅ التحقق النهائي

### Backend ✅

- [ ] Service يعمل على Render
- [ ] Health Check يعمل
- [ ] API endpoints تعمل
- [ ] Database متصل
- [ ] Webhook endpoint جاهز
- [ ] CORS مُعد بشكل صحيح

### Frontend ✅

- [ ] Static Site منشور على Render
- [ ] Build نجح
- [ ] API URL صحيح
- [ ] لا توجد أخطاء في Console
- [ ] البيانات تظهر بشكل صحيح
- [ ] تسجيل الدخول يعمل

### Meta WhatsApp ✅

- [ ] Webhook مربوط
- [ ] Webhook verified
- [ ] Webhook subscribed
- [ ] يمكن استقبال الرسائل
- [ ] يمكن إرسال الرسائل

### الاختبار ✅

- [ ] يمكن تسجيل الدخول
- [ ] يمكن عرض المحادثات
- [ ] يمكن إرسال الرسائل
- [ ] يمكن استقبال الرسائل
- [ ] البيانات تُحفظ في Database
- [ ] الإشعارات تعمل (إن وجدت)

---

## 🆘 حل المشاكل

### إذا فشل Backend Deploy

1. تحقق من Logs في Render Dashboard
2. تحقق من Environment Variables
3. تحقق من Build Command
4. تحقق من Start Command
5. تحقق من Database connection

### إذا فشل Frontend Deploy

1. تحقق من Logs في Render Dashboard
2. تحقق من Build Command
3. تحقق من Publish Directory
4. تحقق من Environment Variables
5. جرب البناء محلياً: `npm run build`

### إذا فشل Webhook Verification

1. تحقق من Webhook URL
2. تحقق من Verify Token
3. تحقق من Backend Logs
4. تحقق من أن Backend يستجيب لـ GET requests
5. جرب اختبار Webhook يدوياً

### إذا فشل CORS

1. تحقق من `CORS_ORIGIN` في Backend
2. تأكد من إضافة Frontend URL
3. أعد تشغيل Backend
4. تحقق من Browser Console
5. تحقق من Network Requests

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع Logs في Render Dashboard
2. راجع Browser Console
3. راجع Network Requests
4. راجع هذا Checklist
5. راجع ملفات التوثيق:
   - `RENDER_SETUP_COMPLETE.md`
   - `frontend/RENDER_DEPLOYMENT.md`
   - `backend/UPDATE_CORS_FOR_FRONTEND.md`

---

**آخر تحديث / Last Updated**: 2025-01-17

**الحالة / Status**: ✅ جاهز للاستخدام / Ready to Use

