# Middleware Directory

## نظرة عامة / Overview

هذا المجلد يحتوي على middleware functions للمصادقة والتفويض.

This directory contains middleware functions for authentication and authorization.

## الملفات / Files

### index.js
ملف التجميع الرئيسي الذي يصدر جميع middleware functions.

Main aggregation file that exports all middleware functions.

### auth.middleware.js
Authentication middleware:
- `authenticate` - التحقق من JWT token وإرفاق user data بالطلب
- `optionalAuthenticate` - التحقق الاختياري من JWT token

### role.middleware.js
Role-Based Access Control (RBAC) middleware:
- `authorize(roles)` - التحقق من صلاحيات المستخدم بناءً على الأدوار
- `isAdmin` - التحقق من أن المستخدم هو admin
- `isAdminOrUser` - السماح للمستخدمين العاديين والـ admin
- `isOwnerOrAdmin` - التحقق من أن المستخدم يملك المورد أو هو admin

## الاستخدام / Usage

### Authentication Middleware

```javascript
const { authenticate } = require('../middleware');

// Protect a route
router.get('/protected', authenticate, (req, res) => {
  // req.user contains decoded user data from JWT
  res.json({ user: req.user });
});
```

### Authorization Middleware

```javascript
const { authorize, isAdmin } = require('../middleware');

// Protect route for admin only
router.delete('/users/:id', authenticate, isAdmin, (req, res) => {
  // Only admins can access this route
});

// Protect route for specific roles
router.get('/reports', authenticate, authorize(['admin', 'supervisor']), (req, res) => {
  // Only admins and supervisors can access
});
```

### Combining Middleware

```javascript
// Authentication + Authorization
router.put('/users/:id', authenticate, authorize('admin'), updateUser);

// Optional authentication
router.get('/public-data', optionalAuthenticate, (req, res) => {
  // Works with or without authentication
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

## ملاحظات / Notes

- جميع middleware functions حالياً تحتوي على placeholders
- يجب استخدام `authenticate` قبل `authorize` في routes
- JWT token يجب أن يكون في header: `Authorization: Bearer <token>`
- بعد التحقق من JWT، يتم إرفاق user data إلى `req.user`

## TODO

- [ ] تنفيذ JWT token verification
- [ ] إضافة token expiration handling
- [ ] إضافة token refresh mechanism
- [ ] إضافة rate limiting middleware
- [ ] إضافة request validation middleware
