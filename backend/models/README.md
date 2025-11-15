# Models Directory

## نظرة عامة / Overview

هذا المجلد يحتوي على database models للتفاعل مع قاعدة البيانات.

This directory contains database models for interacting with the database.

## الملفات / Files

### index.js
ملف التجميع الرئيسي الذي يصدر جميع models.

Main aggregation file that exports all models.

### user.model.js
Model للمستخدمين (`users` table):
- `createUser` - إنشاء مستخدم جديد
- `findUserById` - البحث عن مستخدم بالـ ID
- `findUserByEmail` - البحث عن مستخدم بالـ email
- `findUserByUsername` - البحث عن مستخدم بالـ username
- `updateUser` - تحديث مستخدم
- `deleteUser` - حذف مستخدم (soft delete)
- `getAllUsers` - الحصول على جميع المستخدمين مع pagination

### message.model.js
Model للرسائل (`messages` table):
- `createMessage` - إنشاء رسالة جديدة
- `findMessageById` - البحث عن رسالة بالـ ID
- `findMessageByWhatsAppId` - البحث عن رسالة بالـ WhatsApp ID
- `getMessagesByPhoneNumber` - الحصول على رسائل رقم معين
- `updateMessageStatus` - تحديث حالة الرسالة
- `getAllMessages` - الحصول على جميع الرسائل مع pagination و filters
- `deleteMessage` - حذف رسالة (soft delete)

## الهيكل / Structure

كل model يحتوي على:
- Schema documentation
- Database functions
- Error handling
- TODO comments للإرشاد
- Placeholder implementations

## الاستخدام / Usage

```javascript
const { User, Message } = require('./models');

// Example usage (when implemented)
const user = await User.findUserByEmail('user@example.com');
const messages = await Message.getMessagesByPhoneNumber('+1234567890');
```

## ملاحظات / Notes

- جميع functions حالياً تحتوي على placeholders
- يجب إعداد database connection في `config/database.js`
- يجب استخدام parameterized queries لمنع SQL injection
- يوصى باستخدام connection pooling














