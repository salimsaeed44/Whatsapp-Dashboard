# WhatsApp Dashboard Backend

## نظرة عامة / Overview

Backend API للمنصة لإدارة رسائل WhatsApp Business Cloud API.

Backend API for WhatsApp Business Cloud API Dashboard management platform.

## Tech Stack

- **Node.js**: 18+
- **Express**: 4.18.2
- **PostgreSQL**: 15
- **JWT**: Authentication
- **pg**: PostgreSQL client

## الهيكل / Structure

```
backend/
├── controllers/     # Business logic
├── models/         # Database models
├── routes/         # API routes
├── migrations/     # Database migrations
├── server.js       # Entry point
├── package.json    # Dependencies
└── .env.example    # Environment variables template
```

## التثبيت / Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## التشغيل / Running

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## Environment Variables

راجع `.env.example` للقائمة الكاملة للمتغيرات المطلوبة.

See `.env.example` for the complete list of required variables.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get message by ID
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Update message status

### WhatsApp
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - Webhook handler
- `POST /api/whatsapp/send` - Send WhatsApp message

## Database Setup

```bash
# Run migrations
psql -U postgres -d whatsapp_db -f migrations/001_create_users_table.sql
psql -U postgres -d whatsapp_db -f migrations/002_create_messages_table.sql
```

## حالة المشروع / Project Status

**الحالة الحالية**: في مرحلة التطوير الأولي (Initial Development Phase)

**ملاحظة**: جميع endpoints حالياً تحتوي على placeholders وتحتاج إلى implementation.

## التطوير / Development

- جميع الملفات تحتوي على TODO comments للإرشاد
- اتبع الـ structure الموجود
- أضف tests عند تطوير features جديدة

