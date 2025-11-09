# 🔧 إعداد CORS - CORS Configuration

## 📋 الحالة الحالية

الآن `server.js` يستخدم:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

هذا يعمل بشكل جيد، لكن إذا أردت دعم عدة origins (محلي + Render)، يمكن التحديث.

---

## 🔄 التحديث لدعم Multiple Origins

### تحديث `backend/server.js`

استبدل قسم CORS بـ:

```javascript
// CORS configuration - Support multiple origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Environment Variable

في `.env` أو Render Environment Variables:

```env
# Single origin
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com

# Multiple origins (separated by comma)
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com,http://localhost:5173,http://localhost:3000
```

---

## ✅ الخيار البسيط (الموصى به)

إذا كنت تستخدم Render فقط، يمكنك البقاء على الإعداد الحالي وتحديث `CORS_ORIGIN` فقط:

```env
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com
```

هذا يعمل بشكل جيد ولا يحتاج تعديل في الكود.

---

## 🧪 اختبار CORS

### اختبار محلي:

```bash
# في PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api" -Headers @{"Origin"="http://localhost:5173"} -Method OPTIONS
```

### اختبار على Render:

```bash
curl -H "Origin: https://whatsapp-dashboard-frontend.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://whatsapp-dashboard-encw.onrender.com/api
```

يجب أن ترى `Access-Control-Allow-Origin` في Response headers.

---

## 📝 ملاحظات

1. **Production**: استخدم فقط Frontend URL في Production
2. **Development**: يمكن إضافة `http://localhost:5173` للاختبار المحلي
3. **Security**: لا تستخدم `*` في Production
4. **Credentials**: يجب أن يكون `true` إذا كنت تستخدم cookies/tokens

---

**آخر تحديث / Last Updated**: 2025-01-17

