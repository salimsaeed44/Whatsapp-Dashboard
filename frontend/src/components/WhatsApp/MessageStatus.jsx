/**
 * MessageStatus Component
 * Displays message delivery status indicators (✓, ✓✓, ✓✓ blue)
 * Similar to WhatsApp status indicators
 */

const MessageStatus = ({ status, direction }) => {
  // Only show status for outgoing messages
  if (direction !== 'outgoing' && direction !== 'outbound') {
    return null;
  }

  // Map status to indicator
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        // Single gray checkmark (✓)
        return (
          <span className="text-gray-400 dark:text-gray-500" title="تم الإرسال" style={{ fontSize: '16px', lineHeight: '1' }}>
            ✓
          </span>
        );
      case 'delivered':
        // Double gray checkmarks (✓✓)
        return (
          <span className="text-gray-400 dark:text-gray-500" title="تم التسليم" style={{ fontSize: '16px', lineHeight: '1' }}>
            ✓✓
          </span>
        );
      case 'read':
        // Double blue checkmarks (✓✓) - WhatsApp blue color
        return (
          <span className="text-blue-500 dark:text-blue-400" title="تمت القراءة" style={{ fontSize: '16px', lineHeight: '1' }}>
            ✓✓
          </span>
        );
      case 'failed':
        // Red X or error indicator
        return (
          <span className="text-red-500 dark:text-red-400" title="فشل الإرسال" style={{ fontSize: '14px', lineHeight: '1' }}>
            ✗
          </span>
        );
      default:
        // Default to sent status (single checkmark)
        return (
          <span className="text-gray-400 dark:text-gray-500" title="تم الإرسال" style={{ fontSize: '16px', lineHeight: '1' }}>
            ✓
          </span>
        );
    }
  };

  return (
    <span className="inline-flex items-center text-xs ml-1" style={{ display: 'inline-flex', alignItems: 'center' }}>
      {getStatusIcon()}
    </span>
  );
};

export default MessageStatus;

