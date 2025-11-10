# إعداد Render - WhatsApp Dashboard
# Render Configuration for WhatsApp Dashboard

## 🌐 معلومات الاستضافة

**Production URL**: https://whatsapp-dashboard-encw.onrender.com

**Webhook URL**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook

**Health Check**: https://whatsapp-dashboard-encw.onrender.com/health

---

## ⚙️ إعداد Render Dashboard

### 1. Environment Variables

في Render Dashboard → Environment Variables، أضف:

```env
NODE_ENV=production
PORT=10000

META_VERIFY_TOKEN=12345
META_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_PHONE_ID=898585676675763

WHATSAPP_ACCESS_TOKEN=EAAarprhgeNsBPx3AFbYfaEo92HUVCIiiTRnWy6GUSl4rAkvFbkORGtnM1z0KdokexC93rwfuZBf5UXRyZCoAeTBVELZBuGJKFVQvzSIyTAALLnTnvugXd3ZAliM9u25sqShH5uEwYAOf8vEBl1GphsPV3noSDqsQZCJXCbzZC99wqEPd6qHoQiCmpXne7A4RZASEAZDZD
WHATSAPP_WEBHOOK_SECRET=12345
WHATSAPP_PHONE_NUMBER_ID=898585676675763

JWT_SECRET=your_production_jwt_secret_here
JWT_EXPIRES_IN=24h

CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Build & Start Commands

**Build Command**:
```bash
cd backend && npm install
```

**Start Command**:
```bash
cd backend && npm start
```

**Root Directory**: `backend`

### 3. Auto-Deploy

- ✅ Enable Auto-Deploy from GitHub
- ✅ Branch: `main` (أو الفرع المطلوب)
- ✅ Deploy on every push

---

## 🔗 إعداد Webhook في Meta Developer Console

### الخطوات:

1. **الذهاب إلى Meta Developer Console**:
   - https://developers.facebook.com/
   - WhatsApp > Configuration

2. **إعداد Webhook**:
   - **Callback URL**: `https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook`
   - **Verify Token**: `12345`
   - **Subscribe to**: `messages`

3. **التحقق**:
   - اضغط "Verify and Save"
   - يجب أن يظهر ✅

---

## 🧪 اختبار Webhook

### اختبار التحقق:
```bash
curl "https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
```

**يجب أن يعيد**: `TEST`

### استخدام Test Script:
```bash
node test-render-webhook.js
```

---

## 📊 Monitoring

### Render Logs
- Render Dashboard → Service → Logs
- عرض جميع logs في الوقت الفعلي

### Health Checks
- Render يتحقق تلقائياً من `/health`
- إذا فشل، Render يعيد تشغيل Service

---

## ✅ Checklist

- [ ] Environment Variables مُعدة في Render
- [ ] Build Command صحيح
- [ ] Start Command صحيح
- [ ] Root Directory مُعد (`backend`)
- [ ] Service يعمل على Render
- [ ] Health Check يعمل
- [ ] Webhook verification يعمل
- [ ] Webhook مُعد في Meta Developer Console
- [ ] Webhook Status: ✅ Subscribed
- [ ] تم اختبار إرسال الرسائل

---

## 🔗 الروابط

- **Render Dashboard**: https://dashboard.render.com/
- **Production**: https://whatsapp-dashboard-encw.onrender.com
- **Webhook**: https://whatsapp-dashboard-encw.onrender.com/api/whatsapp/webhook
- **Meta Console**: https://developers.facebook.com/





