# Controllers Directory

## نظرة عامة / Overview

هذا المجلد يحتوي على controllers التي تحتوي على business logic للـ API.

This directory contains controllers that contain the business logic for the API.

## الملفات / Files

### auth.controller.js
Controller للمصادقة:
- `register` - تسجيل مستخدم جديد
- `login` - تسجيل الدخول
- `logout` - تسجيل الخروج
- `refreshToken` - تحديث access token

### users.controller.js
Controller لإدارة المستخدمين:
- `getAllUsers` - الحصول على جميع المستخدمين
- `getUserById` - الحصول على مستخدم محدد
- `updateUser` - تحديث مستخدم
- `deleteUser` - حذف مستخدم
- `getUserProfile` - الحصول على ملف المستخدم

### messages.controller.js
Controller لإدارة الرسائل:
- `getAllMessages` - الحصول على جميع الرسائل
- `getMessageById` - الحصول على رسالة محددة
- `sendMessage` - إرسال رسالة جديدة
- `updateMessageStatus` - تحديث حالة الرسالة
- `deleteMessage` - حذف رسالة
- `getConversation` - الحصول على محادثة

### whatsapp.controller.js
Controller لتكامل WhatsApp Cloud API:
- `verifyWebhook` - التحقق من webhook من Meta
- `handleWebhook` - معالجة webhook events
- `sendWhatsAppMessage` - إرسال رسالة عبر WhatsApp Cloud API
- `getMessageStatus` - الحصول على حالة الرسالة

## الهيكل / Structure

كل controller يحتوي على:
- Functions للعمليات المختلفة
- Error handling
- TODO comments للإرشاد
- Placeholder implementations

## ملاحظات / Notes

- جميع functions حالياً تحتوي على placeholders
- يجب ربط controllers بالـ models المقابلة
- يجب إضافة validation للبيانات الواردة
- يجب إضافة proper error handling














