import { useState, useEffect } from 'react';
import { statisticsService } from '../services/statistics.service';
import { messagesService } from '../services/messages.service';
import Layout from '../components/Layout';

const DeliveryStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 5 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadStats, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [period, autoRefresh]);

  const loadStats = async () => {
    try {
      const response = await statisticsService.getDashboard({ period });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading delivery stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!confirm('هل تريد إعادة محاولة إرسال الرسائل الفاشلة؟')) return;

    try {
      setRetrying(true);
      const response = await messagesService.retryFailed();
      alert(`تمت إعادة المحاولة: ${response.data.successful} نجحت، ${response.data.failed} فشلت`);
      await loadStats();
    } catch (error) {
      console.error('Error retrying messages:', error);
      alert('فشلت إعادة المحاولة: ' + (error.response?.data?.message || error.message));
    } finally {
      setRetrying(false);
    }
  };

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center min-h-screen">
          <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }

  const messageStats = stats?.messages?.by_status || {};
  const totalSent = stats?.messages?.outgoing || 0;
  const delivered = messageStats.delivered || 0;
  const read = messageStats.read || 0;
  const failed = messageStats.failed || 0;
  const sent = messageStats.sent || 0;

  const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : 0;
  const readRate = delivered > 0 ? ((read / delivered) * 100).toFixed(1) : 0;
  const failureRate = totalSent > 0 ? ((failed / totalSent) * 100).toFixed(1) : 0;

  return (
    <Layout>
      <div className="flex-1 bg-whatsapp-dark-bg flex flex-col min-h-screen">
        {/* Header */}
        <div className="h-16 bg-whatsapp-dark-hover px-6 flex items-center justify-between border-b border-whatsapp-border">
          <div>
            <h1 className="text-xl font-bold text-whatsapp-text-primary">إحصائيات التسليم في الوقت الفعلي</h1>
            <p className="text-sm text-whatsapp-text-secondary mt-1">
              مراقبة حالة تسليم الرسائل في الوقت الفعلي بينما يشاهد العملاء ويتفاعلون مع المحتوى الخاص بك. إعادة المحاولة التلقائية للرسائل الفاشلة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-whatsapp-green bg-whatsapp-input-bg border-whatsapp-border rounded"
              />
              <span className="text-sm text-whatsapp-text-secondary">تحديث تلقائي</span>
            </label>
            <div className="flex gap-2">
              {['today', 'week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    period === p
                      ? 'bg-whatsapp-green text-white'
                      : 'text-whatsapp-text-secondary hover:bg-whatsapp-dark-panel'
                  }`}
                >
                  {p === 'today' ? 'اليوم' : p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : 'سنة'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
              <h3 className="text-sm text-whatsapp-text-secondary mb-2">إجمالي المرسلة</h3>
              <p className="text-3xl font-bold text-whatsapp-text-primary">{totalSent}</p>
            </div>
            <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
              <h3 className="text-sm text-whatsapp-text-secondary mb-2">تم التسليم</h3>
              <p className="text-3xl font-bold text-green-400">{delivered}</p>
              <p className="text-xs text-whatsapp-text-tertiary mt-1">{deliveryRate}%</p>
            </div>
            <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
              <h3 className="text-sm text-whatsapp-text-secondary mb-2">تمت القراءة</h3>
              <p className="text-3xl font-bold text-blue-400">{read}</p>
              <p className="text-xs text-whatsapp-text-tertiary mt-1">{readRate}%</p>
            </div>
            <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
              <h3 className="text-sm text-whatsapp-text-secondary mb-2">فشل التسليم</h3>
              <p className="text-3xl font-bold text-red-400">{failed}</p>
              <p className="text-xs text-whatsapp-text-tertiary mt-1">{failureRate}%</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h2 className="text-lg font-semibold text-whatsapp-text-primary mb-4">تفصيل الحالات</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-whatsapp-text-primary">مرسلة</span>
                </div>
                <span className="text-sm font-semibold text-whatsapp-text-primary">{sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm text-whatsapp-text-primary">تم التسليم</span>
                </div>
                <span className="text-sm font-semibold text-green-400">{delivered}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-whatsapp-text-primary">تمت القراءة</span>
                </div>
                <span className="text-sm font-semibold text-blue-400">{read}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm text-whatsapp-text-primary">فشل التسليم</span>
                </div>
                <span className="text-sm font-semibold text-red-400">{failed}</span>
              </div>
            </div>
          </div>

          {/* Failed Messages Retry */}
          {failed > 0 && (
            <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-red-300 mb-1">
                    رسائل فاشلة تحتاج إلى إعادة المحاولة
                  </h3>
                  <p className="text-xs text-red-200">
                    {failed} رسالة فشلت في التسليم. سيتم إعادة المحاولة تلقائياً
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  {retrying ? 'جاري إعادة المحاولة...' : 'إعادة المحاولة الآن'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryStatsPage;

