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
├── config/         # Configuration files (JWT, etc.)
├── controllers/    # Business logic
├── middleware/     # Authentication & Authorization middleware
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

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user and get JWT tokens
- `POST /api/auth/refresh-token` - Refresh access token

### Authentication (Protected)
- `POST /api/auth/logout` - Logout user (requires authentication)
- `GET /api/auth/me` - Get current user profile (requires authentication)
- `POST /api/auth/verify-token` - Verify if token is valid (optional authentication)

### Users (Protected - Authentication Required)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (User can view own, Admin can view any)
- `PUT /api/users/:id` - Update user (User can update own, Admin can update any)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/:id/profile` - Get user profile (User can view own, Admin can view any)

### Messages (Protected - Authentication Required)
- `GET /api/messages` - Get all messages (with pagination and filters)
- `GET /api/messages/:id` - Get message by ID
- `POST /api/messages` - Send new message
- `PUT /api/messages/:id` - Update message status
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/conversation/:phoneNumber` - Get conversation by phone number

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

## Authentication & Authorization

### JWT Authentication
- Access tokens and refresh tokens are used for authentication
- Tokens are passed in `Authorization` header: `Bearer <token>`
- Access tokens expire (default: 24h), refresh tokens expire (default: 7d)

### Middleware
- `authenticate` - Verifies JWT token and attaches user to request
- `optionalAuthenticate` - Optional authentication (works with or without token)
- `authorize(roles)` - Checks if user has required role(s)
- `isAdmin` - Checks if user is admin
- `isAdminOrUser` - Allows admin and regular users
- `isOwnerOrAdmin` - Checks if user owns resource or is admin

### Role-Based Access Control (RBAC)
- **admin**: Full access to all resources
- **user**: Access to own resources only

See `middleware/README.md` for more details.

## حالة المشروع / Project Status

**الحالة الحالية**: في مرحلة التطوير الأولي (Initial Development Phase)

**ملاحظة**: جميع endpoints حالياً تحتوي على placeholders وتحتاج إلى implementation.

## التطوير / Development

- جميع الملفات تحتوي على TODO comments للإرشاد
- اتبع الـ structure الموجود
- أضف tests عند تطوير features جديدة

