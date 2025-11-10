# تعليمات فتح Pull Request على GitHub
# GitHub Pull Request Instructions

## الخطوات المطلوبة / Required Steps

### 1. إضافة Remote Repository (إذا لم يكن موجوداً)

```bash
git remote add origin <repository-url>
```

مثال:
```bash
git remote add origin https://github.com/username/whatsapp-dashboard.git
```

### 2. Push الفرع إلى GitHub

```bash
git push -u origin feature/init-skeleton
```

### 3. فتح Pull Request على GitHub

#### الطريقة الأولى: عبر واجهة GitHub
1. اذهب إلى المستودع على GitHub
2. ستظهر رسالة تلقائية لفتح PR للفرع `feature/init-skeleton`
3. اضغط على "Compare & pull request"

#### الطريقة الثانية: عبر الرابط المباشر
بعد push، افتح الرابط:
```
https://github.com/<username>/<repository>/compare/main...feature/init-skeleton
```

### 4. تعبئة معلومات PR

**العنوان / Title:**
```
feat(skeleton): project skeleton and docs
```

**الوصف / Description:**
```markdown
إنشاء ملف docs/SKELETON.md وهيكل البنية التحتية الأساسية (docker-compose.yml, .env.example, logs, docs).

هذه الخطوة تمثل التهيئة الأولى للمشروع وفق موافقة SKELETON.md الرسمية.
```

### 5. عمل Merge

بعد مراجعة PR:
1. اضغط على "Merge pull request"
2. اختر "Create a merge commit" أو "Squash and merge"
3. اضغط "Confirm merge"

---

## معلومات الفرع الحالي / Current Branch Info

- **Branch**: `feature/init-skeleton`
- **Commits**: 3
- **Status**: Clean working tree
- **Last Commit**: `5285542` - docs: update REPORT.md and LOG.md with official format

---

## الملفات المُضافة / Added Files

- `docs/SKELETON.md` - مصدر الحقيقة الوحيد
- `docs/README.md` - دليل الوثائق
- `.env.example` - قالب متغيرات البيئة
- `docker-compose.yml` - إعدادات Docker
- `logs/LOG.md` - سجل المشروع
- `REPORT.md` - التقرير الرسمي








