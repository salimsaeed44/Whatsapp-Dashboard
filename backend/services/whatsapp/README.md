# WhatsApp Service

## نظرة عامة / Overview

خدمة التكامل مع WhatsApp Business Cloud API. تتضمن معالجة Webhooks وإرسال الرسائل.

WhatsApp Business Cloud API integration service. Includes webhook handling and message sending.

## الهيكل / Structure

```
whatsapp/
├── webhook.handler.js    # معالجة Webhooks الواردة
├── message.sender.js     # إرسال الرسائل
├── whatsapp.service.js   # الخدمة الرئيسية الموحدة
└── README.md            # هذا الملف
```

## الملفات / Files

### webhook.handler.js
معالجة Webhooks من Meta:
- `verifyWebhook(req, res)` - التحقق من Webhook أثناء الإعداد
- `handleWebhook(req, res)` - معالجة الأحداث الواردة
- `handleIncomingMessage(message, value)` - معالجة الرسائل الواردة
- `handleMessageStatus(status)` - معالجة تحديثات حالة الرسالة

### message.sender.js
إرسال الرسائل عبر WhatsApp Cloud API:
- `sendTextMessage(to, text, options)` - إرسال رسالة نصية
- `sendImageMessage(to, imageUrl, caption, options)` - إرسال صورة
- `sendDocumentMessage(to, documentUrl, filename, caption, options)` - إرسال مستند
- `sendLocationMessage(to, latitude, longitude, name, address)` - إرسال موقع
- `markAsRead(messageId)` - تحديد الرسالة كمقروءة

### whatsapp.service.js
الخدمة الرئيسية الموحدة:
- واجهة موحدة لجميع عمليات WhatsApp
- Singleton pattern
- إدارة الإعدادات والتكوين

## الاستخدام / Usage

### في Routes

```javascript
const whatsappService = require('../services/whatsapp/whatsapp.service');

// Webhook verification
router.get('/webhook', (req, res) => {
  whatsappService.verifyWebhook(req, res);
});

// Webhook handler
router.post('/webhook', (req, res) => {
  whatsappService.handleWebhook(req, res);
});

// Send message
router.post('/send', authenticate, async (req, res) => {
  const result = await whatsappService.sendTextMessage(
    req.body.phoneNumber,
    req.body.message
  );
  res.json(result);
});
```

### في Controllers

```javascript
const whatsappService = require('../services/whatsapp/whatsapp.service');

// Send message
const sendMessage = async (req, res) => {
  try {
    const result = await whatsappService.sendTextMessage(
      req.body.phoneNumber,
      req.body.message
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Environment Variables

Required environment variables:
- `META_VERIFY_TOKEN` - Token للتحقق من Webhook
- `META_ACCESS_TOKEN` - Access Token للوصول إلى WhatsApp API
- `WHATSAPP_PHONE_ID` - Phone Number ID من Meta

Alternative variable names (for backward compatibility):
- `WHATSAPP_WEBHOOK_SECRET` - بديل لـ META_VERIFY_TOKEN
- `WHATSAPP_ACCESS_TOKEN` - بديل لـ META_ACCESS_TOKEN
- `WHATSAPP_PHONE_NUMBER_ID` - بديل لـ WHATSAPP_PHONE_ID

## Webhook Setup

1. Configure webhook URL in Meta Developer Console:
   - URL: `https://your-domain.com/api/whatsapp/webhook`
   - Verify Token: قيمة `META_VERIFY_TOKEN`
   - Subscribe to: `messages`, `message_status`

2. Webhook will be verified automatically when Meta sends GET request

## Message Types

### Text Message
```javascript
await whatsappService.sendTextMessage(
  '1234567890',  // phone number
  'Hello!',      // message text
  {              // options
    preview_url: true,
    context: { message_id: 'previous_message_id' }
  }
);
```

### Image Message
```javascript
await whatsappService.sendImageMessage(
  '1234567890',
  'https://example.com/image.jpg',
  'Caption text'
);
```

### Document Message
```javascript
await whatsappService.sendDocumentMessage(
  '1234567890',
  'https://example.com/document.pdf',
  'document.pdf',
  'Document caption'
);
```

### Location Message
```javascript
await whatsappService.sendLocationMessage(
  '1234567890',
  24.7136,   // latitude
  46.6753,   // longitude
  'Location Name',
  'Location Address'
);
```

## Webhook Events

### Incoming Messages
- Text messages
- Image messages
- Video messages
- Audio messages
- Document messages
- Location messages
- Contact messages

### Status Updates
- `sent` - Message sent successfully
- `delivered` - Message delivered to recipient
- `read` - Message read by recipient
- `failed` - Message failed to send

## Error Handling

جميع الدوال تحتوي على error handling:
- Logging للأخطاء
- Throw errors للتعامل معها في upper layers
- Response format موحد للأخطاء

## TODO

- [ ] ربط مع قاعدة البيانات لحفظ الرسائل
- [ ] إضافة retry mechanism للإرسال الفاشل
- [ ] إضافة rate limiting
- [ ] إضافة media upload functionality
- [ ] إضافة template messages support
- [ ] إضافة interactive messages support

## ملاحظات / Notes

- جميع الدوال حالياً تحتوي على placeholders للربط مع قاعدة البيانات
- يجب إضافة axios package في package.json
- Webhook يجب أن يستجيب خلال 20 ثانية
- الرسائل يجب أن تكون في format صحيح حسب WhatsApp API requirements







