import { useState, useEffect } from 'react';
import { statisticsService } from '../../services/statistics.service';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today'); // today, week, month, year

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticsService.getDashboard({ period });
      setStats(response.data || response);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center">
        <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-whatsapp-dark-bg flex flex-col">
      {/* Header */}
      <div className="h-16 bg-whatsapp-dark-hover px-4 flex items-center justify-between border-b border-whatsapp-border">
        <h2 className="text-lg font-semibold text-whatsapp-text-primary">الإحصائيات</h2>
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

      {/* Statistics Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h3 className="text-sm text-whatsapp-text-secondary mb-2">إجمالي المحادثات</h3>
            <p className="text-3xl font-bold text-whatsapp-text-primary">
              {stats?.conversations?.total || 0}
            </p>
          </div>
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h3 className="text-sm text-whatsapp-text-secondary mb-2">المحادثات المفتوحة</h3>
            <p className="text-3xl font-bold text-green-400">
              {stats?.conversations?.open || 0}
            </p>
          </div>
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h3 className="text-sm text-whatsapp-text-secondary mb-2">إجمالي الرسائل</h3>
            <p className="text-3xl font-bold text-blue-400">
              {stats?.messages?.total || 0}
            </p>
          </div>
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h3 className="text-sm text-whatsapp-text-secondary mb-2">الرسائل المرسلة</h3>
            <p className="text-3xl font-bold text-whatsapp-green">
              {stats?.messages?.sent || 0}
            </p>
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h3 className="text-lg font-semibold text-whatsapp-text-primary mb-4">
              أداء الموظفين
            </h3>
            {/* Employee performance list */}
            <div className="space-y-2">
              {stats?.employees?.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between">
                  <span className="text-sm text-whatsapp-text-primary">
                    {emp.name || emp.email}
                  </span>
                  <span className="text-sm text-whatsapp-text-secondary">
                    {emp.conversations_count || 0} محادثة
                  </span>
                </div>
              )) || (
                <p className="text-sm text-whatsapp-text-secondary">لا توجد بيانات</p>
              )}
            </div>
          </div>

          <div className="bg-whatsapp-dark-panel rounded-lg p-4 border border-whatsapp-border">
            <h3 className="text-lg font-semibold text-whatsapp-text-primary mb-4">
              المحادثات المتأخرة
            </h3>
            <p className="text-3xl font-bold text-red-400">
              {stats?.conversations?.overdue || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

