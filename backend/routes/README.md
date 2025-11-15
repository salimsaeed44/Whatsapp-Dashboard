# Routes Directory

## نظرة عامة / Overview

هذا المجلد يحتوي على ملفات routes لتحديد endpoints الـ API.

This directory contains route files that define API endpoints.

## الملفات / Files

### index.js
ملف التجميع الرئيسي الذي يجمع جميع routes ويصدّرها.

Main aggregation file that combines all routes and exports them.

### auth.routes.js
Routes للمصادقة:
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `POST /api/auth/refresh-token` - تحديث token

### users.routes.js
Routes لإدارة المستخدمين:
- `GET /api/users` - الحصول على جميع المستخدمين
- `GET /api/users/:id` - الحصول على مستخدم محدد
- `PUT /api/users/:id` - تحديث مستخدم
- `DELETE /api/users/:id` - حذف مستخدم
- `GET /api/users/:id/profile` - الحصول على ملف المستخدم

### messages.routes.js
Routes لإدارة الرسائل:
- `GET /api/messages` - الحصول على جميع الرسائل
- `GET /api/messages/:id` - الحصول على رسالة محددة
- `POST /api/messages` - إرسال رسالة جديدة
- `PUT /api/messages/:id` - تحديث حالة الرسالة
- `DELETE /api/messages/:id` - حذف رسالة
- `GET /api/messages/conversation/:phoneNumber` - الحصول على محادثة

### whatsapp.routes.js
Routes لتكامل WhatsApp Cloud API:
- `GET /api/whatsapp/webhook` - التحقق من webhook
- `POST /api/whatsapp/webhook` - استقبال webhook events
- `POST /api/whatsapp/send` - إرسال رسالة عبر WhatsApp
- `GET /api/whatsapp/status/:messageId` - الحصول على حالة الرسالة

## الاستخدام / Usage

في `server.js`:
```javascript
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);
```

## ملاحظات / Notes

- جميع routes حالياً تحتوي على placeholders
- يجب إضافة middleware للمصادقة والتفويض
- يجب ربط routes بالـ controllers المقابلة














