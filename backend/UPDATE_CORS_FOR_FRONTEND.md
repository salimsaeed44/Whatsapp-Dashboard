# 🔧 تحديث CORS لدعم Frontend على Render

## 📋 الخطوات

### 1. تحديث CORS_ORIGIN في Backend

في Render Dashboard → Backend Service → Environment Variables، أضف/حدّث:

```env
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com
```

أو لعدة domains (محلي + Render):

```env
CORS_ORIGIN=https://whatsapp-dashboard-frontend.onrender.com,http://localhost:5173
```

### 2. تحديث Backend Code (اختياري)

إذا أردت دعم multiple origins، يمكن تحديث `backend/server.js`:

```javascript
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 3. إعادة تشغيل Backend

بعد تحديث Environment Variables:
1. اذهب إلى Render Dashboard
2. Backend Service → Manual Deploy → Clear build cache & deploy
3. أو انتظر Auto-deploy إذا كان مفعّل

### 4. التحقق من CORS

افتح Browser Console في Frontend وتحقق من:
- ✅ لا توجد أخطاء CORS
- ✅ API requests تنجح
- ✅ البيانات تظهر في Frontend

---

## 🧪 اختبار CORS

### باستخدام curl:

```bash
curl -H "Origin: https://whatsapp-dashboard-frontend.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://whatsapp-dashboard-encw.onrender.com/api
```

يجب أن ترى `Access-Control-Allow-Origin` في Response headers.

---

## 📝 ملاحظات

1. **CORS_ORIGIN**: يجب أن يحتوي على Frontend URL الكامل (مع https://)
2. **Multiple Origins**: يمكن فصلها بفواصل (`,`)
3. **Credentials**: يجب أن يكون `true` إذا كنت تستخدم cookies/tokens
4. **Wildcards**: لا تستخدم `*` في Production لأسباب أمنية

---

**آخر تحديث / Last Updated**: 2025-01-17

