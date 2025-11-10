# تعليمات المصادقة على GitHub
# GitHub Authentication Instructions

## الطريقة 1: المصادقة عبر المتصفح (موصى بها)

عند تنفيذ `git push`، سيتم فتح المتصفح تلقائياً:
1. سجّل دخولك إلى GitHub
2. وافق على الصلاحيات المطلوبة
3. بعد المصادقة، سيكمل Git عملية Push تلقائياً

---

## الطريقة 2: استخدام Personal Access Token

إذا لم تعمل المصادقة عبر المتصفح:

### 1. إنشاء Personal Access Token
1. اذهب إلى: https://github.com/settings/tokens
2. اضغط على "Generate new token" → "Generate new token (classic)"
3. أعطِ الـ token اسماً (مثلاً: "WhatsApp Dashboard")
4. اختر الصلاحيات:
   - ✅ `repo` (Full control of private repositories)
5. اضغط "Generate token"
6. **انسخ الـ Token فوراً** (لن تتمكن من رؤيته مرة أخرى)

### 2. استخدام الـ Token في Push
عند تنفيذ `git push`، سيطلب منك:
- **Username**: اسم المستخدم على GitHub
- **Password**: الصق الـ Personal Access Token هنا (وليس كلمة المرور)

أو استخدم الأمر مع الـ Token مباشرة:
```bash
git push https://<YOUR_TOKEN>@github.com/salimsaeed44/Whatsapp-Dashboard.git feature/init-skeleton
```

---

## الطريقة 3: استخدام SSH (طويلة المدى)

### 1. إنشاء SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 2. إضافة SSH Key إلى GitHub
1. انسخ محتوى الملف: `~/.ssh/id_ed25519.pub`
2. اذهب إلى: https://github.com/settings/keys
3. اضغط "New SSH key"
4. الصق المفتاح واحفظ

### 3. تغيير Remote إلى SSH
```bash
git remote set-url origin git@github.com:salimsaeed44/Whatsapp-Dashboard.git
```

---

## معلومات المستودع الحالي

- **Repository**: https://github.com/salimsaeed44/Whatsapp-Dashboard
- **Branch**: feature/init-skeleton
- **Remote**: origin (HTTPS)








