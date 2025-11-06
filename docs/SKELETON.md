# Project Skeleton - WhatsApp Business Cloud API Dashboard

## نظرة عامة / Overview

هذا المستند يحدد الهيكل الأساسي للمشروع وهو مصدر الحقيقة الوحيد (Single Source of Truth) لهيكلية المشروع.

This document defines the project's fundamental structure and serves as the single source of truth for the project architecture.

---

## الهدف من المشروع / Project Goal

منصة إدارة رسائل WhatsApp Business Cloud API للبوت. البوت مربوط على Botpress، ورقم واتساب متصل عبر Meta Cloud API. المدير يمتلك صلاحيات كاملة لإدارة النظام.

WhatsApp Business Cloud API Dashboard for bot management. The bot is connected to Botpress, and the WhatsApp number is connected via Meta Cloud API. The administrator has full permissions to manage the system.

---

## Tech Stack

### Frontend
- **React**: 18
- **Vite**: 5
- **TailwindCSS**: 3

### Backend
- **Node.js**: 18
- **Express**: Latest stable

### Database
- **PostgreSQL**: 15

### Authentication
- **JWT**: JSON Web Tokens

### Integration
- **Botpress**: Bot platform integration
- **Meta Cloud API**: WhatsApp Business API

---

## هيكل المجلدات / Directory Structure

```
.
├── docs/                    # Documentation
│   ├── SKELETON.md         # This file (Source of Truth)
│   └── README.md           # Documentation guide
├── frontend/                # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js backend application
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   └── server.js
├── logs/                    # Application logs
│   └── LOG.md              # Log entries
├── docker-compose.yml       # Docker services configuration
├── .env.example            # Environment variables template
└── README.md               # Project main README
```

---

## الصلاحيات والأدوار / Permissions & Roles

### المدير / Administrator
- صلاحيات كاملة على النظام
- إدارة المستخدمين
- إدارة البوت والاتصالات
- الوصول الكامل إلى جميع الميزات

### المستخدمين الآخرين
- سيتم تحديدها لاحقاً حسب متطلبات المشروع

---

## الاتصالات والتكامل / Integrations

### Botpress
- البوت مربوط على منصة Botpress
- الاتصال يتم عبر API

### Meta Cloud API
- رقم واتساب متصل عبر Meta Cloud API
- استخدام Access Token للاتصال
- Webhook للاستقبال

---

## ملاحظات مهمة / Important Notes

1. **مصدر الحقيقة الوحيد**: هذا الملف (SKELETON.md) هو المصدر الوحيد للحقيقة لهيكلية المشروع.
2. **التعديلات**: أي تعديلات على هذا الملف يجب أن تتم عبر تقارير رسمية وبتوقيع المدير/CTO.
3. **الأمان**: لا يتم تخزين أي أسرار أو مفاتيح حقيقية في المستودع. استخدام .env.example فقط.
4. **الإصدارات**: الإصدارات المحددة في Tech Stack يجب الالتزام بها بدقة.

---

## تاريخ التحديثات / Update History

- **2024-01-XX**: إنشاء الهيكلية الأساسية
  - إضافة Botpress integration
  - إضافة Meta Cloud API integration
  - تحديد صلاحيات المدير

---

## حالة المشروع / Project Status

**الحالة الحالية**: في مرحلة التهيئة (Initialization Phase)

**المرحلة التالية**: تطوير البنية التحتية الأساسية

